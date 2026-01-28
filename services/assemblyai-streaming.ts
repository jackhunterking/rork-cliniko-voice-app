/**
 * AssemblyAI Streaming Service
 * WebSocket client for real-time speech-to-text transcription
 * 
 * Updated for Universal Streaming API (v3)
 * https://www.assemblyai.com/docs/api-reference/streaming-api/streaming-api
 * 
 * URL: wss://streaming.assemblyai.com/v3/ws
 * Audio: Binary PCM16 data (not JSON)
 */

import {
  RecordingState,
  TranscriptState,
} from '@/types/streaming';
import { supabase } from '@/lib/supabase';

// V3 Universal Streaming API endpoint
const ASSEMBLYAI_WS_URL = 'wss://streaming.assemblyai.com/v3/ws';
const SAMPLE_RATE = 16000;

// V3 Message types
interface SessionBeginsMessage {
  type: 'Begin';
  id: string;
  expires_at: string;
}

interface TurnMessage {
  type: 'Turn';
  turn_order: number;
  duration_ms: number;
  end_of_turn: boolean;
  transcript: string;
  words?: Array<{
    text: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

interface TerminationMessage {
  type: 'Termination';
  audio_duration_ms: number;
}

interface ErrorMessage {
  type: 'Error';
  error: string;
}

type V3Message = SessionBeginsMessage | TurnMessage | TerminationMessage | ErrorMessage;

type EventCallback<T> = (data: T) => void;

class AssemblyAIStreamingService {
  private socket: WebSocket | null = null;
  private socketId: number = 0; // Track which socket is current to handle race conditions
  private token: string | null = null;
  private sessionId: string | null = null;
  private useDirectKey: boolean = false;
  
  // Transcript state
  private transcriptFinal: string = '';
  private transcriptPartial: string = '';
  
  // Audio streaming stats
  private chunksSent: number = 0;
  private isSessionReady: boolean = false;
  
  // Pre-connection state
  private isPreconnecting: boolean = false;
  private preconnectPromise: Promise<void> | null = null;
  
  // Audio buffer for chunks received before session is ready
  private audioBuffer: string[] = [];
  private isBuffering: boolean = false;
  
  // Event callbacks
  private onSessionStartCallback: EventCallback<string> | null = null;
  private onPartialTextCallback: EventCallback<{ text: string; confidence: number }> | null = null;
  private onFinalTextCallback: EventCallback<{ text: string; confidence: number }> | null = null;
  private onSessionEndCallback: EventCallback<number> | null = null;
  private onErrorCallback: EventCallback<string> | null = null;
  private onStatusChangeCallback: EventCallback<RecordingState> | null = null;

  /**
   * Fetch API key/token from the Edge Function
   */
  async fetchToken(): Promise<string> {
    // Return cached token if available
    if (this.token) {
      if (__DEV__) console.log('[AAI] Using cached token');
      return this.token;
    }
    
    if (__DEV__) console.log('[AAI] Fetching API key from Edge Function...');
    
    const { data, error } = await supabase.functions.invoke('assemblyai-token', {
      method: 'POST',
    });

    if (error) {
      console.error('[AAI] Token fetch error:', error);
      throw new Error(`Failed to fetch token: ${error.message}`);
    }

    if (!data?.token) {
      throw new Error('No token received from server');
    }

    this.useDirectKey = data.useDirectKey || false;
    
    if (__DEV__) {
      console.log('[AAI] Token received');
      console.log('[AAI] Using direct key:', this.useDirectKey);
    }
    
    this.token = data.token;
    return data.token;
  }

  /**
   * Pre-connect to AssemblyAI (call this when dictation UI opens)
   * This fetches the token and establishes WebSocket connection in advance
   * so recording can start instantly when user presses record
   */
  async preconnect(): Promise<void> {
    // If already connected and ready, nothing to do
    if (this.isSessionReady && this.socket?.readyState === WebSocket.OPEN) {
      if (__DEV__) console.log('[AAI] Already preconnected and ready');
      return;
    }

    // If already preconnecting, wait for that to complete
    if (this.isPreconnecting && this.preconnectPromise) {
      if (__DEV__) console.log('[AAI] Preconnect already in progress, waiting...');
      return this.preconnectPromise;
    }

    if (__DEV__) console.log('[AAI] Preconnecting...');
    this.isPreconnecting = true;
    this.isBuffering = true; // Enable buffering until session is ready

    this.preconnectPromise = (async () => {
      try {
        // Pre-fetch token
        await this.fetchToken();
        
        // Establish connection (this resolves when WebSocket opens)
        await this.connect();
        
        // Wait for session to be ready (Begin message received)
        // This ensures we're fully ready when user presses record
        const waitForSession = async (): Promise<void> => {
          const maxWait = 5000; // 5 seconds max
          const checkInterval = 50; // Check every 50ms
          let waited = 0;
          
          while (!this.isSessionReady && waited < maxWait) {
            await new Promise(resolve => setTimeout(resolve, checkInterval));
            waited += checkInterval;
          }
          
          if (!this.isSessionReady) {
            throw new Error('Session start timeout');
          }
        };
        
        await waitForSession();
        
        if (__DEV__) console.log('[AAI] Preconnect complete, session ready');
      } catch (error) {
        console.error('[AAI] Preconnect failed:', error);
        // Don't throw - preconnect failures shouldn't block recording
        // We'll retry when recording actually starts
      } finally {
        this.isPreconnecting = false;
        this.preconnectPromise = null;
      }
    })();

    return this.preconnectPromise;
  }

  /**
   * Check if preconnected and ready to receive audio immediately
   */
  isPreconnected(): boolean {
    return this.isSessionReady && this.socket?.readyState === WebSocket.OPEN;
  }

  /**
   * Connect to AssemblyAI streaming WebSocket (v3)
   */
  async connect(): Promise<void> {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      if (__DEV__) console.log('[AAI] Already connected');
      return;
    }
    
    if (this.socket) {
      if (__DEV__) console.log('[AAI] Socket exists but not open, disconnecting first...');
      await this.disconnect();
    }

    // Reset transcript state
    this.transcriptFinal = '';
    this.transcriptPartial = '';
    this.chunksSent = 0;
    this.isSessionReady = false;
    this.audioBuffer = []; // Clear audio buffer
    this.isBuffering = true; // Enable buffering until session is ready

    // Fetch fresh token if we don't have one
    if (!this.token) {
      await this.fetchToken();
    }

    return new Promise((resolve, reject) => {
      // Build WebSocket URL for v3 API
      // URL format: wss://streaming.assemblyai.com/v3/ws?sample_rate=16000&token=TOKEN
      const wsUrl = `${ASSEMBLYAI_WS_URL}?sample_rate=${SAMPLE_RATE}&token=${this.token}`;
      
      if (__DEV__) console.log('[AAI] Connecting to v3 WebSocket:', ASSEMBLYAI_WS_URL);
      
      // Increment socket ID to track which socket is current
      // This prevents race conditions where old socket's onclose handler
      // clears the reference to a newer socket
      this.socketId++;
      const currentSocketId = this.socketId;
      
      const newSocket = new WebSocket(wsUrl);
      this.socket = newSocket;
      // Important: For v3 API, we send binary data
      newSocket.binaryType = 'arraybuffer';

      newSocket.onopen = () => {
        // Only process if this is still the current socket
        if (this.socketId !== currentSocketId) {
          if (__DEV__) console.log('[AAI] Ignoring onopen from old socket');
          newSocket.close();
          return;
        }
        if (__DEV__) console.log('[AAI] WebSocket connected');
        this.onStatusChangeCallback?.('listening');
        resolve();
      };

      newSocket.onmessage = (event) => {
        // Only process if this is still the current socket
        if (this.socketId !== currentSocketId) {
          return;
        }
        // V3 responses are JSON text
        if (typeof event.data === 'string') {
          this.handleMessage(event.data);
        } else {
          // Binary response (shouldn't happen normally)
          if (__DEV__) console.log('[AAI] Received binary data');
        }
      };

      newSocket.onerror = (event) => {
        // Only process if this is still the current socket
        if (this.socketId !== currentSocketId) {
          return;
        }
        console.error('[AAI] WebSocket error:', event);
        this.token = null; // Clear token on error to force re-fetch
        this.onErrorCallback?.('Connection error');
        this.onStatusChangeCallback?.('error');
        reject(new Error('WebSocket connection failed'));
      };

      newSocket.onclose = (event) => {
        if (__DEV__) console.log('[AAI] WebSocket closed:', event.code, event.reason);
        
        // CRITICAL: Only clear socket reference if this is still the current socket
        // This prevents old socket's onclose from clearing a newer socket reference
        if (this.socketId === currentSocketId) {
          this.socket = null;
          this.isSessionReady = false;
          
          // If it wasn't a normal close, report error
          if (event.code !== 1000 && event.code !== 1005) {
            this.onErrorCallback?.(`Connection closed: ${event.reason || 'Not authorized'}`);
          }
        } else {
          if (__DEV__) console.log('[AAI] Ignoring onclose from old socket (id:', currentSocketId, 'current:', this.socketId, ')');
        }
      };

      // Timeout connection attempt
      setTimeout(() => {
        if (this.socketId === currentSocketId && newSocket.readyState === WebSocket.CONNECTING) {
          newSocket.close();
          reject(new Error('Connection timeout'));
        }
      }, 15000);
    });
  }

  /**
   * Handle incoming WebSocket messages (v3 format)
   */
  private handleMessage(data: string): void {
    try {
      const message: V3Message = JSON.parse(data);
      
      if (__DEV__) console.log('[AAI] Message type:', message.type);

      switch (message.type) {
        case 'Begin':
          // Session has started
          this.sessionId = message.id;
          this.isSessionReady = true;
          this.isBuffering = false;
          if (__DEV__) console.log('[AAI] Session started:', message.id);
          
          // Flush any buffered audio chunks
          if (this.audioBuffer.length > 0) {
            if (__DEV__) console.log('[AAI] Flushing', this.audioBuffer.length, 'buffered audio chunks');
            for (const chunk of this.audioBuffer) {
              this.sendAudioChunkInternal(chunk);
            }
            this.audioBuffer = [];
          }
          
          this.onSessionStartCallback?.(message.id);
          break;

        case 'Turn':
          // Turn-based transcription (v3 uses turns instead of partial/final)
          const turnMsg = message as TurnMessage;
          
          if (turnMsg.end_of_turn) {
            // Final turn - append to stable transcript
            if (turnMsg.transcript) {
              this.transcriptFinal = this.transcriptFinal
                ? `${this.transcriptFinal} ${turnMsg.transcript}`
                : turnMsg.transcript;
            }
            // Clear partial
            this.transcriptPartial = '';
            this.onFinalTextCallback?.({
              text: turnMsg.transcript,
              confidence: 1.0, // v3 doesn't always provide word-level confidence
            });
          } else {
            // Partial turn - update in-place
            this.transcriptPartial = turnMsg.transcript;
            this.onStatusChangeCallback?.('recognizing');
            this.onPartialTextCallback?.({
              text: turnMsg.transcript,
              confidence: 1.0,
            });
          }
          break;

        case 'Termination':
          // Session terminated
          const termMsg = message as TerminationMessage;
          if (__DEV__) console.log('[AAI] Session terminated, duration:', termMsg.audio_duration_ms);
          this.onSessionEndCallback?.(termMsg.audio_duration_ms / 1000);
          break;

        case 'Error':
          // Error from server
          const errMsg = message as ErrorMessage;
          console.error('[AAI] Server error:', errMsg.error);
          this.onErrorCallback?.(errMsg.error);
          this.onStatusChangeCallback?.('error');
          break;

        default:
          if (__DEV__) console.log('[AAI] Unknown message:', data);
      }
    } catch (error) {
      console.error('[AAI] Failed to parse message:', error, data);
    }
  }

  /**
   * Send audio chunk to AssemblyAI
   * V3 API: Audio must be sent as RAW BINARY PCM16 data at 16kHz mono
   * NOT as JSON with base64 encoding!
   * 
   * If session isn't ready yet, chunks are buffered and sent when ready.
   */
  sendAudioChunk(base64Audio: string): boolean {
    // If session is ready, send directly
    if (this.isSessionReady && this.socket?.readyState === WebSocket.OPEN) {
      return this.sendAudioChunkInternal(base64Audio);
    }

    // If we're buffering (preconnecting), add to buffer
    if (this.isBuffering) {
      // Limit buffer size to prevent memory issues (max ~10 seconds of audio)
      const MAX_BUFFER_SIZE = 100; // ~25 seconds at 250ms chunks
      if (this.audioBuffer.length < MAX_BUFFER_SIZE) {
        this.audioBuffer.push(base64Audio);
        if (__DEV__ && this.audioBuffer.length % 10 === 0) {
          console.log('[AAI] Buffered chunks:', this.audioBuffer.length);
        }
        return true;
      } else {
        if (__DEV__) console.warn('[AAI] Audio buffer full, dropping chunk');
        return false;
      }
    }

    if (__DEV__) console.warn('[AAI] Cannot send audio: not connected and not buffering');
    return false;
  }

  /**
   * Internal method to send audio chunk directly to WebSocket
   */
  private sendAudioChunkInternal(base64Audio: string): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      // Convert base64 to binary ArrayBuffer for v3 API
      const binaryData = this.base64ToArrayBuffer(base64Audio);
      
      // V3 API: Send raw binary audio data (NOT JSON!)
      this.socket.send(binaryData);
      this.chunksSent++;
      
      // Log every 10th chunk in dev mode
      if (__DEV__ && this.chunksSent % 10 === 0) {
        console.log('[AAI] Chunks sent:', this.chunksSent, 'bytes:', binaryData.byteLength);
      }
      
      return true;
    } catch (error) {
      console.error('[AAI] Failed to send audio chunk:', error);
      return false;
    }
  }

  /**
   * Convert base64 string to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    // Remove any data URL prefix if present
    const cleanBase64 = base64.replace(/^data:audio\/[^;]+;base64,/, '');
    
    // Decode base64 to binary string
    const binaryString = atob(cleanBase64);
    const length = binaryString.length;
    const bytes = new Uint8Array(length);
    
    for (let i = 0; i < length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes.buffer;
  }

  /**
   * Check if session is ready to receive audio
   */
  isReady(): boolean {
    return this.isSessionReady && this.socket?.readyState === WebSocket.OPEN;
  }

  /**
   * Enable audio buffering (for when recording starts before session is ready)
   */
  enableBuffering(): void {
    this.isBuffering = true;
    if (__DEV__) console.log('[AAI] Buffering enabled');
  }

  /**
   * Get buffer status for debugging
   */
  getBufferStatus(): { isBuffering: boolean; bufferSize: number } {
    return {
      isBuffering: this.isBuffering,
      bufferSize: this.audioBuffer.length,
    };
  }

  /**
   * Get streaming stats
   */
  getStats(): { chunksSent: number; isSessionReady: boolean } {
    return {
      chunksSent: this.chunksSent,
      isSessionReady: this.isSessionReady,
    };
  }

  /**
   * Gracefully disconnect from AssemblyAI
   */
  async disconnect(): Promise<void> {
    this.isSessionReady = false;
    this.isBuffering = false;
    this.audioBuffer = [];
    
    if (!this.socket) {
      return;
    }

    if (__DEV__) console.log('[AAI] Disconnecting... Chunks sent:', this.chunksSent);

    return new Promise((resolve) => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        // V3 API: Send terminate message as JSON
        this.socket.send(JSON.stringify({ terminate_session: true }));
        
        // Wait for close or timeout
        const closeTimeout = setTimeout(() => {
          if (this.socket) {
            this.socket.close();
            this.socket = null;
          }
          resolve();
        }, 2000);

        this.socket.onclose = () => {
          clearTimeout(closeTimeout);
          this.socket = null;
          resolve();
        };
      } else {
        if (this.socket) {
          this.socket.close();
          this.socket = null;
        }
        resolve();
      }
    });
  }

  /**
   * Get current transcript state
   */
  getTranscript(): TranscriptState {
    const combined = this.transcriptPartial
      ? `${this.transcriptFinal} ${this.transcriptPartial}`.trim()
      : this.transcriptFinal;

    return {
      finalText: this.transcriptFinal,
      partialText: this.transcriptPartial,
      combinedText: combined,
    };
  }

  /**
   * Get final transcript only (stable text)
   */
  getFinalTranscript(): string {
    return this.transcriptFinal;
  }

  /**
   * Reset transcript state
   */
  resetTranscript(): void {
    this.transcriptFinal = '';
    this.transcriptPartial = '';
  }

  /**
   * Clear token (force re-fetch on next connect)
   */
  clearToken(): void {
    this.token = null;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  // Event registration methods
  onSessionStart(callback: EventCallback<string>): void {
    this.onSessionStartCallback = callback;
  }

  onPartialText(callback: EventCallback<{ text: string; confidence: number }>): void {
    this.onPartialTextCallback = callback;
  }

  onFinalText(callback: EventCallback<{ text: string; confidence: number }>): void {
    this.onFinalTextCallback = callback;
  }

  onSessionEnd(callback: EventCallback<number>): void {
    this.onSessionEndCallback = callback;
  }

  onError(callback: EventCallback<string>): void {
    this.onErrorCallback = callback;
  }

  onStatusChange(callback: EventCallback<RecordingState>): void {
    this.onStatusChangeCallback = callback;
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners(): void {
    this.onSessionStartCallback = null;
    this.onPartialTextCallback = null;
    this.onFinalTextCallback = null;
    this.onSessionEndCallback = null;
    this.onErrorCallback = null;
    this.onStatusChangeCallback = null;
  }
}

// Export singleton instance
export const assemblyaiStreaming = new AssemblyAIStreamingService();
