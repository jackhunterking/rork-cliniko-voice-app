/**
 * App Update Context
 * Handles force update checks and displays blocking modal when update is required
 * 
 * Checks both:
 * - User-specific: user_profiles.force_update_required
 * - Global: app_config.minimum_app_version and app_config.force_update_enabled
 * 
 * When update is required, shows a blocking modal that links to the App Store.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  Platform, 
  Linking,
  ActivityIndicator 
} from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/constants/colors';
import PrimaryButton from '@/components/PrimaryButton';

// App Store URLs - pulled from app.config.js extra settings
const getAppStoreUrl = () => {
  const appStoreId = Constants.expoConfig?.extra?.appStoreId ?? '0000000000';
  return `https://apps.apple.com/app/cliniko-voice/id${appStoreId}`;
};

const getPlayStoreUrl = () => {
  const playStoreId = Constants.expoConfig?.extra?.playStoreId ?? 'app.cliniko_voice';
  return `https://play.google.com/store/apps/details?id=${playStoreId}`;
};

interface AppConfig {
  minimum_app_version: {
    ios: string;
    android: string;
  };
  force_update_enabled: boolean;
}

interface UserUpdateProfile {
  force_update_required: boolean;
  minimum_app_version: string | null;
}

interface AppUpdateContextType {
  /** Whether a force update is required */
  isUpdateRequired: boolean;
  /** Whether we're checking for updates */
  isChecking: boolean;
  /** Current app version */
  currentVersion: string;
  /** Required minimum version (if update required) */
  requiredVersion: string | null;
  /** Refresh update status */
  checkForUpdate: () => Promise<void>;
}

const AppUpdateContext = createContext<AppUpdateContextType | undefined>(undefined);

interface AppUpdateProviderProps {
  children: ReactNode;
}

/**
 * Compare two semantic version strings
 * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  // Pad arrays to equal length
  const maxLength = Math.max(parts1.length, parts2.length);
  while (parts1.length < maxLength) parts1.push(0);
  while (parts2.length < maxLength) parts2.push(0);
  
  for (let i = 0; i < maxLength; i++) {
    if (parts1[i] < parts2[i]) return -1;
    if (parts1[i] > parts2[i]) return 1;
  }
  
  return 0;
}

/**
 * Check if current version is below required version
 */
function needsUpdate(current: string, required: string): boolean {
  return compareVersions(current, required) < 0;
}

export function AppUpdateProvider({ children }: AppUpdateProviderProps) {
  const { user } = useAuth();
  
  const [isUpdateRequired, setIsUpdateRequired] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [requiredVersion, setRequiredVersion] = useState<string | null>(null);
  
  // Get current app version from expo constants
  const currentVersion = Constants.expoConfig?.version ?? '1.0.0';

  /**
   * Check for force update requirements
   */
  const checkForUpdate = useCallback(async () => {
    setIsChecking(true);
    
    try {
      if (__DEV__) {
        console.log('[AppUpdate] Checking for updates...');
        console.log('[AppUpdate] Current version:', currentVersion);
      }

      // 1. Check global app_config
      const { data: configs, error: configError } = await supabase
        .from('app_config')
        .select('key, value')
        .in('key', ['minimum_app_version', 'force_update_enabled']);

      if (configError) {
        console.error('[AppUpdate] Error fetching app config:', configError);
      }

      let globalForceUpdate = false;
      let globalMinVersion: AppConfig['minimum_app_version'] | null = null;

      if (configs) {
        for (const config of configs) {
          if (config.key === 'force_update_enabled') {
            globalForceUpdate = config.value === true || config.value === 'true';
          }
          if (config.key === 'minimum_app_version') {
            globalMinVersion = config.value as AppConfig['minimum_app_version'];
          }
        }
      }

      if (__DEV__) {
        console.log('[AppUpdate] Global config:', { globalForceUpdate, globalMinVersion });
      }

      // 2. Check user-specific profile (if authenticated)
      let userForceUpdate = false;
      let userMinVersion: string | null = null;

      if (user?.id) {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('force_update_required, minimum_app_version')
          .eq('user_id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('[AppUpdate] Error fetching user profile:', profileError);
        }

        if (profile) {
          const userProfile = profile as UserUpdateProfile;
          userForceUpdate = userProfile.force_update_required;
          userMinVersion = userProfile.minimum_app_version;
          
          if (__DEV__) {
            console.log('[AppUpdate] User profile:', { userForceUpdate, userMinVersion });
          }
        }
      }

      // 3. Determine if update is required
      let updateRequired = false;
      let minVersionRequired: string | null = null;

      // Check user-specific force update first (highest priority)
      if (userForceUpdate) {
        updateRequired = true;
        minVersionRequired = userMinVersion;
        
        // If user has specific min version, check against it
        if (userMinVersion && !needsUpdate(currentVersion, userMinVersion)) {
          // User has met the required version
          updateRequired = false;
        }
      }

      // Check global force update
      if (!updateRequired && globalForceUpdate && globalMinVersion) {
        const platformMinVersion = Platform.OS === 'ios' 
          ? globalMinVersion.ios 
          : globalMinVersion.android;
        
        if (platformMinVersion && needsUpdate(currentVersion, platformMinVersion)) {
          updateRequired = true;
          minVersionRequired = platformMinVersion;
        }
      }

      // Check global minimum version (even without force flag)
      if (!updateRequired && globalMinVersion) {
        const platformMinVersion = Platform.OS === 'ios' 
          ? globalMinVersion.ios 
          : globalMinVersion.android;
        
        // Only force update if explicitly enabled or version is significantly behind
        // For now, we only force if the force_update_enabled flag is set
      }

      if (__DEV__) {
        console.log('[AppUpdate] Result:', { updateRequired, minVersionRequired });
      }

      setIsUpdateRequired(updateRequired);
      setRequiredVersion(minVersionRequired);

    } catch (error) {
      console.error('[AppUpdate] Error checking for updates:', error);
      // On error, don't block the user
      setIsUpdateRequired(false);
    } finally {
      setIsChecking(false);
    }
  }, [currentVersion, user?.id]);

  // Check for updates on mount and when user changes
  useEffect(() => {
    checkForUpdate();
  }, [checkForUpdate]);

  /**
   * Open the appropriate app store
   */
  const openAppStore = useCallback(async () => {
    const url = Platform.OS === 'ios' ? getAppStoreUrl() : getPlayStoreUrl();
    
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        console.error('[AppUpdate] Cannot open URL:', url);
      }
    } catch (error) {
      console.error('[AppUpdate] Error opening app store:', error);
    }
  }, []);

  const value: AppUpdateContextType = {
    isUpdateRequired,
    isChecking,
    currentVersion,
    requiredVersion,
    checkForUpdate,
  };

  return (
    <AppUpdateContext.Provider value={value}>
      {children}
      
      {/* Force Update Modal */}
      <Modal
        visible={isUpdateRequired && !isChecking}
        animationType="fade"
        transparent={false}
        statusBarTranslucent
      >
        <View style={styles.modalContainer}>
          <View style={styles.content}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🔄</Text>
            </View>
            
            {/* Title */}
            <Text style={styles.title}>Update Required</Text>
            
            {/* Description */}
            <Text style={styles.description}>
              A new version of Cliniko Voice is available. Please update to continue using the app.
            </Text>
            
            {/* Version info */}
            <View style={styles.versionInfo}>
              <Text style={styles.versionText}>
                Current: v{currentVersion}
              </Text>
              {requiredVersion && (
                <Text style={styles.versionText}>
                  Required: v{requiredVersion}+
                </Text>
              )}
            </View>
            
            {/* Update Button */}
            <PrimaryButton
              title="Update Now"
              onPress={openAppStore}
              style={styles.button}
            />
            
            {/* Note */}
            <Text style={styles.note}>
              You will be redirected to the {Platform.OS === 'ios' ? 'App Store' : 'Play Store'}
            </Text>
          </View>
        </View>
      </Modal>
    </AppUpdateContext.Provider>
  );
}

/**
 * Hook to access app update context
 */
export function useAppUpdate(): AppUpdateContextType {
  const context = useContext(AppUpdateContext);
  if (context === undefined) {
    throw new Error('useAppUpdate must be used within an AppUpdateProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  versionInfo: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 32,
  },
  versionText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 4,
  },
  button: {
    width: '100%',
    marginBottom: 16,
  },
  note: {
    fontSize: 13,
    color: colors.placeholder,
    textAlign: 'center',
  },
});
