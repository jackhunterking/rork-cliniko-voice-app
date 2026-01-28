/**
 * Live Recording Screen
 * ChatGPT-style voice recording with real-time transcription
 */

import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  Layout,
} from 'react-native-reanimated';
import { ChevronLeft } from 'lucide-react-native';
import { TeleprompterTranscript } from '@/components/TeleprompterTranscript';
import { RecordingControlBar } from '@/components/RecordingControlBar';
import { useRecordingSession } from '@/hooks/useRecordingSession';
import { useNote } from '@/context/NoteContext';
import { colors, spacing } from '@/constants/colors';
import { RECORDING_STATE_LABELS } from '@/types/streaming';

export default function LiveRecordingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { noteData, appendToField } = useNote();

  const {
    recordingState,
    isRecording,
    amplitude,
    finalText,
    partialText,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    resetSession,
  } = useRecordingSession({
    onError: (errorMessage) => {
      Alert.alert('Recording Error', errorMessage, [
        { text: 'OK' },
        { text: 'Retry', onPress: () => startRecording() },
      ]);
    },
  });

  // Handle back/cancel
  const handleCancel = useCallback(async () => {
    if (isRecording || recordingState === 'recognizing') {
      Alert.alert(
        'Discard Recording?',
        'Your recording will be lost.',
        [
          { text: 'Keep Recording', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: async () => {
              await cancelRecording();
              router.back();
            },
          },
        ]
      );
    } else if (finalText) {
      Alert.alert(
        'Discard Transcript?',
        'Your transcript will be lost.',
        [
          { text: 'Keep', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              resetSession();
              router.back();
            },
          },
        ]
      );
    } else {
      router.back();
    }
  }, [isRecording, recordingState, finalText, cancelRecording, resetSession, router]);

  // Handle confirm
  const handleConfirm = useCallback(async () => {
    if (!finalText && !partialText) {
      Alert.alert('No Transcript', 'Please record some audio first.');
      return;
    }

    // If still recording, stop first
    if (isRecording) {
      await stopRecording();
    }

    // Get the transcript to use
    const transcript = finalText || partialText;

    // If we came from the note editor, append to the active field
    // Otherwise, just navigate to the editor with the transcript
    if (noteData.template) {
      // Find first empty field or the first field
      const targetField = noteData.fieldValues.find(f => !f.value.trim()) || noteData.fieldValues[0];
      if (targetField) {
        appendToField(targetField.fieldId, transcript);
      }
      router.replace('/note/editor');
    } else {
      // Store transcript in context and navigate
      router.replace('/note/editor');
    }
  }, [finalText, partialText, isRecording, stopRecording, noteData, appendToField, router]);

  // Handle record button press
  const handleRecordPress = useCallback(async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        cancelRecording();
      }
    };
  }, [isRecording, cancelRecording]);

  const statusLabel = RECORDING_STATE_LABELS[recordingState];
  const isProcessing = recordingState === 'processing';
  const isDone = recordingState === 'done';

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
          gestureEnabled: !isRecording,
        }}
      />

      {/* Custom Header */}
      <Animated.View
        entering={FadeIn}
        style={[styles.header, { paddingTop: insets.top + spacing.sm }]}
      >
        <Pressable
          onPress={handleCancel}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
        >
          <ChevronLeft size={28} color={colors.textPrimary} />
        </Pressable>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>New Note</Text>
          <Animated.Text
            key={statusLabel}
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(100)}
            layout={Layout}
            style={[
              styles.statusLabel,
              isRecording && styles.statusLabelRecording,
              isProcessing && styles.statusLabelProcessing,
              isDone && styles.statusLabelDone,
              recordingState === 'error' && styles.statusLabelError,
            ]}
          >
            {statusLabel}
          </Animated.Text>
        </View>

        {/* Spacer for alignment */}
        <View style={styles.headerSpacer} />
      </Animated.View>

      {/* Patient badge if available */}
      {noteData.patient && (
        <Animated.View
          entering={SlideInUp.duration(300)}
          style={styles.patientBadge}
        >
          <Text style={styles.patientBadgeLabel}>Recording for</Text>
          <Text style={styles.patientBadgeName}>{noteData.patient.name}</Text>
        </Animated.View>
      )}

      {/* Teleprompter Transcript */}
      <View style={styles.transcriptContainer}>
        <TeleprompterTranscript
          finalText={finalText}
          partialText={partialText}
          recordingState={recordingState}
          placeholder={
            error
              ? `Error: ${error}\n\nTap record to try again.`
              : 'Tap the microphone to start transcribing your clinical notes...'
          }
        />
      </View>

      {/* Recording Control Bar */}
      <RecordingControlBar
        recordingState={recordingState}
        isRecording={isRecording}
        amplitude={amplitude}
        onRecordPress={handleRecordPress}
        onCancelPress={handleCancel}
        onConfirmPress={handleConfirm}
        disabled={isProcessing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -spacing.sm,
  },
  backButtonPressed: {
    opacity: 0.6,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statusLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusLabelRecording: {
    color: colors.error,
    fontWeight: '500',
  },
  statusLabelProcessing: {
    color: colors.primary,
    fontWeight: '500',
  },
  statusLabelDone: {
    color: colors.success,
    fontWeight: '500',
  },
  statusLabelError: {
    color: colors.error,
  },
  headerSpacer: {
    width: 44,
  },
  patientBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primaryLight,
    gap: spacing.sm,
  },
  patientBadgeLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  patientBadgeName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  transcriptContainer: {
    flex: 1,
  },
});
