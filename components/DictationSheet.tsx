/**
 * DictationSheet Component
 * Full-screen recording sheet with real-time AssemblyAI transcription
 * Wrapper around FullScreenRecordingSheet with recording session management
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { FullScreenRecordingSheet } from './FullScreenRecordingSheet';
import { useRecordingSession } from '@/hooks/useRecordingSession';

interface DictationSheetProps {
  visible: boolean;
  onClose: () => void;
  fieldLabel: string;
  onInsert: (text: string) => void;
  onReplace: (text: string) => void;
}

export function DictationSheet({
  visible,
  onClose,
  fieldLabel,
  onInsert,
  onReplace,
}: DictationSheetProps) {
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
    prepareRecording,
  } = useRecordingSession({
    onError: (errorMessage) => {
      if (__DEV__) console.log('[DictationSheet] Recording error:', errorMessage);
    },
  });

  // Track if we've already prepared for this sheet opening
  const hasPreparedRef = useRef(false);

  // Preconnect when sheet becomes visible - this makes recording start instant
  useEffect(() => {
    if (visible && !hasPreparedRef.current) {
      hasPreparedRef.current = true;
      if (__DEV__) console.log('[DictationSheet] Sheet visible, preconnecting...');
      prepareRecording();
    }
  }, [visible, prepareRecording]);

  // Reset session when sheet is closed
  useEffect(() => {
    if (!visible) {
      hasPreparedRef.current = false;
      resetSession();
    }
  }, [visible, resetSession]);

  // Handle confirm - insert the transcript
  const handleConfirm = useCallback(() => {
    const transcript = finalText.trim() || partialText.trim();
    if (transcript) {
      onInsert(transcript);
    }
  }, [finalText, partialText, onInsert]);

  // Handle cancel - stop recording and close
  const handleCancel = useCallback(async () => {
    if (isRecording) {
      await cancelRecording();
    }
    onClose();
  }, [isRecording, cancelRecording, onClose]);

  // Handle close - clean up and close
  const handleClose = useCallback(async () => {
    if (isRecording) {
      await cancelRecording();
    }
    onClose();
  }, [isRecording, cancelRecording, onClose]);

  return (
    <FullScreenRecordingSheet
      visible={visible}
      onClose={handleClose}
      fieldLabel={fieldLabel}
      isRecording={isRecording}
      recordingState={recordingState}
      amplitude={amplitude}
      finalText={finalText}
      partialText={partialText}
      error={error}
      onStartRecording={startRecording}
      onStopRecording={stopRecording}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );
}
