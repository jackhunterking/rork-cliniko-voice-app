/**
 * Live Audio Stream Service
 * Real-time PCM audio capture using react-native-live-audio-stream
 * Provides base64-encoded audio chunks for AssemblyAI streaming
 */

import LiveAudioStream from 'react-native-live-audio-stream';
import { Platform } from 'react-native';

// Audio configuration for AssemblyAI (PCM16, 16kHz, mono)
const AUDIO_CONFIG = {
  sampleRate: 16000,
  channels: 1,
  bitsPerSample: 16,
  audioSource: 6, // VOICE_RECOGNITION on Android
  bufferSize: 4096, // ~256ms of audio at 16kHz
};

type AudioDataCallback = (base64Audio: string) => void;
type MeteringCallback = (amplitude: number, db: number) => void;
type ErrorCallback = (error: string) => void;

class LiveAudioStreamService {
  private isStreaming: boolean = false;
  private audioDataCallback: AudioDataCallback | null = null;
  private meteringCallback: MeteringCallback | null = null;
  private errorCallback: ErrorCallback | null = null;
  private isInitialized: boolean = false;

  /**
   * Initialize the audio stream with configuration
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      if (__DEV__) console.log('[LiveAudio] Already initialized');
      return;
    }

    if (__DEV__) console.log('[LiveAudio] Initializing...');

    try {
      LiveAudioStream.init({
        sampleRate: AUDIO_CONFIG.sampleRate,
        channels: AUDIO_CONFIG.channels,
        bitsPerSample: AUDIO_CONFIG.bitsPerSample,
        audioSource: AUDIO_CONFIG.audioSource,
        bufferSize: AUDIO_CONFIG.bufferSize,
      });

      // Set up the audio data listener
      LiveAudioStream.on('data', (base64Data: string) => {
        if (this.isStreaming && this.audioDataCallback) {
          this.audioDataCallback(base64Data);
          
          // Calculate amplitude from audio data for metering
          if (this.meteringCallback) {
            const amplitude = this.calculateAmplitude(base64Data);
            const db = this.amplitudeToDb(amplitude);
            this.meteringCallback(amplitude, db);
          }
        }
      });

      this.isInitialized = true;
      if (__DEV__) console.log('[LiveAudio] Initialized successfully');
    } catch (error) {
      console.error('[LiveAudio] Initialization failed:', error);
      this.errorCallback?.(error instanceof Error ? error.message : 'Failed to initialize audio');
      throw error;
    }
  }

  /**
   * Start streaming audio
   */
  async start(): Promise<void> {
    if (this.isStreaming) {
      if (__DEV__) console.log('[LiveAudio] Already streaming');
      return;
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    if (__DEV__) console.log('[LiveAudio] Starting stream...');

    try {
      LiveAudioStream.start();
      this.isStreaming = true;
      if (__DEV__) console.log('[LiveAudio] Stream started');
    } catch (error) {
      console.error('[LiveAudio] Failed to start stream:', error);
      this.errorCallback?.(error instanceof Error ? error.message : 'Failed to start audio stream');
      throw error;
    }
  }

  /**
   * Stop streaming audio
   */
  async stop(): Promise<void> {
    if (!this.isStreaming) {
      if (__DEV__) console.log('[LiveAudio] Not streaming');
      return;
    }

    if (__DEV__) console.log('[LiveAudio] Stopping stream...');

    try {
      LiveAudioStream.stop();
      this.isStreaming = false;
      if (__DEV__) console.log('[LiveAudio] Stream stopped');
    } catch (error) {
      console.error('[LiveAudio] Failed to stop stream:', error);
      this.isStreaming = false;
    }
  }

  /**
   * Calculate amplitude from base64 PCM data
   * Returns normalized value 0-100
   */
  private calculateAmplitude(base64Data: string): number {
    try {
      // Decode base64 to binary
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert to 16-bit samples and calculate RMS
      const samples = new Int16Array(bytes.buffer);
      let sumSquares = 0;
      
      for (let i = 0; i < samples.length; i++) {
        const normalized = samples[i] / 32768; // Normalize to -1 to 1
        sumSquares += normalized * normalized;
      }

      const rms = Math.sqrt(sumSquares / samples.length);
      
      // Convert RMS to 0-100 scale (with some amplification for visibility)
      const amplitude = Math.min(100, rms * 300);
      
      return amplitude;
    } catch {
      return 0;
    }
  }

  /**
   * Convert amplitude to decibels
   */
  private amplitudeToDb(amplitude: number): number {
    if (amplitude <= 0) return -160;
    // Convert from 0-100 scale back to 0-1, then to dB
    const normalizedAmplitude = amplitude / 100;
    const db = 20 * Math.log10(normalizedAmplitude);
    return Math.max(-160, Math.min(0, db));
  }

  /**
   * Register callback for audio data chunks
   */
  onAudioData(callback: AudioDataCallback): void {
    this.audioDataCallback = callback;
  }

  /**
   * Register callback for audio metering
   */
  onMetering(callback: MeteringCallback): void {
    this.meteringCallback = callback;
  }

  /**
   * Register callback for errors
   */
  onError(callback: ErrorCallback): void {
    this.errorCallback = callback;
  }

  /**
   * Remove all callbacks
   */
  removeAllCallbacks(): void {
    this.audioDataCallback = null;
    this.meteringCallback = null;
    this.errorCallback = null;
  }

  /**
   * Check if currently streaming
   */
  getIsStreaming(): boolean {
    return this.isStreaming;
  }

  /**
   * Get audio configuration
   */
  getConfig(): typeof AUDIO_CONFIG {
    return { ...AUDIO_CONFIG };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.isStreaming) {
      this.stop();
    }
    this.removeAllCallbacks();
    this.isInitialized = false;
  }
}

// Export singleton instance
export const liveAudioStream = new LiveAudioStreamService();
