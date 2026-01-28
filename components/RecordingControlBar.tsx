/**
 * RecordingControlBar Component
 * ChatGPT-style pill-shaped recording control with waveform visualization
 * Includes record, cancel, and confirm actions with haptic feedback
 */

import React, { useCallback } from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Mic, MicOff, X, Check, Plus, Square } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WaveformBars } from './WaveformBars';
import { colors, spacing, radius } from '@/constants/colors';
import { RecordingState } from '@/types/streaming';

interface RecordingControlBarProps {
  /** Current recording state */
  recordingState: RecordingState;
  /** Whether currently recording */
  isRecording: boolean;
  /** Audio amplitude for waveform (0-100) */
  amplitude?: number;
  /** Handler for record/stop button */
  onRecordPress: () => void;
  /** Handler for cancel button */
  onCancelPress: () => void;
  /** Handler for confirm button */
  onConfirmPress: () => void;
  /** Whether controls are disabled */
  disabled?: boolean;
  /** Custom style */
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function RecordingControlBar({
  recordingState,
  isRecording,
  amplitude = 0,
  onRecordPress,
  onCancelPress,
  onConfirmPress,
  disabled = false,
  style,
}: RecordingControlBarProps) {
  const insets = useSafeAreaInsets();
  
  // Button scale animations
  const recordScale = useSharedValue(1);
  const cancelScale = useSharedValue(1);
  const confirmScale = useSharedValue(1);

  const isProcessing = recordingState === 'processing';
  const isDone = recordingState === 'done';
  const isIdle = recordingState === 'idle';
  const hasTranscript = recordingState !== 'idle';

  // Haptic feedback handlers
  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const triggerLightHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Record button handlers
  const handleRecordPressIn = useCallback(() => {
    recordScale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  }, [recordScale]);

  const handleRecordPressOut = useCallback(() => {
    recordScale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, [recordScale]);

  const handleRecordPress = useCallback(() => {
    if (disabled) return;
    triggerHaptic();
    onRecordPress();
  }, [disabled, triggerHaptic, onRecordPress]);

  // Cancel button handlers
  const handleCancelPressIn = useCallback(() => {
    cancelScale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
  }, [cancelScale]);

  const handleCancelPressOut = useCallback(() => {
    cancelScale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, [cancelScale]);

  const handleCancelPress = useCallback(() => {
    if (disabled) return;
    triggerLightHaptic();
    onCancelPress();
  }, [disabled, triggerLightHaptic, onCancelPress]);

  // Confirm button handlers
  const handleConfirmPressIn = useCallback(() => {
    confirmScale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
  }, [confirmScale]);

  const handleConfirmPressOut = useCallback(() => {
    confirmScale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, [confirmScale]);

  const handleConfirmPress = useCallback(() => {
    if (disabled || isProcessing) return;
    triggerHaptic();
    onConfirmPress();
  }, [disabled, isProcessing, triggerHaptic, onConfirmPress]);

  // Animated styles
  const recordAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: recordScale.value }],
  }));

  const cancelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cancelScale.value }],
  }));

  const confirmAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: confirmScale.value }],
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      style={[
        styles.container,
        { paddingBottom: insets.bottom + spacing.md },
        style,
      ]}
    >
      <View style={styles.pill}>
        {/* Left: Plus button (placeholder for future features) */}
        <Pressable
          style={[styles.sideButton, styles.sideButtonDisabled]}
          disabled
        >
          <Plus size={22} color={colors.textSecondary} />
        </Pressable>

        {/* Center: Waveform or Record Button */}
        <View style={styles.centerSection}>
          {isRecording ? (
            // Show waveform while recording
            <AnimatedPressable
              entering={FadeIn.duration(200)}
              style={[styles.waveformContainer, recordAnimatedStyle]}
              onPressIn={handleRecordPressIn}
              onPressOut={handleRecordPressOut}
              onPress={handleRecordPress}
              disabled={disabled}
            >
              <WaveformBars
                isRecording={isRecording}
                amplitude={amplitude}
                isProcessing={isProcessing}
                barCount={7}
                barColor={isRecording ? colors.error : colors.primary}
              />
              {/* Stop indicator overlay */}
              <View style={styles.stopIndicator}>
                <Square size={12} color="#FFFFFF" fill="#FFFFFF" />
              </View>
            </AnimatedPressable>
          ) : (
            // Show mic button when idle
            <AnimatedPressable
              entering={FadeIn.duration(200)}
              style={[
                styles.recordButton,
                isProcessing && styles.recordButtonDisabled,
                recordAnimatedStyle,
              ]}
              onPressIn={handleRecordPressIn}
              onPressOut={handleRecordPressOut}
              onPress={handleRecordPress}
              disabled={disabled || isProcessing}
            >
              {isProcessing ? (
                <WaveformBars
                  isRecording={false}
                  isProcessing={true}
                  barCount={5}
                  barColor={colors.primary}
                />
              ) : (
                <Mic size={24} color="#FFFFFF" />
              )}
            </AnimatedPressable>
          )}
        </View>

        {/* Right: Cancel and Confirm buttons */}
        <View style={styles.rightSection}>
          {/* Cancel button */}
          <AnimatedPressable
            style={[
              styles.actionButton,
              styles.cancelButton,
              (disabled || isDone) && styles.actionButtonDisabled,
              cancelAnimatedStyle,
            ]}
            onPressIn={handleCancelPressIn}
            onPressOut={handleCancelPressOut}
            onPress={handleCancelPress}
            disabled={disabled || isDone}
          >
            <X size={20} color={colors.error} />
          </AnimatedPressable>

          {/* Confirm button */}
          <AnimatedPressable
            style={[
              styles.actionButton,
              styles.confirmButton,
              (!hasTranscript || isProcessing) && styles.actionButtonDisabled,
              isDone && styles.confirmButtonDone,
              confirmAnimatedStyle,
            ]}
            onPressIn={handleConfirmPressIn}
            onPressOut={handleConfirmPressOut}
            onPress={handleConfirmPress}
            disabled={!hasTranscript || isProcessing}
          >
            <Check
              size={20}
              color={isDone ? '#FFFFFF' : hasTranscript ? colors.success : colors.textSecondary}
            />
          </AnimatedPressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sideButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  sideButtonDisabled: {
    opacity: 0.4,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  waveformContainer: {
    position: 'relative',
    width: '100%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
  },
  stopIndicator: {
    position: 'absolute',
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  recordButtonDisabled: {
    backgroundColor: colors.backgroundSecondary,
    shadowOpacity: 0,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtonDisabled: {
    opacity: 0.4,
  },
  cancelButton: {
    borderColor: colors.error,
  },
  confirmButton: {
    borderColor: colors.success,
  },
  confirmButtonDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
});
