/**
 * Subscription Context
 * Manages subscription state via Superwall and provides gating functionality
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import Superwall, {
  SuperwallDelegate,
  SubscriptionStatus,
  SuperwallEventInfo,
  PaywallPresentationHandler,
} from '@superwall/react-native-superwall';
import { initializeSuperwall, PLACEMENTS } from '@/lib/superwall';
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/posthog';
import { fbEvents } from '@/lib/facebook';

interface SubscriptionContextType {
  /** Whether the user has an active subscription (includes trial) */
  isSubscribed: boolean;
  /** Whether subscription status is still being determined */
  isLoading: boolean;
  /** Register a gated action - shows paywall if not subscribed */
  registerGatedAction: (onSuccess: () => void | Promise<void>) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
}

/**
 * Custom Superwall delegate to handle subscription events
 */
class AppSuperwallDelegate extends SuperwallDelegate {
  private onSubscriptionChange: (isActive: boolean) => void;
  private onTrialStarted: () => void;
  private onSubscriptionActivated: () => void;

  constructor(
    onSubscriptionChange: (isActive: boolean) => void,
    onTrialStarted: () => void,
    onSubscriptionActivated: () => void
  ) {
    super();
    this.onSubscriptionChange = onSubscriptionChange;
    this.onTrialStarted = onTrialStarted;
    this.onSubscriptionActivated = onSubscriptionActivated;
  }

  subscriptionStatusDidChange(
    from: SubscriptionStatus,
    to: SubscriptionStatus
  ): void {
    if (__DEV__) {
      console.log('[Subscription] Status changed:', from, '->', to);
    }

    const isActive = to === 'ACTIVE';
    this.onSubscriptionChange(isActive);

    // Track analytics for subscription becoming active
    if (to === 'ACTIVE' && from !== 'ACTIVE') {
      this.onSubscriptionActivated();
    }
  }

  handleSuperwallEvent(eventInfo: SuperwallEventInfo): void {
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
        const transaction = eventInfo.event as { type: string; product?: { subscriptionPeriod?: string } };
        if (transaction?.product?.subscriptionPeriod) {
          // This indicates a subscription was purchased
          this.onTrialStarted();
        }
        break;
      default:
        break;
    }
  }
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
        await initializeSuperwall();

        // Set up delegate for subscription events
        const delegate = new AppSuperwallDelegate(
          handleSubscriptionChange,
          handleTrialStarted,
          handleSubscriptionActivated
        );
        Superwall.shared.setDelegate(delegate);

        // Check initial subscription status
        const status = await Superwall.shared.getSubscriptionStatus();
        if (mounted) {
          setIsSubscribed(status === 'ACTIVE');
          setIsLoading(false);
          if (__DEV__) {
            console.log('[Subscription] Initial status:', status);
          }
        }
      } catch (error) {
        console.error('[Subscription] Initialization error:', error);
        if (mounted) {
          setIsLoading(false);
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
   * If subscribed, executes the action immediately
   * If not subscribed, shows the paywall and executes action on success
   */
  const registerGatedAction = useCallback(
    async (onSuccess: () => void | Promise<void>) => {
      if (__DEV__) {
        console.log('[Subscription] Registering gated action...');
      }

      try {
        // Create a presentation handler to track paywall events
        const handler = new PaywallPresentationHandler();
        
        handler.onPresent((paywallInfo) => {
          if (__DEV__) {
            console.log('[Subscription] Paywall presented:', paywallInfo.name);
          }
          // Note: paywall_shown is tracked via delegate
        });

        handler.onDismiss((paywallInfo, result) => {
          if (__DEV__) {
            console.log('[Subscription] Paywall dismissed:', result);
          }
        });

        handler.onError((error) => {
          console.error('[Subscription] Paywall error:', error);
        });

        handler.onSkip((skipReason) => {
          if (__DEV__) {
            console.log('[Subscription] Paywall skipped:', skipReason.description);
          }
        });

        // Register the placement with the feature callback
        await Superwall.shared.register({
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
      }
    },
    []
  );

  const value: SubscriptionContextType = {
    isSubscribed,
    isLoading,
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
