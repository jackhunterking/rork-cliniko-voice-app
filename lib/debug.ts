/**
 * Debug utilities for development and troubleshooting
 * 
 * Logging is enabled when:
 * - EXPO_PUBLIC_DEBUG=true environment variable is set
 * - OR app is running in __DEV__ mode
 * 
 * Never logs sensitive data like full API keys or auth headers.
 */

// Check if debug mode is enabled
const isDebugEnabled = (): boolean => {
  // Check for explicit env var first
  if (process.env.EXPO_PUBLIC_DEBUG === 'true') {
    return true;
  }
  // Fall back to __DEV__ mode
  return __DEV__;
};

// Cached debug state
let debugEnabled: boolean | null = null;

export function isDebug(): boolean {
  if (debugEnabled === null) {
    debugEnabled = isDebugEnabled();
  }
  return debugEnabled;
}

// Log levels with prefixes
const LOG_PREFIX = {
  debug: '[Debug]',
  info: '[Info]',
  warn: '[Warn]',
  error: '[Error]',
  cliniko: '[Cliniko]',
  auth: '[Auth]',
  router: '[Router]',
} as const;

type LogCategory = keyof typeof LOG_PREFIX;

/**
 * Generic debug log - only outputs in debug mode
 */
export function debugLog(category: LogCategory, ...args: unknown[]): void {
  if (!isDebug()) return;
  console.log(LOG_PREFIX[category], ...args);
}

/**
 * Debug warning - only outputs in debug mode
 */
export function debugWarn(category: LogCategory, ...args: unknown[]): void {
  if (!isDebug()) return;
  console.warn(LOG_PREFIX[category], ...args);
}

/**
 * Debug error - always outputs (errors are important)
 */
export function debugError(category: LogCategory, ...args: unknown[]): void {
  console.error(LOG_PREFIX[category], ...args);
}

/**
 * Mask sensitive strings (like API keys) for safe logging
 * Shows first 4 and last 4 characters only
 * Example: "abc123xyz789secret" → "abc1...cret"
 */
export function maskSecret(secret: string | null | undefined): string {
  if (!secret) return '[empty]';
  if (secret.length <= 8) return '****';
  return `${secret.slice(0, 4)}...${secret.slice(-4)}`;
}

/**
 * Truncate long strings for logging (e.g., response bodies)
 */
export function truncate(str: string, maxLength: number = 100): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}

/**
 * Format duration in milliseconds for display
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Get current timestamp for logging
 */
export function timestamp(): string {
  return new Date().toISOString();
}

// Convenience helpers for common log categories
export const logCliniko = (...args: unknown[]) => debugLog('cliniko', ...args);
export const logAuth = (...args: unknown[]) => debugLog('auth', ...args);
export const logRouter = (...args: unknown[]) => debugLog('router', ...args);
export const logDebug = (...args: unknown[]) => debugLog('debug', ...args);

export const warnCliniko = (...args: unknown[]) => debugWarn('cliniko', ...args);
export const warnAuth = (...args: unknown[]) => debugWarn('auth', ...args);

export const errorCliniko = (...args: unknown[]) => debugError('cliniko', ...args);
export const errorAuth = (...args: unknown[]) => debugError('auth', ...args);
