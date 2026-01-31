/**
 * Superwall Configuration Constants
 * 
 * The expo-superwall SDK uses a Provider-based approach.
 * Configuration is handled by SuperwallProvider in _layout.tsx.
 * 
 * This file exports constants and types used across the app.
 */

// Superwall API key from environment variable
export const SUPERWALL_API_KEY = process.env.EXPO_PUBLIC_SUPERWALL_API_KEY ?? '';

/**
 * Placement names used in the app
 * Must match placements configured in Superwall dashboard
 */
export const PLACEMENTS = {
  RECORD_GATE: 'record_gate',
} as const;

/**
 * Entitlement names configured in Superwall dashboard
 */
export const ENTITLEMENTS = {
  PRO: 'pro',
} as const;

export type PlacementName = typeof PLACEMENTS[keyof typeof PLACEMENTS];
