/**
 * Facebook SDK Event Helpers
 * Handles Facebook attribution events for MVP
 * 
 * NOTE: This module uses lazy loading to prevent app crashes if the native
 * Facebook SDK module is not properly linked or available.
 */

// Lazy-loaded references to avoid import-time crashes
let AppEventsLogger: any = null;
let Settings: any = null;
let isInitialized = false;
let initializationAttempted = false;

/**
 * Safely get the Facebook SDK modules
 * Returns false if they're not available
 */
function getFacebookModules(): boolean {
  if (AppEventsLogger && Settings) {
    return true;
  }

  try {
    // Dynamic require to catch native module errors
    const fbsdk = require('react-native-fbsdk-next');
    AppEventsLogger = fbsdk.AppEventsLogger;
    Settings = fbsdk.Settings;
    return true;
  } catch (error) {
    if (__DEV__) {
      console.log('[Facebook] SDK not available - native module may not be linked:', error);
    }
    return false;
  }
}

/**
 * Initialize Facebook SDK
 * Safe to call even if native module is not available
 */
export async function initializeFacebook(): Promise<void> {
  // Only attempt initialization once
  if (initializationAttempted) {
    return;
  }
  initializationAttempted = true;

  try {
    // Try to get the modules
    if (!getFacebookModules()) {
      if (__DEV__) {
        console.log('[Facebook] Skipping initialization - SDK not available');
      }
      return;
    }

    // Initialize the SDK (auto-log app events is enabled by default)
    await Settings.initializeSDK();
    isInitialized = true;
    
    if (__DEV__) {
      console.log('[Facebook] SDK initialized successfully');
    }
  } catch (error) {
    // Don't crash the app if Facebook SDK fails
    if (__DEV__) {
      console.log('[Facebook] Failed to initialize SDK (non-fatal):', error);
    }
  }
}

/**
 * Facebook attribution events - only these 3 events for MVP
 * All methods are safe to call even if SDK is not available
 */
export const fbEvents = {
  /**
   * Track when user completes registration
   * Called after successful sign-up/OTP verification
   */
  completeRegistration: (): void => {
    try {
      if (!isInitialized || !AppEventsLogger) {
        if (__DEV__) {
          console.log('[Facebook] Skipping CompleteRegistration - SDK not initialized');
        }
        return;
      }
      
      AppEventsLogger.logEvent('fb_mobile_complete_registration');
      if (__DEV__) {
        console.log('[Facebook] CompleteRegistration event logged');
      }
    } catch (error) {
      // Silent fail - don't disrupt user flow
      if (__DEV__) {
        console.log('[Facebook] Error logging CompleteRegistration (non-fatal):', error);
      }
    }
  },

  /**
   * Track when user starts a free trial
   * Called from Superwall trial started callback
   */
  startTrial: (): void => {
    try {
      if (!isInitialized || !AppEventsLogger) {
        if (__DEV__) {
          console.log('[Facebook] Skipping StartTrial - SDK not initialized');
        }
        return;
      }
      
      AppEventsLogger.logEvent('StartTrial');
      if (__DEV__) {
        console.log('[Facebook] StartTrial event logged');
      }
    } catch (error) {
      // Silent fail - don't disrupt user flow
      if (__DEV__) {
        console.log('[Facebook] Error logging StartTrial (non-fatal):', error);
      }
    }
  },

  /**
   * Track when user subscribes
   * Called from Superwall subscription active callback
   */
  subscribe: (): void => {
    try {
      if (!isInitialized || !AppEventsLogger) {
        if (__DEV__) {
          console.log('[Facebook] Skipping Subscribe - SDK not initialized');
        }
        return;
      }
      
      AppEventsLogger.logEvent('Subscribe');
      if (__DEV__) {
        console.log('[Facebook] Subscribe event logged');
      }
    } catch (error) {
      // Silent fail - don't disrupt user flow
      if (__DEV__) {
        console.log('[Facebook] Error logging Subscribe (non-fatal):', error);
      }
    }
  },
};
