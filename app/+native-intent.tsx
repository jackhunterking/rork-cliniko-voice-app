/**
 * Handle system deep link paths for Expo Router.
 * 
 * IMPORTANT: Supabase magic links contain auth tokens in the URL FRAGMENT (#access_token=...)
 * The fragment is NOT included in the `path` parameter here - it only receives the path portion.
 * 
 * The actual URL with tokens is processed by AuthContext via:
 * - Linking.getInitialURL() for app launch
 * - Linking.addEventListener('url') for when app is already open
 * 
 * This function just routes to the index page, and AuthGuard in _layout.tsx 
 * will redirect based on auth state once tokens are processed.
 */
export function redirectSystemPath({
  path,
  initial,
}: { path: string; initial: boolean }) {
  // Log for debugging on real device
  console.log('[NativeIntent] Received path:', path, 'initial:', initial);
  
  // Check if this is a magic link URL (contains hash fragment with tokens)
  // The path will be the full URL for magic links
  const hasAuthTokens = path.includes('#access_token=') || path.includes('access_token=');
  
  if (hasAuthTokens) {
    console.log('[NativeIntent] Magic link detected - will be processed by AuthContext');
  }
  
  // Always route to index - let AuthContext and AuthGuard handle navigation
  // based on the actual auth state after processing any tokens from the URL
  return '/';
}
