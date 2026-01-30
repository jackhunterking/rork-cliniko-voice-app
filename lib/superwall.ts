/**
 * Superwall Configuration
 * Handles paywall presentation and subscription management
 */

import Superwall from '@superwall/react-native-superwall';

// Superwall API key from environment variable
const SUPERWALL_API_KEY = process.env.EXPO_PUBLIC_SUPERWALL_API_KEY ?? '';

/**
 * Initialize Superwall SDK
 * Should be called early in app startup
 */
export async function initializeSuperwall(): Promise<void> {
  if (!SUPERWALL_API_KEY) {
    console.warn('[Superwall] API key not configured. Paywalls will not work.');
    return;
  }

  try {
    await Superwall.configure(SUPERWALL_API_KEY);
    if (__DEV__) {
      console.log('[Superwall] Initialized successfully');
    }
  } catch (error) {
    console.error('[Superwall] Failed to initialize:', error);
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
 * Check if user has an active subscription
 */
export async function isSubscriptionActive(): Promise<boolean> {
  try {
    const status = await Superwall.shared.getSubscriptionStatus();
    return status === 'ACTIVE';
  } catch (error) {
    console.error('[Superwall] Error checking subscription status:', error);
    return false;
  }
}

// Export the Superwall instance for direct access
export { Superwall };
