/**
 * Subscription Context
 * Manages subscription state via Superwall and provides gating functionality
 * 
 * Uses expo-superwall SDK hooks for Expo SDK 53+
 */

import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { usePlacement, useUser, useSuperwall } from 'expo-superwall';
import { PLACEMENTS } from '@/lib/superwall';
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/posthog';
import { fbEvents } from '@/lib/facebook';

interface SubscriptionContextType {
  /** Whether the user has an active subscription (includes trial) */
  isSubscribed: boolean;
  /** Whether subscription status is still being determined */
  isLoading: boolean;
  /** Whether Superwall is available and configured */
  isSuperwallAvailable: boolean;
  /** Register a gated action - shows paywall if not subscribed (for gated paywalls) */
  registerGatedAction: (onSuccess: () => void | Promise<void>) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  // Get Superwall configuration state
  const isConfigured = useSuperwall((state) => state.isConfigured);
  const isLoading = useSuperwall((state) => state.isLoading);
  const configError = useSuperwall((state) => state.configurationError);
  
  // Get user subscription status
  const { subscriptionStatus } = useUser();
  
  // Get placement hook for triggering paywalls
  const { registerPlacement } = usePlacement({
    onError: (err) => {
      if (__DEV__) {
        console.log('[Subscription] Placement error:', err);
      }
    },
    onPresent: (info) => {
      if (__DEV__) {
        console.log('[Subscription] Paywall presented:', info);
      }
      trackEvent(ANALYTICS_EVENTS.PAYWALL_SHOWN);
    },
    onDismiss: (info, result) => {
      if (__DEV__) {
        console.log('[Subscription] Paywall dismissed:', info, 'Result:', result);
      }
    },
  });

  // Determine if user is subscribed
  const isSubscribed = subscriptionStatus?.status === 'ACTIVE';
  const isSuperwallAvailable = isConfigured && !configError;

  if (__DEV__ && !isLoading) {
    console.log('[Subscription] Status:', {
      isConfigured,
      configError,
      subscriptionStatus: subscriptionStatus?.status,
      isSubscribed,
    });
  }

  /**
   * Register a gated action using Superwall
   * 
   * Per Superwall docs:
   * - For GATED paywalls: feature callback only runs if user is subscribed or subscribes
   * - For NON-GATED paywalls: feature callback runs after paywall dismisses
   * - If no paywall configured: feature callback runs immediately
   * - If Superwall not available: feature callback runs immediately (graceful fallback)
   */
  const registerGatedAction = useCallback(
    async (onSuccess: () => void | Promise<void>) => {
      if (__DEV__) {
        console.log('[Subscription] registerGatedAction called for placement:', PLACEMENTS.RECORD_GATE);
        console.log('[Subscription] isSuperwallAvailable:', isSuperwallAvailable);
      }
      
      // If Superwall is not available, execute the action directly
      // This is a graceful fallback - app works even without paywalls
      if (!isSuperwallAvailable) {
        if (__DEV__) {
          console.log('[Subscription] Superwall not available - executing action directly (graceful fallback)');
        }
        await onSuccess();
        return;
      }

      try {
        if (__DEV__) {
          console.log('[Subscription] Calling registerPlacement() with placement:', PLACEMENTS.RECORD_GATE);
        }

        // Use expo-superwall's registerPlacement
        // The feature callback behavior depends on the dashboard "Feature Gating" setting:
        // - Gated: callback only runs if user has access (subscribed or subscribes)
        // - Non-Gated: callback runs when paywall dismisses
        await registerPlacement({
          placement: PLACEMENTS.RECORD_GATE,
          feature: async () => {
            if (__DEV__) {
              console.log('[Subscription] Feature callback executed - user has access!');
            }
            
            // Track subscription if user just subscribed
            if (subscriptionStatus?.status === 'ACTIVE') {
              trackEvent(ANALYTICS_EVENTS.SUBSCRIPTION_ACTIVE);
              fbEvents.subscribe();
            }
            
            // Execute the gated action
            await onSuccess();
          },
        });
        
        if (__DEV__) {
          console.log('[Subscription] registerPlacement() completed');
        }
      } catch (error) {
        console.error('[Subscription] Error in registerGatedAction:', error);
        // On error, execute the action anyway to not block users
        // This is a safety fallback
        await onSuccess();
      }
    },
    [isSuperwallAvailable, registerPlacement, subscriptionStatus]
  );

  const value: SubscriptionContextType = {
    isSubscribed,
    isLoading,
    isSuperwallAvailable,
    registerGatedAction,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

/**
 * Hook to access subscription context
 */
export function useSubscription(): SubscriptionContextType {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
