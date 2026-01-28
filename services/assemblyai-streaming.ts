/**
 * AssemblyAI Streaming Service
 * WebSocket client for real-time speech-to-text transcription
 * 
 * Security: Uses temporary tokens from Edge Function, never exposes API key
 */

import {
  AssemblyAIMessage,
  RecordingState,
  StreamingEvents,
  TranscriptState,
  AssemblyAITokenResponse,
} from '@/types/streaming';
import { supabase } from '@/lib/supabase';

const ASSEMBLYAI_WS_URL = 'wss://api.assemblyai.com/v2/realtime/ws';
const SAMPLE_RATE = 16000;

type EventCallback<T> = (data: T) => void;

class AssemblyAIStreamingService {
  private socket: WebSocket | null = null;
  private token: string | null = null;
  private sessionId: string | null = null;
  
  // Transcript state
  private transcriptFinal: string = '';
  private transcriptPartial: string = '';
  
  // Event callbacks
  private onSessionStartCallback: EventCallback<string> | null = null;
  private onPartialTextCallback: EventCallback<{ text: string; confidence: number }> | null = null;
  private onFinalTextCallback: EventCallback<{ text: string; confidence: number }> | null = null;
  private onSessionEndCallback: EventCallback<number> | null = null;
  private onErrorCallback: EventCallback<string> | null = null;
  private onStatusChangeCallback: EventCallback<RecordingState> | null = null;

  /**
   * Fetch a temporary token from the Edge Function
   */
  async fetchToken(): Promise<string> {
    if (__DEV__) console.log('[AAI] Fetching temporary token...');
    
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

    if (__DEV__) console.log('[AAI] Token received, expires in:', data.expiresIn, 'seconds');
    
    this.token = data.token;
    return data.token;
  }

  /**
   * Connect to AssemblyAI streaming WebSocket
   */
  async connect(): Promise<void> {
    if (this.socket) {
      if (__DEV__) console.log('[AAI] Already connected, disconnecting first...');
      await this.disconnect();
    }

    // Reset transcript state
    this.transcriptFinal = '';
    this.transcriptPartial = '';

    // Fetch fresh token if we don't have one
    if (!this.token) {
      await this.fetchToken();
    }

    return new Promise((resolve, reject) => {
      const wsUrl = `${ASSEMBLYAI_WS_URL}?sample_rate=${SAMPLE_RATE}&token=${this.token}`;
      
      if (__DEV__) console.log('[AAI] Connecting to WebSocket...');
      
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        if (__DEV__) console.log('[AAI] WebSocket connected');
        this.onStatusChangeCallback?.('listening');
        resolve();
      };

      this.socket.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.socket.onerror = (event) => {
        console.error('[AAI] WebSocket error:', event);
        this.onErrorCallback?.('Connection error');
        this.onStatusChangeCallback?.('error');
        reject(new Error('WebSocket connection failed'));
      };

      this.socket.onclose = (event) => {
        if (__DEV__) console.log('[AAI] WebSocket closed:', event.code, event.reason);
        this.socket = null;
        
        // If it wasn't a normal close, report error
        if (event.code !== 1000 && event.code !== 1005) {
          this.onErrorCallback?.(`Connection closed: ${event.reason || 'Unknown reason'}`);
        }
      };

      // Timeout connection attempt
      setTimeout(() => {
        if (this.socket?.readyState === WebSocket.CONNECTING) {
          this.socket.close();
          reject(new Error('Connection timeout'));
        }
      }, 10000);
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: string): void {
    try {
      const message: AssemblyAIMessage = JSON.parse(data);
      
      if (__DEV__) console.log('[AAI] Message:', message.message_type);

      switch (message.message_type) {
        case 'SessionBegins':
          this.sessionId = message.session_id;
          if (__DEV__) console.log('[AAI] Session started:', message.session_id);
          this.onSessionStartCallback?.(message.session_id);
          break;

        case 'PartialTranscript':
          // Update partial in-place (don't append)
          this.transcriptPartial = message.text;
          this.onStatusChangeCallback?.('recognizing');
          this.onPartialTextCallback?.({
            text: message.text,
            confidence: message.confidence,
          });
          break;

        case 'FinalTranscript':
          // Append final to stable transcript
          if (message.text) {
            this.transcriptFinal = this.transcriptFinal
              ? `${this.transcriptFinal} ${message.text}`
              : message.text;
          }
          // Clear partial since it's now finalized
          this.transcriptPartial = '';
          this.onFinalTextCallback?.({
            text: message.text,
            confidence: message.confidence,
          });
          break;

        case 'SessionTerminated':
          if (__DEV__) console.log('[AAI] Session terminated, duration:', message.audio_duration_seconds);
          this.onSessionEndCallback?.(message.audio_duration_seconds);
          break;

        case 'Error':
          console.error('[AAI] Server error:', message.error);
          this.onErrorCallback?.(message.error);
          this.onStatusChangeCallback?.('error');
          break;

        default:
          if (__DEV__) console.log('[AAI] Unknown message type:', (message as any).message_type);
      }
    } catch (error) {
      console.error('[AAI] Failed to parse message:', error);
    }
  }

  /**
   * Send audio chunk to AssemblyAI
   * Audio must be base64-encoded PCM16 at 16kHz mono
   */
  sendAudioChunk(base64Audio: string): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      if (__DEV__) console.warn('[AAI] Cannot send audio: socket not open');
      return;
    }

    const message = JSON.stringify({
      audio_data: base64Audio,
    });

    this.socket.send(message);
  }

  /**
   * Gracefully disconnect from AssemblyAI
   */
  async disconnect(): Promise<void> {
    if (!this.socket) {
      return;
    }

    if (__DEV__) console.log('[AAI] Disconnecting...');

    return new Promise((resolve) => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        // Send terminate message
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
