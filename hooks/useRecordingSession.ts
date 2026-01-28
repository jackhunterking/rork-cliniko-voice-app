/**
 * useRecordingSession Hook
 * Orchestrates audio recording and AssemblyAI streaming
 * Manages state machine for recording flow
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { RecordingState, TranscriptState } from '@/types/streaming';
import { assemblyaiStreaming } from '@/services/assemblyai-streaming';
import { audioRecording } from '@/services/audio-recording';
import { supabase } from '@/lib/supabase';
import { useSettingsStore } from '@/stores/settings-store';

interface UseRecordingSessionOptions {
  /** Called when recording state changes */
  onStateChange?: (state: RecordingState) => void;
  /** Called when transcript is finalized */
  onTranscriptFinalized?: (transcript: string) => void;
  /** Called on error */
  onError?: (error: string) => void;
}

interface UseRecordingSessionReturn {
  /** Current recording state */
  recordingState: RecordingState;
  /** Whether currently recording */
  isRecording: boolean;
  /** Current audio amplitude (0-100) */
  amplitude: number;
  /** Final transcript text */
  finalText: string;
  /** Partial (updating) transcript text */
  partialText: string;
  /** Combined transcript */
  combinedText: string;
  /** Error message if any */
  error: string | null;
  /** Audio file URI after recording stops */
  audioUri: string | null;
  /** Start recording */
  startRecording: () => Promise<void>;
  /** Stop recording */
  stopRecording: () => Promise<void>;
  /** Cancel recording */
  cancelRecording: () => Promise<void>;
  /** Finalize transcript with Slam-1 */
  finalizeTranscript: () => Promise<string | null>;
  /** Reset session */
  resetSession: () => void;
}

export function useRecordingSession(
  options: UseRecordingSessionOptions = {}
): UseRecordingSessionReturn {
  const { onStateChange, onTranscriptFinalized, onError } = options;
  const { medicalModeEnabled } = useSettingsStore();

  // State
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [amplitude, setAmplitude] = useState(0);
  const [finalText, setFinalText] = useState('');
  const [partialText, setPartialText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);

  // Refs for cleanup
  const isCleaningUp = useRef(false);

  // Update state and notify
  const updateState = useCallback(
    (newState: RecordingState) => {
      setRecordingState(newState);
      onStateChange?.(newState);
    },
    [onStateChange]
  );

  // Setup streaming callbacks
  useEffect(() => {
    assemblyaiStreaming.onPartialText(({ text }) => {
      setPartialText(text);
      if (recordingState === 'listening') {
        updateState('recognizing');
      }
    });

    assemblyaiStreaming.onFinalText(({ text }) => {
      setFinalText((prev) => (prev ? `${prev} ${text}` : text));
      setPartialText('');
    });

    assemblyaiStreaming.onError((errorMsg) => {
      console.error('[Recording] Streaming error:', errorMsg);
      setError(errorMsg);
      onError?.(errorMsg);
      updateState('error');
    });

    assemblyaiStreaming.onSessionEnd(() => {
      if (__DEV__) console.log('[Recording] Session ended');
    });

    return () => {
      assemblyaiStreaming.removeAllListeners();
    };
  }, [onError, recordingState, updateState]);

  // Setup audio metering callback
  useEffect(() => {
    audioRecording.onMetering((data) => {
      setAmplitude(data.amplitude);
    });

    return () => {
      audioRecording.removeAllCallbacks();
    };
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    if (isRecording || isCleaningUp.current) {
      return;
    }

    if (__DEV__) console.log('[Recording] Starting...');
    setError(null);

    try {
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Request permissions
      const hasPermission = await audioRecording.requestPermissions();
      if (!hasPermission) {
        throw new Error('Microphone permission denied');
      }

      // Start audio recording
      await audioRecording.startRecording({ usePCM: true });
      setIsRecording(true);
      updateState('listening');

      // Connect to AssemblyAI streaming
      // Note: In a production app, you'd stream audio chunks in real-time
      // For now, we'll do the full transcript on stop
      try {
        await assemblyaiStreaming.connect();
      } catch (streamError) {
        // Continue with local recording even if streaming fails
        console.warn('[Recording] Streaming connection failed, continuing with local recording');
      }

      if (__DEV__) console.log('[Recording] Started successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      console.error('[Recording] Start error:', err);
      setError(errorMessage);
      onError?.(errorMessage);
      updateState('error');
      
      // Cleanup on error
      await audioRecording.cancelRecording();
      setIsRecording(false);
    }
  }, [isRecording, onError, updateState]);

  // Stop recording
  const stopRecording = useCallback(async () => {
    if (!isRecording || isCleaningUp.current) {
      return;
    }

    if (__DEV__) console.log('[Recording] Stopping...');
    isCleaningUp.current = true;

    try {
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      setIsRecording(false);
      updateState('processing');

      // Disconnect from streaming
      await assemblyaiStreaming.disconnect();

      // Stop audio recording and get file URI
      const uri = await audioRecording.stopRecording();
      setAudioUri(uri);

      if (__DEV__) console.log('[Recording] Stopped, audio URI:', uri);

      // Get final transcript from streaming
      const transcript = assemblyaiStreaming.getTranscript();
      setFinalText(transcript.finalText);
      setPartialText('');

      // If we have any transcript, mark as done
      // Otherwise, we'll need to run async transcription
      if (transcript.finalText) {
        updateState('done');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop recording';
      console.error('[Recording] Stop error:', err);
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      isCleaningUp.current = false;
    }
  }, [isRecording, onError, updateState]);

  // Cancel recording
  const cancelRecording = useCallback(async () => {
    if (isCleaningUp.current) {
      return;
    }

    if (__DEV__) console.log('[Recording] Cancelling...');
    isCleaningUp.current = true;

    try {
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Disconnect streaming
      await assemblyaiStreaming.disconnect();
      assemblyaiStreaming.resetTranscript();

      // Cancel audio recording
      await audioRecording.cancelRecording();

      // Reset state
      setIsRecording(false);
      setFinalText('');
      setPartialText('');
      setAmplitude(0);
      setAudioUri(null);
      setError(null);
      updateState('idle');

      if (__DEV__) console.log('[Recording] Cancelled');
    } catch (err) {
      console.error('[Recording] Cancel error:', err);
    } finally {
      isCleaningUp.current = false;
    }
  }, [updateState]);

  // Finalize transcript with Slam-1
  const finalizeTranscript = useCallback(async (): Promise<string | null> => {
    if (!audioUri) {
      console.warn('[Recording] No audio URI to finalize');
      return null;
    }

    if (__DEV__) console.log('[Recording] Finalizing transcript...');
    updateState('processing');

    try {
      // Read audio file as base64
      const audioBase64 = await audioRecording.getAudioAsBase64(audioUri);

      // Upload to Supabase Storage
      const fileName = `recording_${Date.now()}.m4a`;
      const filePath = `recordings/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('recordings')
        .upload(filePath, decode(audioBase64), {
          contentType: 'audio/m4a',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get signed URL for the uploaded file
      const { data: urlData } = await supabase.storage
        .from('recordings')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (!urlData?.signedUrl) {
        throw new Error('Failed to get signed URL');
      }

      // Call finalize Edge Function
      const { data, error: fnError } = await supabase.functions.invoke(
        'assemblyai-finalize',
        {
          body: {
            audioUrl: urlData.signedUrl,
            streamingTranscript: finalText,
            medicalMode: medicalModeEnabled,
          },
        }
      );

      if (fnError) {
        throw new Error(`Finalize failed: ${fnError.message}`);
      }

      const finalizedText = data?.finalText || finalText;
      setFinalText(finalizedText);
      updateState('done');

      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      onTranscriptFinalized?.(finalizedText);
      return finalizedText;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to finalize';
      console.error('[Recording] Finalize error:', err);
      setError(errorMessage);
      onError?.(errorMessage);
      updateState('error');
      return null;
    }
  }, [audioUri, finalText, medicalModeEnabled, onError, onTranscriptFinalized, updateState]);

  // Reset session
  const resetSession = useCallback(() => {
    assemblyaiStreaming.resetTranscript();
    assemblyaiStreaming.clearToken();
    setRecordingState('idle');
    setIsRecording(false);
    setAmplitude(0);
    setFinalText('');
    setPartialText('');
    setError(null);
    setAudioUri(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        audioRecording.cancelRecording();
        assemblyaiStreaming.disconnect();
      }
    };
  }, [isRecording]);

  // Combined text
  const combinedText = partialText
    ? `${finalText} ${partialText}`.trim()
    : finalText;

  return {
    recordingState,
    isRecording,
    amplitude,
    finalText,
    partialText,
    combinedText,
    error,
    audioUri,
    startRecording,
    stopRecording,
    cancelRecording,
    finalizeTranscript,
    resetSession,
  };
}

// Helper to decode base64 to Uint8Array
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
