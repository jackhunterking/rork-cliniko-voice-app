/**
 * Facebook SDK Event Helpers
 * Handles Facebook attribution events for MVP
 */

import { AppEventsLogger, Settings } from 'react-native-fbsdk-next';

/**
 * Initialize Facebook SDK
 */
export async function initializeFacebook(): Promise<void> {
  try {
    // Initialize the SDK (auto-log app events is enabled by default)
    await Settings.initializeSDK();
    
    if (__DEV__) {
      console.log('[Facebook] SDK initialized successfully');
    }
  } catch (error) {
    console.error('[Facebook] Failed to initialize SDK:', error);
  }
}

/**
 * Facebook attribution events - only these 3 events for MVP
 */
export const fbEvents = {
  /**
   * Track when user completes registration
   * Called after successful sign-up/OTP verification
   */
  completeRegistration: (): void => {
    try {
      AppEventsLogger.logEvent('fb_mobile_complete_registration');
      if (__DEV__) {
        console.log('[Facebook] CompleteRegistration event logged');
      }
    } catch (error) {
      console.error('[Facebook] Error logging CompleteRegistration:', error);
    }
  },

  /**
   * Track when user starts a free trial
   * Called from Superwall trial started callback
   */
  startTrial: (): void => {
    try {
      AppEventsLogger.logEvent('StartTrial');
      if (__DEV__) {
        console.log('[Facebook] StartTrial event logged');
      }
    } catch (error) {
      console.error('[Facebook] Error logging StartTrial:', error);
    }
  },

  /**
   * Track when user subscribes
   * Called from Superwall subscription active callback
   */
  subscribe: (): void => {
    try {
      AppEventsLogger.logEvent('Subscribe');
      if (__DEV__) {
        console.log('[Facebook] Subscribe event logged');
      }
    } catch (error) {
      console.error('[Facebook] Error logging Subscribe:', error);
    }
  },
};
