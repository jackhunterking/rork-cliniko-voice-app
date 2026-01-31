/**
 * Subscription Context
 * Manages subscription state via Superwall and provides gating functionality
 * 
 * Using @superwall/react-native-superwall SDK v2 (wraps native SDK v4)
 * with entitlements-based subscription filtering support
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { initializeSuperwall, PLACEMENTS, isSuperwallReady, getSuperwallShared } from '@/lib/superwall';
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/posthog';
import { fbEvents } from '@/lib/facebook';

interface SubscriptionContextType {
  /** Whether the user has an active subscription (includes trial) */
  isSubscribed: boolean;
  /** Whether subscription status is still being determined */
  isLoading: boolean;
  /** Whether Superwall is available */
  isSuperwallAvailable: boolean;
  /** Register a gated action - shows paywall if not subscribed */
  registerGatedAction: (onSuccess: () => void | Promise<void>) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuperwallAvailable, setIsSuperwallAvailable] = useState(false);

  // Initialize Superwall on mount
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        const initialized = await initializeSuperwall();
        
        if (!initialized || !mounted) {
          if (__DEV__) {
            console.log('[Subscription] Superwall not available - skipping setup');
          }
          setIsLoading(false);
          setIsSuperwallAvailable(false);
          return;
        }

        setIsSuperwallAvailable(true);

        const Superwall = getSuperwallShared();
        
        // Check initial subscription status
        if (Superwall) {
          try {
            const status = await Superwall.getSubscriptionStatus();
            if (mounted) {
              const isActive = status === 'ACTIVE';
              setIsSubscribed(isActive);
              if (__DEV__) {
                console.log('[Subscription] Initial status:', status, '| isActive:', isActive);
              }
            }
          } catch (statusError) {
            if (__DEV__) {
              console.log('[Subscription] Error getting status:', statusError);
            }
          }
        }

        if (mounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('[Subscription] Initialization error:', error);
        if (mounted) {
          setIsLoading(false);
          setIsSuperwallAvailable(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Register a gated action
   * If subscribed or Superwall unavailable, executes the action immediately
   * If not subscribed, shows the paywall and executes action on subscription/feature access
   */
  const registerGatedAction = useCallback(
    async (onSuccess: () => void | Promise<void>) => {
      if (__DEV__) {
        console.log('[Subscription] Registering gated action for placement:', PLACEMENTS.RECORD_GATE);
      }

      const Superwall = getSuperwallShared();
      
      // If Superwall is not available, just execute the action
      // This allows the app to work even without paywalls configured
      if (!Superwall || !isSuperwallAvailable) {
        if (__DEV__) {
          console.log('[Subscription] Superwall not available - executing action directly');
        }
        await onSuccess();
        return;
      }

      try {
        // Track that paywall might be shown
        trackEvent(ANALYTICS_EVENTS.PAYWALL_SHOWN);

        // Register the placement with the feature callback
        // SDK v4 uses register() which shows paywall if not subscribed
        // and calls the feature block based on gating mode
        await Superwall.register({
          placement: PLACEMENTS.RECORD_GATE,
          feature: async () => {
            if (__DEV__) {
              console.log('[Subscription] Feature callback - user has access');
            }
            
            // Update subscription state
            try {
              const status = await Superwall.getSubscriptionStatus();
              const isActive = status === 'ACTIVE';
              setIsSubscribed(isActive);
              
              if (isActive) {
                // Track subscription analytics
                trackEvent(ANALYTICS_EVENTS.SUBSCRIPTION_ACTIVE);
                fbEvents.subscribe();
              }
            } catch (e) {
              // Ignore status check errors
            }
            
            await onSuccess();
          },
        });
      } catch (error) {
        console.error('[Subscription] Error in registerGatedAction:', error);
        // On error, still try to execute the action to not block users
        await onSuccess();
      }
    },
    [isSuperwallAvailable]
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
