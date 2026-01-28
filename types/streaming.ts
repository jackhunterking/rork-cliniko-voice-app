/**
 * AssemblyAI Streaming Types
 * Types for real-time speech-to-text streaming events and state management
 */

// Recording state machine states
export type RecordingState = 
  | 'idle'        // Ready to record
  | 'listening'   // Recording started, waiting for speech
  | 'recognizing' // Receiving partial transcripts
  | 'processing'  // Post-processing with Slam-1
  | 'done'        // Final transcript ready
  | 'error';      // Error state

// AssemblyAI WebSocket message types
export interface AssemblyAISessionBegins {
  message_type: 'SessionBegins';
  session_id: string;
  expires_at: string;
}

export interface AssemblyAIPartialTranscript {
  message_type: 'PartialTranscript';
  audio_start: number;
  audio_end: number;
  confidence: number;
  text: string;
  words: AssemblyAIWord[];
  created: string;
}

export interface AssemblyAIFinalTranscript {
  message_type: 'FinalTranscript';
  audio_start: number;
  audio_end: number;
  confidence: number;
  text: string;
  words: AssemblyAIWord[];
  punctuated: boolean;
  text_formatted: boolean;
  created: string;
}

export interface AssemblyAIWord {
  text: string;
  start: number;
  end: number;
  confidence: number;
}

export interface AssemblyAISessionTerminated {
  message_type: 'SessionTerminated';
  audio_duration_seconds: number;
}

export interface AssemblyAIError {
  message_type: 'Error';
  error: string;
}

export type AssemblyAIMessage =
  | AssemblyAISessionBegins
  | AssemblyAIPartialTranscript
  | AssemblyAIFinalTranscript
  | AssemblyAISessionTerminated
  | AssemblyAIError;

// Streaming service events
export interface StreamingEvents {
  onSessionStart: (sessionId: string) => void;
  onPartialText: (text: string, confidence: number) => void;
  onFinalText: (text: string, confidence: number) => void;
  onSessionEnd: (audioDuration: number) => void;
  onError: (error: string) => void;
  onStatusChange: (status: RecordingState) => void;
}

// Transcript state
export interface TranscriptState {
  finalText: string;      // Committed transcript (stable)
  partialText: string;    // Current partial (updates in-place)
  combinedText: string;   // finalText + partialText for display
}

// Audio metering data
export interface AudioMeteringData {
  amplitude: number;      // 0-100 normalized amplitude
  db: number;             // Raw dB value (-160 to 0)
  isClipping: boolean;    // True if audio is clipping
}

// Token response from Edge Function
export interface AssemblyAITokenResponse {
  token: string;
  expiresIn: number;      // Seconds until expiry
}

// Finalize request to Edge Function
export interface FinalizeTranscriptRequest {
  audioUri: string;
  streamingTranscript: string;  // Draft from streaming
  medicalMode: boolean;
}

// Finalize response from Edge Function
export interface FinalizeTranscriptResponse {
  finalText: string;
  confidence: number;
  duration: number;       // Audio duration in seconds
  words?: AssemblyAIWord[];
}

// Recording session configuration
export interface RecordingSessionConfig {
  sampleRate: number;
  channels: number;
  bitDepth: number;
  enableMetering: boolean;
}

export const DEFAULT_RECORDING_CONFIG: RecordingSessionConfig = {
  sampleRate: 16000,
  channels: 1,
  bitDepth: 16,
  enableMetering: true,
};

// Status labels for UI
export const RECORDING_STATE_LABELS: Record<RecordingState, string> = {
  idle: 'Ready',
  listening: 'Listening…',
  recognizing: 'Recognizing…',
  processing: 'Finalizing…',
  done: 'Saved',
  error: 'Error',
};
