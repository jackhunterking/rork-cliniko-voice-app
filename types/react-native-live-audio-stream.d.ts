/**
 * Type declarations for react-native-live-audio-stream
 */

declare module 'react-native-live-audio-stream' {
  export interface AudioConfig {
    /** Sample rate in Hz (e.g., 16000, 44100) */
    sampleRate: number;
    /** Number of audio channels (1 for mono, 2 for stereo) */
    channels: number;
    /** Bits per sample (8 or 16) */
    bitsPerSample: number;
    /** Audio source (Android only). 6 = VOICE_RECOGNITION */
    audioSource?: number;
    /** Buffer size in bytes */
    bufferSize?: number;
  }

  export interface LiveAudioStream {
    /**
     * Initialize the audio stream with configuration
     */
    init(config: AudioConfig): void;

    /**
     * Start recording audio
     */
    start(): void;

    /**
     * Stop recording audio
     */
    stop(): void;

    /**
     * Register event listener
     * @param event Event name ('data' for audio data)
     * @param callback Callback function receiving base64-encoded audio data
     */
    on(event: 'data', callback: (data: string) => void): void;
  }

  const LiveAudioStream: LiveAudioStream;
  export default LiveAudioStream;
}
