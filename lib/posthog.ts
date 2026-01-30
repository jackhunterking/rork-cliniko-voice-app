/**
 * PostHog Analytics Configuration
 * Handles minimal analytics events for MVP
 */

import PostHog from 'posthog-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// PostHog API key from environment variable
const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY ?? '';

let posthogInstance: PostHog | null = null;

/**
 * Custom storage implementation using AsyncStorage
 * This avoids the deprecated expo-file-system API
 */
const customStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(`posthog_${key}`);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(`posthog_${key}`, value);
    } catch {
      // Silently fail
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`posthog_${key}`);
    } catch {
      // Silently fail
    }
  },
};

/**
 * Initialize PostHog SDK
 */
export async function initializePostHog(): Promise<PostHog | null> {
  if (!POSTHOG_API_KEY) {
    console.warn('[PostHog] API key not configured. Analytics will not work.');
    return null;
  }

  try {
    posthogInstance = new PostHog(POSTHOG_API_KEY, {
      host: 'https://app.posthog.com',
      customStorage,
    });
    
    if (__DEV__) {
      console.log('[PostHog] Initialized successfully');
    }
    
    return posthogInstance;
  } catch (error) {
    console.error('[PostHog] Failed to initialize:', error);
    return null;
  }
}

/**
 * Get the PostHog instance
 */
export function getPostHog(): PostHog | null {
  return posthogInstance;
}

/**
 * Analytics event names - only these 4 events for MVP
 */
export const ANALYTICS_EVENTS = {
  RECORD_ATTEMPTED: 'record_attempted',
  PAYWALL_SHOWN: 'paywall_shown',
  TRIAL_STARTED: 'trial_started',
  SUBSCRIPTION_ACTIVE: 'subscription_active',
} as const;

/**
 * Track an analytics event
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
): void {
  if (!posthogInstance) {
    if (__DEV__) {
      console.log('[PostHog] Event not tracked (not initialized):', eventName);
    }
    return;
  }

  try {
    posthogInstance.capture(eventName, properties);
    if (__DEV__) {
      console.log('[PostHog] Event tracked:', eventName, properties);
    }
  } catch (error) {
    console.error('[PostHog] Error tracking event:', error);
  }
}

/**
 * Identify a user for analytics
 */
export function identifyUser(userId: string, properties?: Record<string, unknown>): void {
  if (!posthogInstance) {
    return;
  }

  try {
    posthogInstance.identify(userId, properties);
    if (__DEV__) {
      console.log('[PostHog] User identified:', userId);
    }
  } catch (error) {
    console.error('[PostHog] Error identifying user:', error);
  }
}

/**
 * Reset user identity (on sign out)
 */
export function resetUser(): void {
  if (!posthogInstance) {
    return;
  }

  try {
    posthogInstance.reset();
    if (__DEV__) {
      console.log('[PostHog] User reset');
    }
  } catch (error) {
    console.error('[PostHog] Error resetting user:', error);
  }
}
