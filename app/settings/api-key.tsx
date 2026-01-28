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
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors, spacing, radius } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import {
  getClinikoApiKey,
  saveClinikoApiKey,
  deleteClinikoApiKey,
} from '@/lib/secure-storage';

export default function ApiKeyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { refreshClinikoKeyStatus, hasClinikoKey } = useAuth();
  
  const [apiKey, setApiKey] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Load existing API key on mount
  useEffect(() => {
    const loadKey = async () => {
      try {
        const existingKey = await getClinikoApiKey();
        if (existingKey) {
          setApiKey(existingKey);
        }
      } catch (error) {
        console.error('Failed to load API key:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadKey();
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

    setIsSaving(true);
    
    try {
      await saveClinikoApiKey(trimmedKey);
      await refreshClinikoKeyStatus();
      Alert.alert('Success', 'API key updated successfully');
    } catch (error) {
      console.error('Failed to save API key:', error);
      Alert.alert('Error', 'Failed to save API key. Please try again.');
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
              await deleteClinikoApiKey();
              await refreshClinikoKeyStatus();
              // Navigate to connect screen
              router.replace('/connect-cliniko');
            } catch (error) {
              console.error('Failed to delete API key:', error);
              Alert.alert('Error', 'Failed to disconnect. Please try again.');
              setIsDisconnecting(false);
            }
          },
        },
      ]
    );
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
          <Text style={styles.statusDescription}>
            Used to load patients and templates.
          </Text>
        </View>

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
          Your API key is stored securely on your device.
        </Text>
      </ScrollView>
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
  cardLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
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
});
