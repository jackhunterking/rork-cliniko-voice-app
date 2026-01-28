import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Storage keys
const CLINIKO_API_KEY = 'cliniko_api_key';
const CLINIKO_SHARD = 'cliniko_shard';
const CLINIKO_COUPLED_USER_ID = 'cliniko_coupled_user_id';

// Type import for ClinikoShard
type ClinikoShard = 'au1' | 'au2' | 'au3' | 'uk1' | 'ca1' | 'us1';

// Supabase Edge Function base URL
const SUPABASE_FUNCTIONS_URL = process.env.EXPO_PUBLIC_SUPABASE_URL
  ? `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1`
  : '';

/**
 * Secure storage helpers for Cliniko credentials.
 * - Native (iOS/Android): Uses expo-secure-store (hardware-backed encryption)
 * - Web: Falls back to AsyncStorage (less secure, but functional for dev)
 */

// ============================================================================
// Generic Storage Helpers
// ============================================================================

async function setSecureItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getSecureItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function deleteSecureItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

// ============================================================================
// API Key Storage
// ============================================================================

export async function saveClinikoApiKey(key: string): Promise<void> {
  await setSecureItem(CLINIKO_API_KEY, key);
}

export async function getClinikoApiKey(): Promise<string | null> {
  return getSecureItem(CLINIKO_API_KEY);
}

export async function deleteClinikoApiKey(): Promise<void> {
  await deleteSecureItem(CLINIKO_API_KEY);
}

export async function hasClinikoApiKey(): Promise<boolean> {
  const key = await getClinikoApiKey();
  return key !== null && key.length > 0;
}

// ============================================================================
// Shard / Region Storage
// ============================================================================

export async function saveClinikoShard(shard: ClinikoShard): Promise<void> {
  await setSecureItem(CLINIKO_SHARD, shard);
}

export async function getClinikoShard(): Promise<ClinikoShard | null> {
  const shard = await getSecureItem(CLINIKO_SHARD);
  return shard as ClinikoShard | null;
}

export async function deleteClinikoShard(): Promise<void> {
  await deleteSecureItem(CLINIKO_SHARD);
}

export async function hasClinikoShard(): Promise<boolean> {
  const shard = await getClinikoShard();
  return shard !== null && shard.length > 0;
}

// ============================================================================
// Coupled User ID Storage (for multi-user device protection)
// ============================================================================

/**
 * Store the Supabase user ID that this Cliniko connection belongs to.
 * Used to detect when a different user logs in and force re-authentication.
 */
export async function saveCoupledUserId(userId: string): Promise<void> {
  await setSecureItem(CLINIKO_COUPLED_USER_ID, userId);
}

export async function getCoupledUserId(): Promise<string | null> {
  return getSecureItem(CLINIKO_COUPLED_USER_ID);
}

export async function deleteCoupledUserId(): Promise<void> {
  await deleteSecureItem(CLINIKO_COUPLED_USER_ID);
}

/**
 * Checks if the stored Cliniko credentials belong to the current user.
 * Returns true if the coupled user ID matches or if no credentials exist.
 */
export async function isClinikoCredentialsCoupledToUser(currentUserId: string): Promise<boolean> {
  const coupledUserId = await getCoupledUserId();
  
  // No coupled user ID means no credentials stored (or legacy data)
  if (!coupledUserId) {
    return true; // Allow setup
  }
  
  return coupledUserId === currentUserId;
}

// ============================================================================
// Bulk Operations
// ============================================================================

/**
 * Clear all Cliniko-related data from secure storage.
 * Call this on sign-out or when switching users.
 */
export async function clearAllClinikoData(): Promise<void> {
  await Promise.all([
    deleteClinikoApiKey(),
    deleteClinikoShard(),
    deleteCoupledUserId(),
  ]);
}

/**
 * Check if Cliniko is fully configured (has API key and shard)
 */
export async function isClinikoConfigured(): Promise<boolean> {
  const [hasKey, hasShard] = await Promise.all([
    hasClinikoApiKey(),
    hasClinikoShard(),
  ]);
  return hasKey && hasShard;
}

/**
 * Save all Cliniko credentials at once
 */
export async function saveClinikoCredentials(
  apiKey: string,
  shard: ClinikoShard,
  userId: string
): Promise<void> {
  await Promise.all([
    saveClinikoApiKey(apiKey),
    saveClinikoShard(shard),
    saveCoupledUserId(userId),
  ]);
}

// ============================================================================
// Backend Sync Functions (Supabase Edge Functions)
// ============================================================================

/**
 * Save Cliniko credentials to Supabase backend
 * This allows users to recover their credentials on a new device
 * 
 * @param apiKey - The Cliniko API key
 * @param shard - The Cliniko shard/region
 * @param userId - The Supabase user ID
 */
export async function saveCredentialsToBackend(
  apiKey: string,
  shard: ClinikoShard,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userId) {
      console.warn('[SecureStorage] No user ID - skipping backend sync');
      return { success: false, error: 'No user ID' };
    }

    if (!SUPABASE_FUNCTIONS_URL) {
      console.warn('[SecureStorage] Supabase Functions URL not configured - skipping backend sync');
      return { success: true }; // Not an error, just not configured
    }

    const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/cliniko-credentials-save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, api_key: apiKey, shard }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[SecureStorage] Backend save failed:', result.error);
      return { success: false, error: result.error || 'Failed to save to backend' };
    }

    console.log('[SecureStorage] Credentials saved to backend');
    return { success: true };
  } catch (error) {
    console.error('[SecureStorage] Error saving to backend:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}

/**
 * Fetch Cliniko credentials from Supabase backend
 * Used when user logs in on a new device to restore their connection
 * 
 * @param userId - The Supabase user ID to fetch credentials for
 */
export async function fetchCredentialsFromBackend(userId: string): Promise<{
  success: boolean;
  data?: { api_key: string; shard: ClinikoShard } | null;
  error?: string;
}> {
  try {
    if (!userId) {
      console.warn('[SecureStorage] No user ID provided - cannot fetch from backend');
      return { success: false, error: 'No user ID' };
    }

    // Check if Edge Functions URL is configured
    if (!SUPABASE_FUNCTIONS_URL) {
      console.warn('[SecureStorage] Supabase Functions URL not configured - skipping backend fetch');
      return { success: true, data: null }; // Return success with no data (expected when not configured)
    }

    // Pass user_id as query parameter (no JWT needed)
    const url = `${SUPABASE_FUNCTIONS_URL}/cliniko-credentials-get?user_id=${encodeURIComponent(userId)}`;
    console.log('[SecureStorage] Fetching credentials from backend for user:', userId.slice(0, 8) + '...');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Handle 404 as "no credentials found" (not an error)
    if (response.status === 404) {
      console.log('[SecureStorage] No credentials found in backend (404)');
      return { success: true, data: null };
    }

    // Try to parse JSON response
    let result: { error?: string; data?: { api_key: string; shard: ClinikoShard } | null };
    try {
      result = await response.json();
    } catch {
      console.error('[SecureStorage] Backend returned invalid JSON');
      return { success: false, error: 'Invalid response from backend' };
    }

    if (!response.ok) {
      const errorMsg = result?.error || `Backend error (${response.status})`;
      console.warn('[SecureStorage] Backend fetch failed:', errorMsg);
      return { success: false, error: errorMsg };
    }

    console.log('[SecureStorage] Credentials fetched from backend:', result.data ? 'found' : 'none');
    return { success: true, data: result.data };
  } catch (error) {
    // Network errors are expected when offline or Edge Functions not deployed
    console.warn('[SecureStorage] Could not reach backend:', error instanceof Error ? error.message : 'Network error');
    return { success: true, data: null }; // Treat as "no backend data" rather than hard failure
  }
}

/**
 * Delete Cliniko credentials from Supabase backend
 * Called when user disconnects Cliniko
 * 
 * @param userId - The Supabase user ID
 */
export async function deleteCredentialsFromBackend(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userId) {
      console.warn('[SecureStorage] No user ID - skipping backend delete');
      return { success: false, error: 'No user ID' };
    }

    if (!SUPABASE_FUNCTIONS_URL) {
      console.warn('[SecureStorage] Supabase Functions URL not configured - skipping backend delete');
      return { success: true }; // Not an error, just not configured
    }

    const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/cliniko-credentials-delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[SecureStorage] Backend delete failed:', result.error);
      return { success: false, error: result.error || 'Failed to delete from backend' };
    }

    console.log('[SecureStorage] Credentials deleted from backend');
    return { success: true };
  } catch (error) {
    console.error('[SecureStorage] Error deleting from backend:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}

/**
 * Restore credentials from backend to local secure storage
 * Returns true if credentials were found and restored
 */
export async function restoreCredentialsFromBackend(userId: string): Promise<boolean> {
  console.log('[SecureStorage] Attempting to restore credentials from backend...');
  const result = await fetchCredentialsFromBackend(userId);
  
  if (!result.success || !result.data) {
    console.log('[SecureStorage] No credentials to restore:', result.error || 'no data');
    return false;
  }

  // Save to local secure storage
  await saveClinikoCredentials(
    result.data.api_key,
    result.data.shard,
    userId
  );

  console.log('[SecureStorage] Credentials restored from backend to local storage');
  return true;
}

/**
 * Save credentials to both local storage and backend
 * This is the main function to use when connecting Cliniko
 */
export async function saveClinikoCredentialsWithBackup(
  apiKey: string,
  shard: ClinikoShard,
  userId: string
): Promise<void> {
  // Save locally first (immediate)
  await saveClinikoCredentials(apiKey, shard, userId);
  
  // Then sync to backend (fire and forget, don't block on this)
  saveCredentialsToBackend(apiKey, shard, userId).catch((err) => {
    console.warn('[SecureStorage] Background backend sync failed:', err);
  });
}
