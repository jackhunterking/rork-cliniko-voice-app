import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  User,
  Key,
  HelpCircle,
  LogOut,
  ChevronRight,
  Lightbulb,
  Trash2,
} from 'lucide-react-native';
import { colors, spacing, radius } from '@/constants/colors';

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
  statusDot?: 'green' | 'red';
}

function MenuItem({ 
  icon, 
  label, 
  subtitle,
  onPress, 
  showChevron = true, 
  destructive = false,
  statusDot,
}: MenuItemProps) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
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

  const handleSignOut = () => {
    console.log('Sign Out');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerLargeTitle: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
        }}
      />
      
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
            <Text style={styles.profileName}>Dr. Sarah Mitchell</Text>
            <Text style={styles.profileEmail}>sarah.mitchell@clinic.com</Text>
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliniko</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon={<Key size={20} color={colors.textSecondary} />}
              label="Cliniko API Key"
              subtitle="Connected"
              statusDot="green"
              onPress={() => router.push('/settings/api-key' as any)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon={<HelpCircle size={20} color={colors.textSecondary} />}
              label="Help & Support"
              onPress={() => router.push('/settings/help' as any)}
            />
            <View style={styles.separator} />
            <MenuItem
              icon={<Lightbulb size={20} color={colors.textSecondary} />}
              label="Request a feature"
              onPress={() => router.push('/settings/feature-request' as any)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon={<Trash2 size={20} color={colors.textSecondary} />}
              label="Delete my data"
              onPress={() => router.push('/settings/delete-data' as any)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.menuCard}>
            <MenuItem
              icon={<LogOut size={20} color={colors.error} />}
              label="Sign out"
              onPress={handleSignOut}
              showChevron={false}
              destructive
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
});
