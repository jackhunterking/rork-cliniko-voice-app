/**
 * Debug Store
 * Zustand store for tracking API calls and diagnostics information
 * 
 * This store is NOT persisted - it only holds runtime diagnostic data.
 * Used by the Diagnostics screen to show last API call info.
 */

import { create } from 'zustand';

export interface ApiCallRecord {
  /** API endpoint called (e.g., "/patients") */
  endpoint: string;
  /** HTTP method */
  method: string;
  /** HTTP status code (0 if network error) */
  status: number;
  /** Duration in milliseconds */
  duration: number;
  /** Timestamp of the call */
  timestamp: Date;
  /** Error message if failed */
  errorMessage?: string;
  /** Short preview of response (first 100 chars, no secrets) */
  responsePreview?: string;
  /** Whether the call was successful */
  success: boolean;
}

interface DebugState {
  /** The most recent Cliniko API call */
  lastApiCall: ApiCallRecord | null;
  
  /** Total API calls made this session */
  apiCallCount: number;
  
  /** Total errors this session */
  errorCount: number;
  
  /** Record a new API call */
  recordApiCall: (call: ApiCallRecord) => void;
  
  /** Clear all debug data */
  clearDebugData: () => void;
}

export const useDebugStore = create<DebugState>()((set) => ({
  lastApiCall: null,
  apiCallCount: 0,
  errorCount: 0,

  recordApiCall: (call: ApiCallRecord) => {
    set((state) => ({
      lastApiCall: call,
      apiCallCount: state.apiCallCount + 1,
      errorCount: call.success ? state.errorCount : state.errorCount + 1,
    }));
  },

  clearDebugData: () => {
    set({
      lastApiCall: null,
      apiCallCount: 0,
      errorCount: 0,
    });
  },
}));

/**
 * Helper function to record an API call from outside React components
 * (e.g., from the clinikoClient fetch wrapper)
 */
export function recordClinikoApiCall(call: ApiCallRecord): void {
  useDebugStore.getState().recordApiCall(call);
}
