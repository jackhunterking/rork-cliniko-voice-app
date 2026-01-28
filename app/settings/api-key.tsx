import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eye, EyeOff, ChevronDown, Check, Globe } from 'lucide-react-native';
import { colors, spacing, radius } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { useClinikoUser, useClinikoCache } from '@/hooks/useCliniko';
import {
  getClinikoApiKey,
  getClinikoShard,
  saveClinikoCredentialsWithBackup,
  clearAllClinikoData,
  deleteCredentialsFromBackend,
} from '@/lib/secure-storage';
import {
  validateClinikoCredentials,
  CLINIKO_SHARDS,
  ClinikoShard,
  ClinikoShardConfig,
} from '@/services/cliniko';

export default function ApiKeyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { refreshClinikoKeyStatus, hasClinikoKey, user } = useAuth();
  const clinikoCache = useClinikoCache();
  
  const [apiKey, setApiKey] = useState('');
  const [selectedShard, setSelectedShard] = useState<ClinikoShardConfig>(CLINIKO_SHARDS[0]);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showShardPicker, setShowShardPicker] = useState(false);

  // Fetch Cliniko user info if connected
  const { data: clinikoUser, isLoading: isLoadingUser } = useClinikoUser({
    enabled: hasClinikoKey,
  });

  // Load existing credentials on mount
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const existingKey = await getClinikoApiKey();
        const existingShard = await getClinikoShard();
        
        if (existingKey) {
          setApiKey(existingKey);
        }
        
        if (existingShard) {
          const shardConfig = CLINIKO_SHARDS.find(s => s.id === existingShard);
          if (shardConfig) {
            setSelectedShard(shardConfig);
          }
        }
      } catch (error) {
        console.error('Failed to load credentials:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCredentials();
  }, []);

  const maskedKey = apiKey ? '•'.repeat(Math.min(apiKey.length, 32)) : '';

  const handleUpdateKey = async () => {
    const trimmedKey = apiKey.trim();
    
    if (!trimmedKey) {
      Alert.alert('Error', 'Please enter an API key');
      return;
    }

    if (trimmedKey.length < 20) {
      Alert.alert('Error', 'This doesn\'t look like a valid Cliniko API key');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'You must be signed in to update the API key');
      return;
    }

    setIsSaving(true);
    
    try {
      // Validate the credentials first
      const validation = await validateClinikoCredentials(trimmedKey, selectedShard.id);
      
      if (!validation.valid) {
        Alert.alert('Invalid Credentials', 'The API key or region is incorrect. Please check and try again.');
        return;
      }

      // Save credentials (also syncs to backend)
      await saveClinikoCredentialsWithBackup(trimmedKey, selectedShard.id, user.id);
      
      // Clear cached Cliniko data and refetch
      clinikoCache.clearAll();
      await refreshClinikoKeyStatus();
      
      Alert.alert('Success', `API key updated successfully. Connected as ${validation.user?.firstName} ${validation.user?.lastName}`);
    } catch (error) {
      console.error('Failed to update credentials:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          Alert.alert('Error', 'Invalid API key. Please check your key and selected region.');
        } else {
          Alert.alert('Error', error.message || 'Failed to update credentials. Please try again.');
        }
      } else {
        Alert.alert('Error', 'Failed to update credentials. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Cliniko',
      'Are you sure you want to remove your Cliniko API key? You\'ll need to enter it again to use the app.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            setIsDisconnecting(true);
            try {
              // Clear all Cliniko data locally
              await clearAllClinikoData();
              
              // Delete from backend (fire and forget)
              deleteCredentialsFromBackend().catch((err) => {
                console.warn('Failed to delete from backend:', err);
              });
              
              // Clear cache
              clinikoCache.clearAll();
              
              await refreshClinikoKeyStatus();
              
              // Navigate to connect screen
              router.replace('/connect-cliniko');
            } catch (error) {
              console.error('Failed to disconnect:', error);
              Alert.alert('Error', 'Failed to disconnect. Please try again.');
              setIsDisconnecting(false);
            }
          },
        },
      ]
    );
  };

  const handleSelectShard = (shard: ClinikoShardConfig) => {
    setSelectedShard(shard);
    setShowShardPicker(false);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Stack.Screen
          options={{
            title: 'Cliniko API Key',
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.background },
          }}
        />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Cliniko API Key',
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
        {/* Connection Status Card */}
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status</Text>
            <View style={styles.statusValue}>
              <View style={[
                styles.statusDot,
                hasClinikoKey ? styles.statusDotConnected : styles.statusDotDisconnected
              ]} />
              <Text style={styles.statusText}>
                {hasClinikoKey ? 'Connected' : 'Not connected'}
              </Text>
            </View>
          </View>
          
          {hasClinikoKey && clinikoUser && (
            <View style={styles.connectedInfo}>
              <Text style={styles.connectedLabel}>Connected as</Text>
              <Text style={styles.connectedName}>
                {clinikoUser.first_name} {clinikoUser.last_name}
              </Text>
              <Text style={styles.connectedEmail}>{clinikoUser.email}</Text>
            </View>
          )}
          
          {hasClinikoKey && isLoadingUser && (
            <View style={styles.connectedInfo}>
              <ActivityIndicator size="small" color={colors.textSecondary} />
            </View>
          )}
          
          <Text style={styles.statusDescription}>
            Used to load patients and templates from your Cliniko account.
          </Text>
        </View>

        {/* Region Selector */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Region</Text>
          <TouchableOpacity
            style={styles.shardSelector}
            onPress={() => setShowShardPicker(true)}
            activeOpacity={0.7}
            disabled={isSaving || isDisconnecting}
          >
            <View style={styles.shardSelectorContent}>
              <Globe size={18} color={colors.textSecondary} />
              <Text style={styles.shardSelectorText}>{selectedShard.label}</Text>
            </View>
            <ChevronDown size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.shardHint}>
            Select the region where your Cliniko account is hosted
          </Text>
        </View>

        {/* API Key Input */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>API Key</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={isRevealed ? apiKey : maskedKey}
              onChangeText={isRevealed ? setApiKey : undefined}
              multiline
              editable={isRevealed && !isSaving && !isDisconnecting}
              placeholder="Enter your Cliniko API key"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <TouchableOpacity
            style={styles.revealButton}
            onPress={() => setIsRevealed(!isRevealed)}
            activeOpacity={0.7}
          >
            {isRevealed ? (
              <EyeOff size={18} color={colors.primary} />
            ) : (
              <Eye size={18} color={colors.primary} />
            )}
            <Text style={styles.revealButtonText}>
              {isRevealed ? 'Hide' : 'Reveal'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.primaryButton,
            (isSaving || isDisconnecting) && styles.buttonDisabled
          ]}
          onPress={handleUpdateKey}
          activeOpacity={0.8}
          disabled={isSaving || isDisconnecting}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.primaryButtonText}>Update key</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.secondaryButton,
            (isSaving || isDisconnecting) && styles.buttonDisabled
          ]}
          onPress={handleDisconnect}
          activeOpacity={0.7}
          disabled={isSaving || isDisconnecting}
        >
          {isDisconnecting ? (
            <ActivityIndicator color={colors.error} size="small" />
          ) : (
            <Text style={styles.secondaryButtonText}>Disconnect</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footnote}>
          Your API key is stored securely on your device and never sent to our servers.
        </Text>
      </ScrollView>

      {/* Shard Picker Modal */}
      <Modal
        visible={showShardPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowShardPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Region</Text>
              <TouchableOpacity
                onPress={() => setShowShardPicker(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>Done</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.shardList}>
              {CLINIKO_SHARDS.map((shard) => (
                <TouchableOpacity
                  key={shard.id}
                  style={[
                    styles.shardOption,
                    selectedShard.id === shard.id && styles.shardOptionSelected,
                  ]}
                  onPress={() => handleSelectShard(shard)}
                  activeOpacity={0.7}
                >
                  <View style={styles.shardOptionContent}>
                    <Text style={styles.shardOptionLabel}>{shard.label}</Text>
                    <Text style={styles.shardOptionRegion}>{shard.region}</Text>
                  </View>
                  {selectedShard.id === shard.id && (
                    <Check size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  card: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  statusValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusDotConnected: {
    backgroundColor: colors.success,
  },
  statusDotDisconnected: {
    backgroundColor: colors.error,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.textPrimary,
  },
  statusDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  connectedInfo: {
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
  },
  connectedLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  connectedName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginTop: 4,
  },
  connectedEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  shardSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  shardSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shardSelectorText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  shardHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  inputContainer: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 80,
  },
  input: {
    fontSize: 15,
    color: colors.textPrimary,
    padding: spacing.sm + 4,
    lineHeight: 22,
  },
  revealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
  },
  revealButtonText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '500' as const,
    marginLeft: 6,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    minHeight: 50,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.error,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    minHeight: 50,
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.error,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  footnote: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: spacing.md,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  modalCloseButton: {
    padding: spacing.xs,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.primary,
  },
  shardList: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  shardOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  shardOptionSelected: {
    backgroundColor: colors.primaryLight,
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
    borderBottomWidth: 0,
  },
  shardOptionContent: {
    flex: 1,
  },
  shardOptionLabel: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.textPrimary,
  },
  shardOptionRegion: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
