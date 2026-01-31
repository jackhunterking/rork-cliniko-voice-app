/**
 * DictationSheet Component
 * Full-screen recording sheet with real-time AssemblyAI transcription
 * Wrapper around FullScreenRecordingSheet with recording session management
 * 
 * IMPORTANT: Recording is gated via Superwall paywall
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { FullScreenRecordingSheet } from './FullScreenRecordingSheet';
import { useRecordingSession } from '@/hooks/useRecordingSession';
import { useSubscription } from '@/context/SubscriptionContext';
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/posthog';

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
  const { registerGatedAction } = useSubscription();
  
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

  // Handle start recording - gated via Superwall
  const handleStartRecording = useCallback(async () => {
    if (__DEV__) {
      console.log('[DictationSheet] Start recording pressed, calling registerGatedAction...');
    }
    
    // Track that user attempted to record
    trackEvent(ANALYTICS_EVENTS.RECORD_ATTEMPTED);
    
    // Use Superwall register to gate recording
    // If user is subscribed, startRecording() is called immediately
    // If not, paywall is shown; on success, startRecording() is called
    await registerGatedAction(async () => {
      if (__DEV__) {
        console.log('[DictationSheet] Gated action callback - starting recording');
      }
      await startRecording();
    });
  }, [registerGatedAction, startRecording]);

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
      onStartRecording={handleStartRecording}
      onStopRecording={stopRecording}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );
}
