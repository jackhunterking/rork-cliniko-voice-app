import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  User,
  Key,
  HelpCircle,
  LogOut,
  ChevronRight,
  Lightbulb,
  Trash2,
  RefreshCw,
  Bug,
  Clock,
} from 'lucide-react-native';
import { colors, spacing, radius } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { useClinikoUser, useClinikoCache } from '@/hooks/useCliniko';
import { useUsageStats } from '@/hooks/useUsageStats';

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
  statusDot?: 'green' | 'red';
  disabled?: boolean;
}

function MenuItem({ 
  icon, 
  label, 
  subtitle,
  onPress, 
  showChevron = true, 
  destructive = false,
  statusDot,
  disabled = false,
}: MenuItemProps) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, disabled && styles.menuItemDisabled]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View style={styles.menuItemLeft}>
        {icon}
        <View style={styles.menuItemTextContainer}>
          <Text style={[styles.menuItemLabel, destructive && styles.destructiveText]}>
            {label}
          </Text>
          {subtitle && (
            <View style={styles.subtitleRow}>
              {statusDot && (
                <View style={[
                  styles.statusDot,
                  statusDot === 'green' ? styles.statusDotGreen : styles.statusDotRed
                ]} />
              )}
              <Text style={styles.menuItemSubtitle}>{subtitle}</Text>
            </View>
          )}
        </View>
      </View>
      {showChevron && <ChevronRight size={20} color={colors.textSecondary} />}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, signOut, hasClinikoKey } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  // Fetch Cliniko user info
  const { 
    data: clinikoUser, 
    isLoading: isLoadingClinikoUser,
    refetch: refetchClinikoUser,
    isRefetching: isRefetchingClinikoUser,
  } = useClinikoUser({
    enabled: hasClinikoKey,
  });

  const clinikoCache = useClinikoCache();
  
  // Fetch usage stats
  const { totalMinutes, isLoading: isLoadingUsageStats } = useUsageStats();

  // Get user display info
  const supabaseDisplayName = user?.user_metadata?.full_name || 'User';
  const supabaseDisplayEmail = user?.email || '';

  // Cliniko display info
  const clinikoDisplayName = clinikoUser 
    ? `${clinikoUser.first_name} ${clinikoUser.last_name}`.trim()
    : null;
  const clinikoDisplayEmail = clinikoUser?.email || null;

  // Determine which name/email to show in profile card
  const displayName = clinikoDisplayName || supabaseDisplayName;
  const displayEmail = clinikoDisplayEmail || supabaseDisplayEmail;

  const handleRefreshClinikoData = async () => {
    if (!hasClinikoKey) return;
    
    try {
      await refetchClinikoUser();
      clinikoCache.invalidateAll();
    } catch (error) {
      console.error('Failed to refresh Cliniko data:', error);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Your Cliniko API key will also be removed from this device.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setIsSigningOut(true);
            try {
              await signOut();
              // Navigation is handled by AuthGuard
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } finally {
              setIsSigningOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity 
          style={styles.profileCard}
          activeOpacity={0.7}
          onPress={() => console.log('Profile details')}
        >
          <View style={styles.avatar}>
            <User size={28} color={colors.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{displayEmail}</Text>
            {clinikoDisplayName && supabaseDisplayEmail !== clinikoDisplayEmail && (
              <Text style={styles.profileSecondaryEmail}>
                Supabase: {supabaseDisplayEmail}
              </Text>
            )}
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Usage</Text>
          <View style={styles.menuCard}>
            <View style={styles.usageRow}>
              <Clock size={20} color={colors.textSecondary} />
              <View style={styles.usageContent}>
                <Text style={styles.usageLabel}>Total Recorded</Text>
                {isLoadingUsageStats ? (
                  <ActivityIndicator size="small" color={colors.textSecondary} />
                ) : (
                  <Text style={styles.usageValue}>{totalMinutes} minutes</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliniko</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon={<Key size={20} color={colors.textSecondary} />}
              label="Cliniko API Key"
              subtitle={hasClinikoKey ? "Connected" : "Not connected"}
              statusDot={hasClinikoKey ? "green" : "red"}
              onPress={() => router.push('/settings/api-key')}
            />
            {hasClinikoKey && (
              <>
                <View style={styles.separator} />
                <View style={styles.clinikoInfoRow}>
                  <View style={styles.clinikoInfoContent}>
                    <Text style={styles.clinikoInfoLabel}>Cliniko Account</Text>
                    {isLoadingClinikoUser ? (
                      <ActivityIndicator size="small" color={colors.textSecondary} />
                    ) : clinikoUser ? (
                      <View>
                        <Text style={styles.clinikoInfoValue}>
                          {clinikoUser.first_name} {clinikoUser.last_name}
                        </Text>
                        <Text style={styles.clinikoInfoEmail}>
                          {clinikoUser.email}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.clinikoInfoError}>
                        Could not load account info
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={handleRefreshClinikoData}
                    style={styles.refreshButton}
                    disabled={isRefetchingClinikoUser}
                  >
                    <RefreshCw 
                      size={18} 
                      color={colors.primary}
                      style={isRefetchingClinikoUser ? styles.spinning : undefined}
                    />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon={<HelpCircle size={20} color={colors.textSecondary} />}
              label="Help & Support"
              onPress={() => router.push('/settings/help')}
            />
            <View style={styles.separator} />
            <MenuItem
              icon={<Lightbulb size={20} color={colors.textSecondary} />}
              label="Request a feature"
              onPress={() => router.push('/settings/feature-request')}
            />
            <View style={styles.separator} />
            <MenuItem
              icon={<Bug size={20} color={colors.textSecondary} />}
              label="Diagnostics"
              subtitle="Debug info & connection test"
              onPress={() => router.push('/settings/diagnostics')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon={<Trash2 size={20} color={colors.textSecondary} />}
              label="Delete my data"
              onPress={() => router.push('/settings/delete-data')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.menuCard}>
            <MenuItem
              icon={isSigningOut ? (
                <ActivityIndicator size={20} color={colors.error} />
              ) : (
                <LogOut size={20} color={colors.error} />
              )}
              label={isSigningOut ? "Signing out..." : "Sign out"}
              onPress={handleSignOut}
              showChevron={false}
              destructive
              disabled={isSigningOut}
            />
          </View>
        </View>

        <Text style={styles.version}>Cliniko Voice v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingTop: spacing.md,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  profileSecondaryEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  menuCard: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
  },
  menuItemDisabled: {
    opacity: 0.6,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemTextContainer: {
    marginLeft: spacing.sm + 4,
    flex: 1,
  },
  menuItemLabel: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 1,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusDotGreen: {
    backgroundColor: colors.success,
  },
  statusDotRed: {
    backgroundColor: colors.error,
  },
  destructiveText: {
    color: colors.error,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: spacing.md + 20 + spacing.sm + 4,
  },
  version: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  clinikoInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
  },
  clinikoInfoContent: {
    flex: 1,
  },
  clinikoInfoLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  clinikoInfoValue: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500' as const,
  },
  clinikoInfoEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  clinikoInfoError: {
    fontSize: 14,
    color: colors.error,
    fontStyle: 'italic',
  },
  refreshButton: {
    padding: spacing.sm,
  },
  spinning: {
    opacity: 0.5,
  },
  usageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    gap: spacing.sm + 4,
  },
  usageContent: {
    flex: 1,
  },
  usageLabel: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  usageValue: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
