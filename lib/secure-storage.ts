import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const CLINIKO_API_KEY = 'cliniko_api_key';

/**
 * Secure storage helpers for the Cliniko API key.
 * - Native (iOS/Android): Uses expo-secure-store (hardware-backed encryption)
 * - Web: Falls back to AsyncStorage (less secure, but functional for dev)
 */

export async function saveClinikoApiKey(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(CLINIKO_API_KEY, key);
    return;
  }
  await SecureStore.setItemAsync(CLINIKO_API_KEY, key);
}

export async function getClinikoApiKey(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(CLINIKO_API_KEY);
  }
  return SecureStore.getItemAsync(CLINIKO_API_KEY);
}

export async function deleteClinikoApiKey(): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(CLINIKO_API_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(CLINIKO_API_KEY);
}

export async function hasClinikoApiKey(): Promise<boolean> {
  const key = await getClinikoApiKey();
  return key !== null && key.length > 0;
}
