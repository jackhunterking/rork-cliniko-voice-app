import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Storage keys
const CLINIKO_API_KEY = 'cliniko_api_key';
const CLINIKO_SHARD = 'cliniko_shard';
const CLINIKO_COUPLED_USER_ID = 'cliniko_coupled_user_id';

// Type import for ClinikoShard
type ClinikoShard = 'au1' | 'au2' | 'au3' | 'uk1' | 'ca1' | 'us1';

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
