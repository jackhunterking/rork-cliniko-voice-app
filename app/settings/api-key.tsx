import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors, spacing, radius } from '@/constants/colors';

export default function ApiKeyScreen() {
  const insets = useSafeAreaInsets();
  const [apiKey, setApiKey] = useState('sk_live_abc123xyz789def456ghi012jkl345mno678');
  const [isRevealed, setIsRevealed] = useState(false);

  const maskedKey = '•'.repeat(Math.min(apiKey.length, 32));

  const handleUpdateKey = () => {
    console.log('Update API key');
  };

  const handleDisconnect = () => {
    console.log('Disconnect from Cliniko');
  };

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
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Connected</Text>
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
              onChangeText={setApiKey}
              multiline
              editable={isRevealed}
              placeholder="Enter your Cliniko API key"
              placeholderTextColor={colors.textSecondary}
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
          style={styles.primaryButton}
          onPress={handleUpdateKey}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Update key</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleDisconnect}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>Disconnect</Text>
        </TouchableOpacity>

        <Text style={styles.footnote}>You can change this any time.</Text>
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
    backgroundColor: colors.success,
    marginRight: 6,
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
    marginBottom: spacing.sm,
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
    marginBottom: spacing.lg,
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.error,
  },
  footnote: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
