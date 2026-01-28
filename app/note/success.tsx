import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SecondaryButton } from '@/components/SecondaryButton';
import { colors, spacing, radius } from '@/constants/colors';
import { useNote } from '@/context/NoteContext';

export default function NoteSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { type } = useLocalSearchParams<{ type: string }>();
  const { noteData, resetNote } = useNote();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const isDraft = type === 'draft';

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, fadeAnim]);

  const handleCreateAnother = () => {
    console.log('Creating another note for same patient');
    if (noteData.patient) {
      resetNote();
      router.replace(`/patient/${noteData.patient.id}`);
    }
  };

  const handleBackToPatients = () => {
    console.log('Returning to patients list');
    resetNote();
    router.replace('/(tabs)/patients');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: '',
          headerShown: false,
        }}
      />

      <View style={[styles.content, { paddingTop: insets.top + spacing.xl * 3 }]}>
        <Animated.View
          style={[
            styles.iconContainer,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.iconCircle}>
            <Check size={48} color="#FFFFFF" strokeWidth={3} />
          </View>
        </Animated.View>

        <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
          <Text style={styles.title}>
            {isDraft ? 'Draft Saved' : 'Saved to Cliniko'}
          </Text>
          <Text style={styles.subtitle}>
            {isDraft
              ? 'Your treatment note has been saved as a draft.'
              : 'The treatment note has been saved successfully.'}
          </Text>

          {noteData.patient && (
            <View style={styles.patientInfo}>
              <Text style={styles.patientLabel}>Patient</Text>
              <Text style={styles.patientName}>{noteData.patient.name}</Text>
            </View>
          )}
        </Animated.View>
      </View>

      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + spacing.lg }]}>
        <PrimaryButton
          title="Create another note"
          onPress={handleCreateAnother}
        />
        <SecondaryButton
          title="Back to patients"
          onPress={handleBackToPatients}
          style={{ marginTop: spacing.sm }}
        />
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
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  patientInfo: {
    marginTop: spacing.xl,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    minWidth: 200,
  },
  patientLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  patientName: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginTop: 4,
  },
  bottomActions: {
    paddingHorizontal: spacing.lg,
  },
});
