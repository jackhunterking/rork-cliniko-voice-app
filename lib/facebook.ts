/**
 * Facebook SDK Event Helpers
 * Handles Facebook attribution events for MVP
 * 
 * NOTE: This module uses lazy loading to prevent app crashes if the native
 * Facebook SDK module is not properly linked or available.
 * 
 * ATT (App Tracking Transparency) is properly implemented per Apple/Facebook docs:
 * - Request ATT permission before collecting IDFA
 * - Set Facebook's advertiser tracking based on user's ATT choice
 */

import { Platform } from 'react-native';

// Lazy-loaded references to avoid import-time crashes
let AppEventsLogger: any = null;
let Settings: any = null;
let TrackingTransparency: any = null;
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
 * Safely get the Tracking Transparency module
 */
function getTrackingTransparencyModule(): boolean {
  if (TrackingTransparency) {
    return true;
  }

  try {
    TrackingTransparency = require('expo-tracking-transparency');
    return true;
  } catch (error) {
    if (__DEV__) {
      console.log('[Facebook] Tracking Transparency module not available:', error);
    }
    return false;
  }
}

/**
 * Request App Tracking Transparency permission (iOS only)
 * Returns true if user granted permission, false otherwise
 */
async function requestTrackingPermission(): Promise<boolean> {
  // ATT is only required on iOS
  if (Platform.OS !== 'ios') {
    return true;
  }

  if (!getTrackingTransparencyModule()) {
    if (__DEV__) {
      console.log('[Facebook] Cannot request ATT - module not available');
    }
    return false;
  }

  try {
    // Check current status first
    const { status: currentStatus } = await TrackingTransparency.getTrackingPermissionsAsync();
    
    if (__DEV__) {
      console.log('[Facebook] Current ATT status:', currentStatus);
    }

    // If already determined, return the result
    if (currentStatus === 'granted') {
      return true;
    }
    
    if (currentStatus === 'denied') {
      return false;
    }

    // Status is 'undetermined', request permission
    const { status } = await TrackingTransparency.requestTrackingPermissionsAsync();
    
    if (__DEV__) {
      console.log('[Facebook] ATT permission result:', status);
    }

    return status === 'granted';
  } catch (error) {
    if (__DEV__) {
      console.log('[Facebook] Error requesting ATT permission (non-fatal):', error);
    }
    return false;
  }
}

/**
 * Initialize Facebook SDK with proper ATT handling
 * Safe to call even if native module is not available
 * 
 * Flow per Apple/Facebook documentation:
 * 1. Initialize Facebook SDK
 * 2. Request ATT permission from user
 * 3. Set Facebook's advertiser tracking based on user's choice
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

    // Initialize the SDK first
    await Settings.initializeSDK();
    
    if (__DEV__) {
      console.log('[Facebook] SDK initialized, requesting ATT permission...');
    }

    // Request ATT permission (iOS only)
    const trackingAllowed = await requestTrackingPermission();

    // Set Facebook's advertiser tracking based on ATT result
    // This is required per Facebook documentation for iOS 14.5+
    if (Platform.OS === 'ios' && Settings.setAdvertiserTrackingEnabled) {
      Settings.setAdvertiserTrackingEnabled(trackingAllowed);
      
      if (__DEV__) {
        console.log('[Facebook] Advertiser tracking set to:', trackingAllowed);
      }
    }

    isInitialized = true;
    
    if (__DEV__) {
      console.log('[Facebook] SDK fully initialized with ATT status:', trackingAllowed ? 'granted' : 'denied');
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
