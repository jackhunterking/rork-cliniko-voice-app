/**
 * FullScreenRecordingSheet Component
 * iOS-native style bottom sheet covering 90-95% of screen
 * Contains recording controls and streaming transcript display
 */

import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  Dimensions,
  PanResponder,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { X, Mic, MicOff, Check, Square, Cloud } from 'lucide-react-native';
import { colors, spacing, radius } from '@/constants/colors';
import { WaveformBars } from './WaveformBars';
import { RecordingState } from '@/types/streaming';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.92; // 92% of screen
const DISMISS_THRESHOLD = 100;

interface FullScreenRecordingSheetProps {
  visible: boolean;
  onClose: () => void;
  fieldLabel?: string;
  // Recording state
  isRecording: boolean;
  recordingState: RecordingState;
  amplitude: number;
  // Transcript
  finalText: string;
  partialText: string;
  error: string | null;
  // Actions
  onStartRecording: () => void;
  onStopRecording: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function FullScreenRecordingSheet({
  visible,
  onClose,
  fieldLabel = 'Note',
  isRecording,
  recordingState,
  amplitude,
  finalText,
  partialText,
  error,
  onStartRecording,
  onStopRecording,
  onConfirm,
  onCancel,
}: FullScreenRecordingSheetProps) {
  const insets = useSafeAreaInsets();
  
  // Animation values
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Drag handling
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to downward drags from the handle area
        return gestureState.dy > 0;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > DISMISS_THRESHOLD || gestureState.vy > 0.5) {
          // Dismiss
          handleClose();
        } else {
          // Snap back
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 20,
            stiffness: 200,
          }).start();
        }
      },
    })
  ).current;

  // Open/close animations
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 25,
          stiffness: 200,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SHEET_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, overlayOpacity]);

  // Pulse animation for recording
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  const handleClose = useCallback(() => {
    if (isRecording) {
      onCancel();
    }
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [isRecording, onCancel, onClose, translateY, overlayOpacity]);

  const handleMicPress = useCallback(() => {
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  }, [isRecording, onStartRecording, onStopRecording]);

  const handleConfirm = useCallback(() => {
    onConfirm();
    handleClose();
  }, [onConfirm, handleClose]);

  const combinedText = partialText
    ? `${finalText} ${partialText}`.trim()
    : finalText;

  const hasTranscript = finalText.trim().length > 0 || partialText.trim().length > 0;
  const isProcessing = recordingState === 'processing';
  const isDone = recordingState === 'done';
  const isIdle = recordingState === 'idle';

  const getStatusText = () => {
    if (error) return error;
    if (isProcessing) return 'Finalizing...';
    if (isDone) return 'Complete';
    if (isRecording) return 'Listening...';
    return 'Tap to record';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <StatusBar barStyle="light-content" />
      
      {/* Overlay */}
      <Animated.View
        style={[styles.overlay, { opacity: overlayOpacity }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            height: SHEET_HEIGHT,
            transform: [{ translateY }],
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        {/* Handle */}
        <View {...panResponder.panHandlers} style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerSubtitle}>Dictating into</Text>
            <Text style={styles.headerTitle}>{fieldLabel}</Text>
          </View>
          <Pressable
            onPress={handleClose}
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.closeButtonPressed,
            ]}
          >
            <X size={22} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Transcript Display - Fixed Height */}
        <View style={styles.transcriptContainer}>
          <View style={styles.transcriptInner}>
            {combinedText ? (
              <Animated.ScrollView
                style={styles.transcriptScroll}
                contentContainerStyle={styles.transcriptScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.transcriptText}>
                  {finalText}
                  {partialText && (
                    <Text style={styles.partialText}> {partialText}</Text>
                  )}
                </Text>
              </Animated.ScrollView>
            ) : (
              <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderText}>
                  {isRecording
                    ? 'Start speaking...'
                    : 'Your transcription will appear here'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Status Indicator */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              isRecording && styles.statusDotActive,
              error && styles.statusDotError,
            ]}
          />
          <Text
            style={[
              styles.statusText,
              isRecording && styles.statusTextActive,
              error && styles.statusTextError,
            ]}
          >
            {getStatusText()}
          </Text>
        </View>

        {/* Recording Controls */}
        <View style={styles.controlsContainer}>
          {/* Main Mic Button */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Pressable
              onPress={handleMicPress}
              disabled={isProcessing}
              style={({ pressed }) => [
                styles.micButton,
                isRecording && styles.micButtonRecording,
                pressed && styles.micButtonPressed,
                isProcessing && styles.micButtonDisabled,
              ]}
            >
              {isRecording ? (
                <View style={styles.micButtonInner}>
                  <WaveformBars
                    isRecording={isRecording}
                    amplitude={amplitude}
                    barCount={5}
                    barColor="#FFFFFF"
                  />
                  <View style={styles.stopIcon}>
                    <Square size={16} color="#FFFFFF" fill="#FFFFFF" />
                  </View>
                </View>
              ) : (
                <Mic size={32} color="#FFFFFF" />
              )}
            </Pressable>
          </Animated.View>

          {/* AI Badge */}
          <View style={styles.aiBadge}>
            <Cloud size={12} color={colors.primary} />
            <Text style={styles.aiBadgeText}>Powered by Clinical AI</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Pressable
            onPress={handleClose}
            style={({ pressed }) => [
              styles.actionButton,
              styles.cancelButton,
              pressed && styles.actionButtonPressed,
            ]}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          
          <Pressable
            onPress={handleConfirm}
            disabled={!hasTranscript || isProcessing}
            style={({ pressed }) => [
              styles.actionButton,
              styles.confirmButton,
              pressed && styles.actionButtonPressed,
              (!hasTranscript || isProcessing) && styles.actionButtonDisabled,
            ]}
          >
            <Check size={20} color="#FFFFFF" style={styles.confirmIcon} />
            <Text style={styles.confirmButtonText}>Insert</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: colors.border,
    borderRadius: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonPressed: {
    opacity: 0.7,
  },
  transcriptContainer: {
    flex: 1,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  transcriptInner: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  transcriptScroll: {
    flex: 1,
  },
  transcriptScrollContent: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  transcriptText: {
    fontSize: 18,
    lineHeight: 28,
    color: colors.textPrimary,
    fontWeight: '400',
  },
  partialText: {
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.placeholder,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textSecondary,
  },
  statusDotActive: {
    backgroundColor: colors.error,
  },
  statusDotError: {
    backgroundColor: colors.error,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusTextActive: {
    color: colors.error,
    fontWeight: '500',
  },
  statusTextError: {
    color: colors.error,
  },
  controlsContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  micButtonRecording: {
    backgroundColor: colors.error,
    width: 100,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
  },
  micButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  micButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.6,
  },
  micButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  stopIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 178, 169, 0.08)',
    borderRadius: 20,
    gap: 6,
  },
  aiBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
    letterSpacing: 0.2,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  actionButtonPressed: {
    opacity: 0.85,
  },
  actionButtonDisabled: {
    opacity: 0.4,
  },
  cancelButton: {
    backgroundColor: colors.backgroundSecondary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  confirmIcon: {
    marginRight: 6,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
