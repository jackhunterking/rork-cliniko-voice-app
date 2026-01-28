/**
 * Cliniko API HTTP Client
 * Handles Basic Auth and request/response processing
 */

import { getClinikoApiKey, getClinikoShard } from '@/lib/secure-storage';
import { logCliniko, errorCliniko, truncate, formatDuration, maskSecret } from '@/lib/debug';
import { recordClinikoApiCall } from '@/stores/debug-store';
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
 * Creates a safe response preview for logging (no sensitive data)
 */
function createResponsePreview(data: unknown): string {
  if (data === null || data === undefined) return '[empty]';
  
  try {
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    return truncate(str, 150);
  } catch {
    return '[unable to serialize]';
  }
}

/**
 * Fetches data from the Cliniko API with automatic auth handling
 */
export async function clinikoFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  config?: ClinikoClientConfig
): Promise<T> {
  const method = options.method || 'GET';
  const startTime = Date.now();
  
  // Get API key and shard from config or secure storage
  const apiKey = config?.apiKey ?? await getClinikoApiKey();
  const shard = config?.shard ?? await getClinikoShard();

  if (!apiKey) {
    logCliniko(`${method} ${endpoint} - ERROR: No API key found`);
    recordClinikoApiCall({
      endpoint,
      method,
      status: 401,
      duration: Date.now() - startTime,
      timestamp: new Date(),
      errorMessage: 'Cliniko API key not found',
      success: false,
    });
    throw new ClinikoError({
      status: 401,
      message: 'Cliniko API key not found. Please connect your Cliniko account.',
    });
  }

  if (!shard) {
    logCliniko(`${method} ${endpoint} - ERROR: No shard configured`);
    recordClinikoApiCall({
      endpoint,
      method,
      status: 400,
      duration: Date.now() - startTime,
      timestamp: new Date(),
      errorMessage: 'Cliniko region not configured',
      success: false,
    });
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

  // Log request (never log auth header or full API key)
  logCliniko(`${method} ${endpoint} (${shard}.cliniko.com) [key: ${maskSecret(apiKey)}]`);

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (networkError) {
    const duration = Date.now() - startTime;
    const errorMsg = networkError instanceof Error ? networkError.message : 'Network error';
    errorCliniko(`${method} ${endpoint} - NETWORK ERROR after ${formatDuration(duration)}: ${errorMsg}`);
    recordClinikoApiCall({
      endpoint,
      method,
      status: 0,
      duration,
      timestamp: new Date(),
      errorMessage: errorMsg,
      success: false,
    });
    throw networkError;
  }

  const duration = Date.now() - startTime;

  // Handle non-JSON responses (like 204 No Content)
  if (response.status === 204) {
    logCliniko(`${method} ${endpoint} - 204 No Content (${formatDuration(duration)})`);
    recordClinikoApiCall({
      endpoint,
      method,
      status: 204,
      duration,
      timestamp: new Date(),
      responsePreview: '[no content]',
      success: true,
    });
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
    const errorMessage = typeof data === 'object' && data !== null && 'message' in data
      ? (data as { message: string }).message
      : `Request failed with status ${response.status}`;

    const errors = typeof data === 'object' && data !== null && 'errors' in data
      ? (data as { errors: Record<string, string | string[]> }).errors
      : undefined;

    errorCliniko(
      `${method} ${endpoint} - ${response.status} ${response.statusText} (${formatDuration(duration)})`,
      errorMessage,
      errors ? `Validation errors: ${JSON.stringify(errors)}` : undefined
    );
    
    recordClinikoApiCall({
      endpoint,
      method,
      status: response.status,
      duration,
      timestamp: new Date(),
      errorMessage,
      responsePreview: createResponsePreview(data),
      success: false,
    });

    throw new ClinikoError({
      status: response.status,
      message: errorMessage,
      errors,
    });
  }

  // Success - log summary
  const preview = createResponsePreview(data);
  const itemCount = getItemCount(data);
  const countInfo = itemCount !== null ? `, ${itemCount} items` : '';
  
  logCliniko(`${method} ${endpoint} - ${response.status} OK (${formatDuration(duration)}${countInfo})`);
  
  recordClinikoApiCall({
    endpoint,
    method,
    status: response.status,
    duration,
    timestamp: new Date(),
    responsePreview: preview,
    success: true,
  });

  return data as T;
}

/**
 * Try to extract item count from common Cliniko response patterns
 */
function getItemCount(data: unknown): number | null {
  if (!data || typeof data !== 'object') return null;
  
  const obj = data as Record<string, unknown>;
  
  // Check for total_entries field (pagination)
  if (typeof obj.total_entries === 'number') {
    return obj.total_entries;
  }
  
  // Check for common array fields
  const arrayFields = ['patients', 'treatment_note_templates', 'treatment_notes', 'individual_appointments'];
  for (const field of arrayFields) {
    if (Array.isArray(obj[field])) {
      return (obj[field] as unknown[]).length;
    }
  }
  
  return null;
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
  logCliniko(`Validating credentials for shard ${shard} [key: ${maskSecret(apiKey)}]`);
  
  try {
    const response = await clinikoGet<{
      id: string;
      first_name: string;
      last_name: string;
      email: string;
    }>('/user', { apiKey, shard });

    logCliniko(`Credentials valid - user: ${response.first_name} ${response.last_name}`);
    
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
        logCliniko('Credentials invalid - 401 Unauthorized');
        return { valid: false };
      }
    }
    errorCliniko('Credential validation failed with unexpected error:', error);
    throw error;
  }
}
