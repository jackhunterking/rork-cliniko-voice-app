/**
 * useRecordingSession Hook
 * Orchestrates real-time audio streaming and AssemblyAI transcription
 * Manages state machine for recording flow
 * 
 * DEPRECATION NOTICE: expo-av is deprecated and will be removed in SDK 55.
 * The Audio.requestPermissionsAsync() usage should be migrated to expo-audio.
 * See: https://docs.expo.dev/versions/latest/sdk/audio/
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { RecordingState, TranscriptState } from '@/types/streaming';
import { assemblyaiStreaming } from '@/services/assemblyai-streaming';
import { liveAudioStream } from '@/services/live-audio-stream';
import { supabase } from '@/lib/supabase';
import { useSettingsStore } from '@/stores/settings-store';

// Maximum recording duration: 30 minutes
const MAX_RECORDING_DURATION_MS = 30 * 60 * 1000;

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
  /** Duration of last completed recording session in milliseconds */
  lastSessionDurationMs: number;
  /** Start recording */
  startRecording: () => Promise<void>;
  /** Stop recording */
  stopRecording: () => Promise<void>;
  /** Cancel recording */
  cancelRecording: () => Promise<void>;
  /** Reset session */
  resetSession: () => void;
  /** Prepare for recording (preconnect to AssemblyAI) - call this early for instant start */
  prepareRecording: () => Promise<void>;
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
  const [lastSessionDurationMs, setLastSessionDurationMs] = useState(0);

  // Refs for cleanup
  const isCleaningUp = useRef(false);
  const permissionsGranted = useRef(false);
  const durationCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const recordingStartTime = useRef<number | null>(null);

  // Update state and notify
  const updateState = useCallback(
    (newState: RecordingState) => {
      setRecordingState(newState);
      onStateChange?.(newState);
    },
    [onStateChange]
  );

  // Request microphone permissions
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (permissionsGranted.current) {
      return true;
    }

    if (__DEV__) console.log('[Recording] Requesting permissions...');

    try {
      if (Platform.OS === 'ios') {
        const { status } = await Audio.requestPermissionsAsync();
        permissionsGranted.current = status === 'granted';
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'Cliniko Voice needs access to your microphone to transcribe your notes.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        permissionsGranted.current = granted === PermissionsAndroid.RESULTS.GRANTED;
      }

      if (__DEV__) console.log('[Recording] Permission granted:', permissionsGranted.current);
      return permissionsGranted.current;
    } catch (err) {
      console.error('[Recording] Permission request failed:', err);
      return false;
    }
  }, []);

  // Setup AssemblyAI streaming callbacks
  useEffect(() => {
    assemblyaiStreaming.onPartialText(({ text }) => {
      if (__DEV__) console.log('[Recording] Partial text:', text.substring(0, 50) + '...');
      setPartialText(text);
      if (recordingState === 'listening') {
        updateState('recognizing');
      }
    });

    assemblyaiStreaming.onFinalText(({ text }) => {
      if (__DEV__) console.log('[Recording] Final text:', text);
      if (text) {
        setFinalText((prev) => (prev ? `${prev} ${text}` : text));
      }
      setPartialText('');
    });

    assemblyaiStreaming.onError((errorMsg) => {
      console.error('[Recording] Streaming error:', errorMsg);
      setError(errorMsg);
      onError?.(errorMsg);
      updateState('error');
    });

    assemblyaiStreaming.onSessionStart((sessionId) => {
      if (__DEV__) console.log('[Recording] Session started:', sessionId);
    });

    assemblyaiStreaming.onSessionEnd((duration) => {
      if (__DEV__) console.log('[Recording] Session ended, duration:', duration);
    });

    return () => {
      assemblyaiStreaming.removeAllListeners();
    };
  }, [onError, recordingState, updateState]);

  // Setup live audio stream callbacks
  useEffect(() => {
    // Wire audio data to AssemblyAI
    liveAudioStream.onAudioData((base64Audio) => {
      assemblyaiStreaming.sendAudioChunk(base64Audio);
    });

    // Wire metering for amplitude visualization
    liveAudioStream.onMetering((amp, db) => {
      setAmplitude(amp);
    });

    // Handle audio errors
    liveAudioStream.onError((errorMsg) => {
      console.error('[Recording] Audio stream error:', errorMsg);
      setError(errorMsg);
      onError?.(errorMsg);
    });

    return () => {
      liveAudioStream.removeAllCallbacks();
    };
  }, [onError]);

  // Reference to stopRecording for use in duration check
  const stopRecordingRef = useRef<(() => Promise<void>) | null>(null);

  // Start recording - optimized for instant start when preconnected
  const startRecording = useCallback(async () => {
    if (isRecording || isCleaningUp.current) {
      return;
    }

    if (__DEV__) console.log('[Recording] Starting...');
    setError(null);
    setFinalText('');
    setPartialText('');

    try {
      // Haptic feedback immediately
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Request permissions (should already be granted from preconnect)
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        throw new Error('Microphone permission denied');
      }

      // Set state immediately so UI responds
      updateState('listening');
      setIsRecording(true);
      
      // Track recording start time for duration limit
      recordingStartTime.current = Date.now();

      // Initialize live audio stream (fast, usually already done)
      await liveAudioStream.initialize();

      // Check if already preconnected
      const wasPreconnected = assemblyaiStreaming.isPreconnected();
      
      if (wasPreconnected) {
        // Best case: preconnect worked, we can start immediately
        if (__DEV__) console.log('[Recording] AssemblyAI already connected (preconnect worked)');
      } else {
        // Need to connect first - enable buffering so we don't lose audio
        if (__DEV__) console.log('[Recording] Connecting to AssemblyAI...');
        assemblyaiStreaming.enableBuffering();
        await assemblyaiStreaming.connect();
        if (__DEV__) console.log('[Recording] AssemblyAI connected');
      }

      // Start audio capture
      if (__DEV__) console.log('[Recording] Starting audio stream...');
      await liveAudioStream.start();
      if (__DEV__) console.log('[Recording] Audio stream started');

      // Start duration monitoring for 30-minute limit
      durationCheckInterval.current = setInterval(() => {
        if (recordingStartTime.current) {
          const elapsed = Date.now() - recordingStartTime.current;
          if (elapsed >= MAX_RECORDING_DURATION_MS) {
            if (__DEV__) console.log('[Recording] 30-minute limit reached, auto-stopping...');
            // Give haptic warning
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            // Auto-stop recording
            if (stopRecordingRef.current) {
              stopRecordingRef.current();
            }
          }
        }
      }, 1000); // Check every second

      if (__DEV__) console.log('[Recording] Started successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      console.error('[Recording] Start error:', err);
      setError(errorMessage);
      onError?.(errorMessage);
      updateState('error');
      
      // Cleanup on error
      await liveAudioStream.stop();
      await assemblyaiStreaming.disconnect();
      setIsRecording(false);
      recordingStartTime.current = null;
      if (durationCheckInterval.current) {
        clearInterval(durationCheckInterval.current);
        durationCheckInterval.current = null;
      }
    }
  }, [isRecording, onError, requestPermissions, updateState]);

  // Stop recording - optimized for faster completion
  const stopRecording = useCallback(async () => {
    if (!isRecording || isCleaningUp.current) {
      return;
    }

    if (__DEV__) console.log('[Recording] Stopping...');
    isCleaningUp.current = true;

    // Calculate session duration before clearing the start time
    const sessionDuration = recordingStartTime.current 
      ? Date.now() - recordingStartTime.current 
      : 0;

    // Clear duration check interval
    if (durationCheckInterval.current) {
      clearInterval(durationCheckInterval.current);
      durationCheckInterval.current = null;
    }

    try {
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      setIsRecording(false);
      updateState('processing');

      // Stop audio streaming immediately
      await liveAudioStream.stop();

      // Small delay to ensure final audio chunk is processed (reduced from 500ms)
      await new Promise(resolve => setTimeout(resolve, 100));

      // Disconnect from streaming
      await assemblyaiStreaming.disconnect();

      // Get final transcript from streaming
      const transcript = assemblyaiStreaming.getTranscript();
      const stats = assemblyaiStreaming.getStats();
      
      if (__DEV__) {
        console.log('[Recording] Stopped');
        console.log('[Recording] Final transcript:', transcript.finalText);
        console.log('[Recording] Chunks sent:', stats.chunksSent);
        console.log('[Recording] Session duration:', Math.round(sessionDuration / 1000), 'seconds');
      }

      setFinalText(transcript.finalText);
      setPartialText('');
      recordingStartTime.current = null;
      
      // Store the session duration for usage tracking
      setLastSessionDurationMs(sessionDuration);

      // If we have any transcript, mark as done
      if (transcript.finalText) {
        updateState('done');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        // No transcript received - might be an issue
        if (__DEV__) console.warn('[Recording] No transcript received');
        updateState('done');
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

  // Keep stopRecording ref updated for use in interval callback
  useEffect(() => {
    stopRecordingRef.current = stopRecording;
  }, [stopRecording]);

  // Cancel recording
  const cancelRecording = useCallback(async () => {
    if (isCleaningUp.current) {
      return;
    }

    if (__DEV__) console.log('[Recording] Cancelling...');
    isCleaningUp.current = true;

    // Clear duration check interval
    if (durationCheckInterval.current) {
      clearInterval(durationCheckInterval.current);
      durationCheckInterval.current = null;
    }

    try {
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Stop audio streaming
      await liveAudioStream.stop();

      // Disconnect streaming
      await assemblyaiStreaming.disconnect();
      assemblyaiStreaming.resetTranscript();

      // Reset state
      setIsRecording(false);
      setFinalText('');
      setPartialText('');
      setAmplitude(0);
      setError(null);
      recordingStartTime.current = null;
      updateState('idle');

      if (__DEV__) console.log('[Recording] Cancelled');
    } catch (err) {
      console.error('[Recording] Cancel error:', err);
    } finally {
      isCleaningUp.current = false;
    }
  }, [updateState]);

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
  }, []);

  // Prepare for recording - preconnect to AssemblyAI and request permissions
  // Call this when the recording UI opens for instant recording start
  const prepareRecording = useCallback(async () => {
    if (__DEV__) console.log('[Recording] Preparing (preconnecting)...');
    
    try {
      // Request permissions early (won't show dialog if already granted)
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        if (__DEV__) console.warn('[Recording] Permission not granted during prepare');
      }

      // Initialize live audio stream early
      await liveAudioStream.initialize();

      // Preconnect to AssemblyAI (fetches token + establishes WebSocket)
      await assemblyaiStreaming.preconnect();

      if (__DEV__) console.log('[Recording] Preparation complete');
    } catch (err) {
      // Don't fail - this is just preparation
      console.error('[Recording] Preparation error (non-fatal):', err);
    }
  }, [requestPermissions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear duration check interval
      if (durationCheckInterval.current) {
        clearInterval(durationCheckInterval.current);
        durationCheckInterval.current = null;
      }
      if (isRecording) {
        liveAudioStream.stop();
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
    lastSessionDurationMs,
    startRecording,
    stopRecording,
    cancelRecording,
    resetSession,
    prepareRecording,
  };
}
