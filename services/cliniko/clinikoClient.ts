/**
 * Cliniko API HTTP Client
 * Handles Basic Auth and request/response processing
 */

import { getClinikoApiKey, getClinikoShard } from '@/lib/secure-storage';
import { ClinikoError, ClinikoApiError, getShardBaseUrl, ClinikoShard } from './clinikoTypes';

// Required headers for Cliniko API
const CLINIKO_HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'User-Agent': 'ClinikoVoiceApp/1.0.0',
};

/**
 * Creates Basic Auth header value from API key
 * Cliniko uses the API key as username with empty password
 */
function createBasicAuthHeader(apiKey: string): string {
  // Base64 encode "apiKey:" (note the colon - password is empty)
  const credentials = `${apiKey}:`;
  const base64Credentials = btoa(credentials);
  return `Basic ${base64Credentials}`;
}

/**
 * Configuration for the Cliniko client
 */
export interface ClinikoClientConfig {
  apiKey?: string;
  shard?: ClinikoShard;
}

/**
 * Creates the full URL for a Cliniko API endpoint
 */
export function buildClinikoUrl(endpoint: string, shard: ClinikoShard): string {
  const baseUrl = getShardBaseUrl(shard);
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${normalizedEndpoint}`;
}

/**
 * Fetches data from the Cliniko API with automatic auth handling
 */
export async function clinikoFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  config?: ClinikoClientConfig
): Promise<T> {
  // Get API key and shard from config or secure storage
  const apiKey = config?.apiKey ?? await getClinikoApiKey();
  const shard = config?.shard ?? await getClinikoShard();

  if (!apiKey) {
    throw new ClinikoError({
      status: 401,
      message: 'Cliniko API key not found. Please connect your Cliniko account.',
    });
  }

  if (!shard) {
    throw new ClinikoError({
      status: 400,
      message: 'Cliniko region not configured. Please select your Cliniko region.',
    });
  }

  const url = buildClinikoUrl(endpoint, shard);

  const headers: HeadersInit = {
    ...CLINIKO_HEADERS,
    'Authorization': createBasicAuthHeader(apiKey),
    ...(options.headers as Record<string, string> || {}),
  };

  console.log(`[Cliniko] ${options.method || 'GET'} ${endpoint}`);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle non-JSON responses (like 204 No Content)
  if (response.status === 204) {
    return {} as T;
  }

  // Parse response body
  let data: unknown;
  const contentType = response.headers.get('content-type');
  
  if (contentType?.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  // Handle error responses
  if (!response.ok) {
    console.error(`[Cliniko] Error ${response.status}:`, data);

    const errorMessage = typeof data === 'object' && data !== null && 'message' in data
      ? (data as { message: string }).message
      : `Request failed with status ${response.status}`;

    const errors = typeof data === 'object' && data !== null && 'errors' in data
      ? (data as { errors: Record<string, string[]> }).errors
      : undefined;

    throw new ClinikoError({
      status: response.status,
      message: errorMessage,
      errors,
    });
  }

  return data as T;
}

/**
 * GET request helper
 */
export function clinikoGet<T>(
  endpoint: string,
  config?: ClinikoClientConfig
): Promise<T> {
  return clinikoFetch<T>(endpoint, { method: 'GET' }, config);
}

/**
 * POST request helper
 */
export function clinikoPost<T>(
  endpoint: string,
  body: unknown,
  config?: ClinikoClientConfig
): Promise<T> {
  return clinikoFetch<T>(
    endpoint,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
    config
  );
}

/**
 * PATCH request helper
 */
export function clinikoPatch<T>(
  endpoint: string,
  body: unknown,
  config?: ClinikoClientConfig
): Promise<T> {
  return clinikoFetch<T>(
    endpoint,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
    config
  );
}

/**
 * DELETE request helper
 */
export function clinikoDelete<T>(
  endpoint: string,
  config?: ClinikoClientConfig
): Promise<T> {
  return clinikoFetch<T>(endpoint, { method: 'DELETE' }, config);
}

/**
 * Validates a Cliniko API key by attempting to fetch the current user
 * Returns the user data if successful, throws ClinikoError if not
 */
export async function validateClinikoCredentials(
  apiKey: string,
  shard: ClinikoShard
): Promise<{ valid: boolean; user?: { firstName: string; lastName: string; email: string } }> {
  try {
    const response = await clinikoGet<{
      id: string;
      first_name: string;
      last_name: string;
      email: string;
    }>('/user', { apiKey, shard });

    return {
      valid: true,
      user: {
        firstName: response.first_name,
        lastName: response.last_name,
        email: response.email,
      },
    };
  } catch (error) {
    if (error instanceof ClinikoError) {
      if (error.status === 401) {
        return { valid: false };
      }
    }
    throw error;
  }
}
