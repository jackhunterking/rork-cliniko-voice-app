/**
 * Superwall Configuration
 * Handles paywall presentation and subscription management
 * 
 * Using @superwall/react-native-superwall SDK v2.x (wraps native SDK v4)
 * for entitlements-based subscription filtering support
 */

import { Platform } from 'react-native';

// Lazy-loaded Superwall reference
let SuperwallModule: typeof import('@superwall/react-native-superwall') | null = null;
let isSuperwallAvailable = false;
let initializationAttempted = false;

// Superwall API key from environment variable
const SUPERWALL_API_KEY = process.env.EXPO_PUBLIC_SUPERWALL_API_KEY ?? '';

/**
 * Safely get the Superwall module
 * Returns null if not available
 */
function getSuperwallModule(): typeof import('@superwall/react-native-superwall') | null {
  if (SuperwallModule !== null) {
    return SuperwallModule;
  }

  try {
    // Dynamic require to catch module errors
    SuperwallModule = require('@superwall/react-native-superwall');
    isSuperwallAvailable = true;
    return SuperwallModule;
  } catch (error: any) {
    isSuperwallAvailable = false;
    if (__DEV__) {
      console.log('[Superwall] Module not available - rebuild app to enable paywalls');
    }
    return null;
  }
}

/**
 * Initialize Superwall SDK
 * Should be called early in app startup
 * Safe to call even if native module is not available
 */
export async function initializeSuperwall(): Promise<boolean> {
  // Only attempt once
  if (initializationAttempted) {
    return isSuperwallAvailable;
  }
  initializationAttempted = true;

  if (!SUPERWALL_API_KEY) {
    console.warn('[Superwall] API key not configured. Paywalls will not work.');
    return false;
  }

  const module = getSuperwallModule();
  if (!module) {
    console.warn('[Superwall] Native module not available. Paywalls will not work.');
    return false;
  }

  try {
    // Configure Superwall with the API key (v2 API uses object parameter)
    await module.default.configure({ apiKey: SUPERWALL_API_KEY });
    
    if (__DEV__) {
      console.log('[Superwall] Initialized successfully with SDK v2 (native v4)');
    }
    return true;
  } catch (error) {
    console.error('[Superwall] Failed to initialize:', error);
    isSuperwallAvailable = false;
    return false;
  }
}

/**
 * Placement names used in the app
 * Only one placement for MVP: record_gate
 */
export const PLACEMENTS = {
  RECORD_GATE: 'record_gate',
} as const;

/**
 * Entitlement names configured in Superwall dashboard
 * Only one entitlement for MVP: pro
 */
export const ENTITLEMENTS = {
  PRO: 'pro',
} as const;

/**
 * Check if Superwall is available and initialized
 */
export function isSuperwallReady(): boolean {
  return isSuperwallAvailable;
}

/**
 * Get the Superwall shared instance
 * Returns null if not available
 */
export function getSuperwallShared() {
  const module = getSuperwallModule();
  return module?.default?.shared || null;
}

/**
 * Check if user has an active subscription via entitlements
 * Returns false if Superwall is not available
 */
export async function isSubscriptionActive(): Promise<boolean> {
  const shared = getSuperwallShared();
  if (!shared) {
    return false;
  }

  try {
    const status = await shared.getSubscriptionStatus();
    // SDK v4 returns an object with status property - ACTIVE means user has entitlements
    return status?.status === 'ACTIVE';
  } catch (error) {
    console.error('[Superwall] Error checking subscription status:', error);
    return false;
  }
}

// Export a lazy getter for the Superwall instance
export const Superwall = {
  get shared() {
    return getSuperwallShared();
  },
  configure: async (apiKey: string) => {
    const module = getSuperwallModule();
    if (module) {
      return module.default.configure({ apiKey });
    }
    throw new Error('Superwall native module not available');
  },
  isAvailable: () => isSuperwallAvailable,
};
