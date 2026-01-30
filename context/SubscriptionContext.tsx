/**
 * Subscription Context
 * Manages subscription state via Superwall and provides gating functionality
 * 
 * NOTE: This context handles cases where Superwall native module isn't available
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { initializeSuperwall, PLACEMENTS, isSuperwallReady, getSuperwallShared } from '@/lib/superwall';
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/posthog';
import { fbEvents } from '@/lib/facebook';

// Lazy-loaded Superwall types - we'll check if they're available at runtime
let SuperwallDelegate: any = null;
let PaywallPresentationHandler: any = null;

function getSuperwallTypes(): boolean {
  if (SuperwallDelegate && PaywallPresentationHandler) {
    return true;
  }
  
  try {
    const superwallModule = require('@superwall/react-native-superwall');
    SuperwallDelegate = superwallModule.SuperwallDelegate;
    PaywallPresentationHandler = superwallModule.PaywallPresentationHandler;
    return true;
  } catch (error) {
    if (__DEV__) {
      console.log('[Subscription] Superwall types not available');
    }
    return false;
  }
}

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

/**
 * Create a custom Superwall delegate if available
 */
function createAppSuperwallDelegate(
  onSubscriptionChange: (isActive: boolean) => void,
  onTrialStarted: () => void,
  onSubscriptionActivated: () => void
): any {
  if (!getSuperwallTypes() || !SuperwallDelegate) {
    return null;
  }

  try {
    // Dynamically create the delegate class
    class AppSuperwallDelegate extends SuperwallDelegate {
      private onSubscriptionChange: (isActive: boolean) => void;
      private onTrialStarted: () => void;
      private onSubscriptionActivated: () => void;
      private previousStatus: string | null = null;

      constructor() {
        super();
        this.onSubscriptionChange = onSubscriptionChange;
        this.onTrialStarted = onTrialStarted;
        this.onSubscriptionActivated = onSubscriptionActivated;
      }

      subscriptionStatusDidChange(newValue: string): void {
        if (__DEV__) {
          console.log('[Subscription] Status changed:', this.previousStatus, '->', newValue);
        }

        const isActive = newValue === 'ACTIVE';
        this.onSubscriptionChange(isActive);

        // Track analytics for subscription becoming active
        if (newValue === 'ACTIVE' && this.previousStatus !== 'ACTIVE') {
          this.onSubscriptionActivated();
        }
        
        this.previousStatus = newValue;
      }

      handleSuperwallEvent(eventInfo: any): void {
        const eventType = eventInfo.event?.type;
        
        if (__DEV__) {
          console.log('[Subscription] Superwall event:', eventType);
        }

        // Handle specific events for analytics
        switch (eventType) {
          case 'paywallOpen':
            trackEvent(ANALYTICS_EVENTS.PAYWALL_SHOWN);
            break;
          case 'transactionComplete':
            // Check if this was a trial start
            const transaction = eventInfo.event;
            if (transaction?.product?.subscriptionPeriod) {
              // This indicates a subscription was purchased
              this.onTrialStarted();
            }
            break;
          default:
            break;
        }
      }

      handleCustomPaywallAction(name: string): void {
        if (__DEV__) {
          console.log('[Subscription] Custom paywall action:', name);
        }
      }

      willDismissPaywall(paywallInfo: any): void {
        if (__DEV__) {
          console.log('[Subscription] Will dismiss paywall:', paywallInfo?.name);
        }
      }

      willPresentPaywall(paywallInfo: any): void {
        if (__DEV__) {
          console.log('[Subscription] Will present paywall:', paywallInfo?.name);
        }
      }

      didDismissPaywall(paywallInfo: any): void {
        if (__DEV__) {
          console.log('[Subscription] Did dismiss paywall:', paywallInfo?.name);
        }
      }

      didPresentPaywall(paywallInfo: any): void {
        if (__DEV__) {
          console.log('[Subscription] Did present paywall:', paywallInfo?.name);
        }
      }

      paywallWillOpenURL(url: any): void {
        if (__DEV__) {
          console.log('[Subscription] Paywall will open URL:', url?.toString?.());
        }
      }

      paywallWillOpenDeepLink(url: any): void {
        if (__DEV__) {
          console.log('[Subscription] Paywall will open deep link:', url?.toString?.());
        }
      }

      handleLog(
        level: string,
        scope: string,
        message?: string,
        info?: Map<string, any>,
        error?: string
      ): void {
        // Only log in development for debugging
        if (__DEV__) {
          // Suppress verbose logging - only show warnings and errors
          if (level === 'warn' || level === 'error') {
            console.log(`[Superwall ${level}] ${scope}: ${message || ''}`);
            if (error) {
              console.log('[Superwall] Error:', error);
            }
          }
        }
      }
    }

    return new AppSuperwallDelegate();
  } catch (error) {
    if (__DEV__) {
      console.log('[Subscription] Failed to create delegate:', error);
    }
    return null;
  }
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuperwallAvailable, setIsSuperwallAvailable] = useState(false);

  // Handle subscription state changes
  const handleSubscriptionChange = useCallback((isActive: boolean) => {
    setIsSubscribed(isActive);
  }, []);

  // Handle trial started
  const handleTrialStarted = useCallback(() => {
    trackEvent(ANALYTICS_EVENTS.TRIAL_STARTED);
    fbEvents.startTrial();
  }, []);

  // Handle subscription activated
  const handleSubscriptionActivated = useCallback(() => {
    trackEvent(ANALYTICS_EVENTS.SUBSCRIPTION_ACTIVE);
    fbEvents.subscribe();
  }, []);

  // Initialize Superwall on mount
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        const initialized = await initializeSuperwall();
        
        if (!initialized || !mounted) {
          if (__DEV__) {
            console.log('[Subscription] Superwall not available - skipping delegate setup');
          }
          setIsLoading(false);
          setIsSuperwallAvailable(false);
          return;
        }

        setIsSuperwallAvailable(true);

        // Set up delegate for subscription events
        const delegate = createAppSuperwallDelegate(
          handleSubscriptionChange,
          handleTrialStarted,
          handleSubscriptionActivated
        );

        const shared = getSuperwallShared();
        if (delegate && shared) {
          shared.setDelegate(delegate);
        }

        // Check initial subscription status
        if (shared) {
          try {
            const status = await shared.getSubscriptionStatus();
            if (mounted) {
              setIsSubscribed(status === 'ACTIVE');
              if (__DEV__) {
                console.log('[Subscription] Initial status:', status);
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
  }, [handleSubscriptionChange, handleTrialStarted, handleSubscriptionActivated]);

  /**
   * Register a gated action
   * If subscribed or Superwall unavailable, executes the action immediately
   * If not subscribed, shows the paywall and executes action on success
   */
  const registerGatedAction = useCallback(
    async (onSuccess: () => void | Promise<void>) => {
      if (__DEV__) {
        console.log('[Subscription] Registering gated action...');
      }

      // If Superwall is not available, just execute the action
      // This allows the app to work even without paywalls configured
      const shared = getSuperwallShared();
      if (!shared || !isSuperwallAvailable || !getSuperwallTypes()) {
        if (__DEV__) {
          console.log('[Subscription] Superwall not available - executing action directly');
        }
        await onSuccess();
        return;
      }

      try {
        // Create a presentation handler to track paywall events
        const handler = PaywallPresentationHandler ? new PaywallPresentationHandler() : null;
        
        if (handler) {
          handler.onPresent?.((paywallInfo: any) => {
            if (__DEV__) {
              console.log('[Subscription] Paywall presented:', paywallInfo?.name);
            }
          });

          handler.onDismiss?.((paywallInfo: any, result: any) => {
            if (__DEV__) {
              console.log('[Subscription] Paywall dismissed:', result);
            }
          });

          handler.onError?.((error: any) => {
            console.error('[Subscription] Paywall error:', error);
          });

          handler.onSkip?.((skipReason: any) => {
            if (__DEV__) {
              console.log('[Subscription] Paywall skipped:', skipReason?.description);
            }
          });
        }

        // Register the placement with the feature callback
        await shared.register({
          placement: PLACEMENTS.RECORD_GATE,
          handler,
          feature: async () => {
            if (__DEV__) {
              console.log('[Subscription] Feature callback - user has access');
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
