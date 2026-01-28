/**
 * Audio Recording Service
 * Handles microphone recording with expo-av and metering for waveform visualization
 */

import { Audio, AVPlaybackStatus } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { AudioMeteringData, DEFAULT_RECORDING_CONFIG } from '@/types/streaming';

// Audio recording options optimized for speech-to-text
const RECORDING_OPTIONS: Audio.RecordingOptions = {
  isMeteringEnabled: true,
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    extension: '.m4a',
    outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  },
};

// PCM options for streaming (AssemblyAI requires PCM16)
const PCM_RECORDING_OPTIONS: Audio.RecordingOptions = {
  isMeteringEnabled: true,
  android: {
    extension: '.wav',
    outputFormat: Audio.AndroidOutputFormat.DEFAULT,
    audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 256000,
  },
  ios: {
    extension: '.wav',
    outputFormat: Audio.IOSOutputFormat.LINEARPCM,
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 256000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/wav',
    bitsPerSecond: 256000,
  },
};

type MeteringCallback = (data: AudioMeteringData) => void;
type AudioChunkCallback = (base64Audio: string) => void;

class AudioRecordingService {
  private recording: Audio.Recording | null = null;
  private permissionGranted: boolean = false;
  private meteringInterval: NodeJS.Timeout | null = null;
  private meteringCallback: MeteringCallback | null = null;
  private chunkCallback: AudioChunkCallback | null = null;
  private isRecording: boolean = false;
  private chunkInterval: NodeJS.Timeout | null = null;
  private lastChunkPosition: number = 0;

  /**
   * Request microphone permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (__DEV__) console.log('[Audio] Requesting permissions...');
    
    try {
      const { status } = await Audio.requestPermissionsAsync();
      this.permissionGranted = status === 'granted';
      
      if (__DEV__) console.log('[Audio] Permission status:', status);
      
      if (!this.permissionGranted) {
        console.warn('[Audio] Microphone permission denied');
      }
      
      return this.permissionGranted;
    } catch (error) {
      console.error('[Audio] Permission request failed:', error);
      return false;
    }
  }

  /**
   * Configure audio mode for recording
   */
  private async configureAudioMode(): Promise<void> {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }

  /**
   * Start recording audio
   */
  async startRecording(options?: { usePCM?: boolean }): Promise<void> {
    if (this.isRecording) {
      if (__DEV__) console.log('[Audio] Already recording');
      return;
    }

    // Check permissions
    if (!this.permissionGranted) {
      const granted = await this.requestPermissions();
      if (!granted) {
        throw new Error('Microphone permission not granted');
      }
    }

    if (__DEV__) console.log('[Audio] Starting recording...');

    try {
      // Configure audio mode
      await this.configureAudioMode();

      // Create and start recording
      const recordingOptions = options?.usePCM ? PCM_RECORDING_OPTIONS : RECORDING_OPTIONS;
      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      
      this.recording = recording;
      this.isRecording = true;
      this.lastChunkPosition = 0;

      // Start metering updates
      this.startMetering();

      if (__DEV__) console.log('[Audio] Recording started');
    } catch (error) {
      console.error('[Audio] Failed to start recording:', error);
      this.isRecording = false;
      throw error;
    }
  }

  /**
   * Stop recording and return the audio file URI
   */
  async stopRecording(): Promise<string | null> {
    if (!this.recording || !this.isRecording) {
      if (__DEV__) console.log('[Audio] No active recording to stop');
      return null;
    }

    if (__DEV__) console.log('[Audio] Stopping recording...');

    try {
      // Stop metering
      this.stopMetering();
      this.stopChunking();

      // Stop and unload recording
      await this.recording.stopAndUnloadAsync();
      
      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = this.recording.getURI();
      
      if (__DEV__) console.log('[Audio] Recording stopped, URI:', uri);
      
      this.recording = null;
      this.isRecording = false;
      
      return uri;
    } catch (error) {
      console.error('[Audio] Failed to stop recording:', error);
      this.recording = null;
      this.isRecording = false;
      throw error;
    }
  }

  /**
   * Cancel recording without saving
   */
  async cancelRecording(): Promise<void> {
    if (!this.recording) {
      return;
    }

    if (__DEV__) console.log('[Audio] Cancelling recording...');

    try {
      this.stopMetering();
      this.stopChunking();
      
      await this.recording.stopAndUnloadAsync();
      
      // Delete the recorded file
      const uri = this.recording.getURI();
      if (uri) {
        try {
          await FileSystem.deleteAsync(uri, { idempotent: true });
        } catch {
          // Ignore deletion errors
        }
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      this.recording = null;
      this.isRecording = false;
      
      if (__DEV__) console.log('[Audio] Recording cancelled');
    } catch (error) {
      console.error('[Audio] Failed to cancel recording:', error);
      this.recording = null;
      this.isRecording = false;
    }
  }

  /**
   * Start audio level metering
   */
  private startMetering(): void {
    if (this.meteringInterval) {
      clearInterval(this.meteringInterval);
    }

    // Poll metering at 60fps (roughly)
    this.meteringInterval = setInterval(async () => {
      if (!this.recording || !this.isRecording) {
        return;
      }

      try {
        const status = await this.recording.getStatusAsync();
        
        if (status.isRecording && status.metering !== undefined) {
          // Convert dB to 0-100 amplitude
          // Metering typically returns values from -160 (silence) to 0 (max)
          const db = status.metering;
          const normalized = Math.max(0, Math.min(100, (db + 60) * 1.66));
          const isClipping = db >= -3;

          const meteringData: AudioMeteringData = {
            amplitude: normalized,
            db,
            isClipping,
          };

          this.meteringCallback?.(meteringData);
        }
      } catch (error) {
        // Ignore metering errors during recording
      }
    }, 50); // ~20 updates per second
  }

  /**
   * Stop audio level metering
   */
  private stopMetering(): void {
    if (this.meteringInterval) {
      clearInterval(this.meteringInterval);
      this.meteringInterval = null;
    }
  }

  /**
   * Start sending audio chunks for streaming
   * Note: This is a simplified implementation. For production,
   * you may need native modules for real-time PCM access.
   */
  startChunking(chunkIntervalMs: number = 250): void {
    if (this.chunkInterval) {
      clearInterval(this.chunkInterval);
    }

    // For now, we'll read the file periodically
    // In production, consider using a native module for real-time PCM streaming
    this.chunkInterval = setInterval(async () => {
      if (!this.recording || !this.isRecording || !this.chunkCallback) {
        return;
      }

      try {
        const status = await this.recording.getStatusAsync();
        
        if (status.isRecording && status.durationMillis > this.lastChunkPosition) {
          // Note: expo-av doesn't provide direct PCM access during recording
          // This is a placeholder for when we need to send chunks
          // In production, you'd use a native module or different approach
          this.lastChunkPosition = status.durationMillis;
        }
      } catch (error) {
        // Ignore errors during chunking
      }
    }, chunkIntervalMs);
  }

  /**
   * Stop sending audio chunks
   */
  stopChunking(): void {
    if (this.chunkInterval) {
      clearInterval(this.chunkInterval);
      this.chunkInterval = null;
    }
  }

  /**
   * Read audio file as base64
   */
  async getAudioAsBase64(uri: string): Promise<string> {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error('[Audio] Failed to read audio file:', error);
      throw error;
    }
  }

  /**
   * Get audio file info
   */
  async getAudioFileInfo(uri: string): Promise<FileSystem.FileInfo> {
    return FileSystem.getInfoAsync(uri);
  }

  /**
   * Register metering callback
   */
  onMetering(callback: MeteringCallback): void {
    this.meteringCallback = callback;
  }

  /**
   * Register audio chunk callback
   */
  onAudioChunk(callback: AudioChunkCallback): void {
    this.chunkCallback = callback;
  }

  /**
   * Remove all callbacks
   */
  removeAllCallbacks(): void {
    this.meteringCallback = null;
    this.chunkCallback = null;
  }

  /**
   * Check if currently recording
   */
  getIsRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Check if permissions are granted
   */
  hasPermissions(): boolean {
    return this.permissionGranted;
  }

  /**
   * Get current recording duration in milliseconds
   */
  async getDuration(): Promise<number> {
    if (!this.recording) {
      return 0;
    }

    try {
      const status = await this.recording.getStatusAsync();
      return status.durationMillis || 0;
    } catch {
      return 0;
    }
  }
}

// Export singleton instance
export const audioRecording = new AudioRecordingService();
