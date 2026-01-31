/**
 * Subscription Context
 * Manages subscription state via Superwall with Supabase override support
 * 
 * Priority: Supabase subscription_override > Superwall status
 * 
 * Uses expo-superwall SDK hooks for Expo SDK 53+
 */

import React, { createContext, useContext, useCallback, useEffect, useState, ReactNode } from 'react';
import { usePlacement, useUser, useSuperwall } from 'expo-superwall';
import { PLACEMENTS } from '@/lib/superwall';
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/posthog';
import { fbEvents } from '@/lib/facebook';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface UserProfile {
  subscription_override: 'active' | 'inactive' | null;
  subscription_override_expires_at: string | null;
}

interface SubscriptionContextType {
  /** Whether the user has an active subscription (includes trial) */
  isSubscribed: boolean;
  /** Whether subscription status is still being determined */
  isLoading: boolean;
  /** Whether Superwall is available and configured */
  isSuperwallAvailable: boolean;
  /** Whether subscription is overridden via Supabase */
  isOverridden: boolean;
  /** Register a gated action - shows paywall if not subscribed (for gated paywalls) */
  registerGatedAction: (onSuccess: () => void | Promise<void>) => Promise<void>;
  /** Refresh subscription override from Supabase */
  refreshOverride: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const { user } = useAuth();
  
  // Supabase override state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingOverride, setIsLoadingOverride] = useState(true);
  
  // Get Superwall configuration state
  const isConfigured = useSuperwall((state) => state.isConfigured);
  const isLoadingSuperwall = useSuperwall((state) => state.isLoading);
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

  /**
   * Fetch user profile from Supabase to check for subscription override
   */
  const fetchUserProfile = useCallback(async () => {
    if (!user?.id) {
      setUserProfile(null);
      setIsLoadingOverride(false);
      return;
    }

    try {
      if (__DEV__) {
        console.log('[Subscription] Fetching user profile for override check...');
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('subscription_override, subscription_override_expires_at')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // PGRST116 = Row not found, which is fine - user just doesn't have a profile yet
        if (error.code !== 'PGRST116') {
          console.error('[Subscription] Error fetching user profile:', error);
        }
        setUserProfile(null);
      } else {
        setUserProfile(data as UserProfile);
        
        if (__DEV__ && data?.subscription_override) {
          console.log('[Subscription] Override found:', data.subscription_override);
        }
      }
    } catch (err) {
      console.error('[Subscription] Error fetching user profile:', err);
      setUserProfile(null);
    } finally {
      setIsLoadingOverride(false);
    }
  }, [user?.id]);

  // Fetch profile on mount and when user changes
  useEffect(() => {
    setIsLoadingOverride(true);
    fetchUserProfile();
  }, [fetchUserProfile]);

  /**
   * Check if subscription override is active and not expired
   */
  const getOverrideStatus = useCallback((): 'active' | 'inactive' | null => {
    if (!userProfile?.subscription_override) {
      return null;
    }

    // Check if override has expired
    if (userProfile.subscription_override_expires_at) {
      const expiresAt = new Date(userProfile.subscription_override_expires_at);
      if (expiresAt < new Date()) {
        if (__DEV__) {
          console.log('[Subscription] Override has expired');
        }
        return null;
      }
    }

    return userProfile.subscription_override;
  }, [userProfile]);

  // Determine subscription status with priority: Supabase override > Superwall
  const overrideStatus = getOverrideStatus();
  const superwallSubscribed = subscriptionStatus?.status === 'ACTIVE';
  const isSuperwallAvailable = isConfigured && !configError;
  
  // Final subscription status
  let isSubscribed: boolean;
  let isOverridden = false;
  
  if (overrideStatus === 'active') {
    // Supabase says user has access - grant it regardless of Superwall
    isSubscribed = true;
    isOverridden = true;
  } else if (overrideStatus === 'inactive') {
    // Supabase says user is blocked - deny access regardless of Superwall
    isSubscribed = false;
    isOverridden = true;
  } else {
    // No override - use Superwall status
    isSubscribed = superwallSubscribed;
  }

  // Combined loading state
  const isLoading = isLoadingOverride || isLoadingSuperwall;

  if (__DEV__ && !isLoading) {
    console.log('[Subscription] Status:', {
      overrideStatus,
      superwallStatus: subscriptionStatus?.status,
      isSubscribed,
      isOverridden,
      isSuperwallAvailable,
    });
  }

  /**
   * Register a gated action using Superwall (with override check)
   * 
   * Per Superwall docs:
   * - For GATED paywalls: feature callback only runs if user is subscribed or subscribes
   * - For NON-GATED paywalls: feature callback runs after paywall dismisses
   * - If no paywall configured: feature callback runs immediately
   * - If Superwall not available: feature callback runs immediately (graceful fallback)
   * 
   * With Supabase override:
   * - If override = 'active': execute action immediately (skip paywall)
   * - If override = 'inactive': never execute action
   * - If override = null: use Superwall logic
   */
  const registerGatedAction = useCallback(
    async (onSuccess: () => void | Promise<void>) => {
      if (__DEV__) {
        console.log('[Subscription] registerGatedAction called');
        console.log('[Subscription] overrideStatus:', overrideStatus);
      }
      
      // Check Supabase override first
      if (overrideStatus === 'active') {
        if (__DEV__) {
          console.log('[Subscription] Override active - executing action directly');
        }
        await onSuccess();
        return;
      }
      
      if (overrideStatus === 'inactive') {
        if (__DEV__) {
          console.log('[Subscription] Override inactive - blocking action');
        }
        // Could show a custom "subscription required" message here
        return;
      }
      
      // No override - use Superwall
      if (__DEV__) {
        console.log('[Subscription] No override - using Superwall for placement:', PLACEMENTS.RECORD_GATE);
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
          console.log('[Subscription] Calling registerPlacement()');
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
    [overrideStatus, isSuperwallAvailable, registerPlacement, subscriptionStatus]
  );

  const value: SubscriptionContextType = {
    isSubscribed,
    isLoading,
    isSuperwallAvailable,
    isOverridden,
    registerGatedAction,
    refreshOverride: fetchUserProfile,
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
