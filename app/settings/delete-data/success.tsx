import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle } from 'lucide-react-native';
import { colors, spacing, radius } from '@/constants/colors';

export default function DeleteDataSuccessScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleDone = () => {
    router.replace('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: '',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerBackVisible: false,
        }}
      />

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <CheckCircle size={64} color={colors.success} />
        </View>
        <Text style={styles.title}>Data deleted</Text>
        <Text style={styles.message}>
          Your Cliniko Voice app data has been removed from this device.
        </Text>
      </View>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <TouchableOpacity
          style={styles.doneButton}
          onPress={handleDone}
          activeOpacity={0.8}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomBar: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
