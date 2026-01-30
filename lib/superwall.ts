/**
 * Superwall Configuration
 * Handles paywall presentation and subscription management
 * 
 * NOTE: Uses lazy loading to prevent crashes if native module isn't linked
 */

// Lazy-loaded Superwall reference
let SuperwallInstance: any = null;
let isSuperwallAvailable = false;
let initializationAttempted = false;

// Superwall API key from environment variable
const SUPERWALL_API_KEY = process.env.EXPO_PUBLIC_SUPERWALL_API_KEY ?? '';

/**
 * Safely get the Superwall module
 * Returns null if not available
 */
function getSuperwallModule(): any {
  if (SuperwallInstance !== null) {
    return SuperwallInstance;
  }

  try {
    // Dynamic require to catch native module errors
    const superwallModule = require('@superwall/react-native-superwall');
    SuperwallInstance = superwallModule.default || superwallModule.Superwall;
    isSuperwallAvailable = true;
    return SuperwallInstance;
  } catch (error) {
    if (__DEV__) {
      console.log('[Superwall] SDK not available - native module may not be linked:', error);
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

  const Superwall = getSuperwallModule();
  if (!Superwall) {
    console.warn('[Superwall] Native module not available. Paywalls will not work.');
    return false;
  }

  try {
    await Superwall.configure(SUPERWALL_API_KEY);
    if (__DEV__) {
      console.log('[Superwall] Initialized successfully');
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
 * Get the Superwall shared instance (lazy loaded)
 * Returns null if not available
 */
export function getSuperwallShared(): any {
  const Superwall = getSuperwallModule();
  return Superwall?.shared || null;
}

/**
 * Check if user has an active subscription
 * Returns false if Superwall is not available
 */
export async function isSubscriptionActive(): Promise<boolean> {
  const shared = getSuperwallShared();
  if (!shared) {
    return false;
  }

  try {
    const status = await shared.getSubscriptionStatus();
    return status === 'ACTIVE';
  } catch (error) {
    console.error('[Superwall] Error checking subscription status:', error);
    return false;
  }
}

// Export a lazy getter for the Superwall instance
// This allows code to check if it's available before using
export const Superwall = {
  get shared() {
    return getSuperwallShared();
  },
  configure: async (apiKey: string) => {
    const sw = getSuperwallModule();
    if (sw) {
      return sw.configure(apiKey);
    }
    throw new Error('Superwall native module not available');
  },
  isAvailable: () => isSuperwallAvailable,
};
