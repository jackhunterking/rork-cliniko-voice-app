import { useState, useCallback, useEffect } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { makeRedirectUri } from 'expo-auth-session';
import * as Linking from 'expo-linking';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  hasClinikoApiKey as checkClinikoKey,
  clearAllClinikoData,
  getCoupledUserId,
  isClinikoConfigured,
  restoreCredentialsFromBackend,
} from '@/lib/secure-storage';
import { logAuth, errorAuth, maskSecret } from '@/lib/debug';
import { clinikoKeys } from '@/hooks/useCliniko';
import { fbEvents } from '@/lib/facebook';

export interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  hasClinikoKey: boolean;
}

export interface AuthActions {
  sendMagicLink: (email: string) => Promise<{ error: AuthError | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  refreshClinikoKeyStatus: () => Promise<void>;
}

// Create the redirect URI for deep linking
const redirectTo = makeRedirectUri();

// Log the redirect URI for debugging
console.log('[Auth] Redirect URI configured:', redirectTo);

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasClinikoKey, setHasClinikoKey] = useState(false);
  
  // Get query client for cache management
  const queryClient = useQueryClient();

  // Check Cliniko key status and validate it's for the current user
  const refreshClinikoKeyStatus = useCallback(async () => {
    logAuth('Refreshing Cliniko key status...');
    const isConfigured = await isClinikoConfigured();
    logAuth(`Cliniko configured: ${isConfigured}`);
    setHasClinikoKey(isConfigured);
  }, []);

  // Validate that Cliniko credentials belong to the current user
  const validateClinikoCredentialOwnership = useCallback(async (currentUserId: string) => {
    logAuth(`Validating Cliniko credential ownership for user: ${maskSecret(currentUserId)}`);
    const coupledUserId = await getCoupledUserId();
    logAuth(`Coupled user ID: ${coupledUserId ? maskSecret(coupledUserId) : '[none]'}`);
    
    // If there's a coupled user ID and it doesn't match, clear credentials
    if (coupledUserId && coupledUserId !== currentUserId) {
      logAuth('Cliniko credentials belong to different user - clearing all Cliniko data');
      await clearAllClinikoData();
      // Clear all Cliniko-related cache
      queryClient.removeQueries({ queryKey: clinikoKeys.all });
      setHasClinikoKey(false);
      return false;
    }
    
    logAuth('Credential ownership validated - user matches or no existing credentials');
    return true;
  }, [queryClient]);

  // Helper function to handle session setup (reused in multiple places)
  // MUST be defined before createSessionFromUrl since it's used there
  const handleSessionEstablished = useCallback(async (sessionUser: User, isNewSession = false) => {
    logAuth('Handling session for user:', sessionUser.email);
    
    // Validate Cliniko credentials
    const isValid = await validateClinikoCredentialOwnership(sessionUser.id);
    
    if (isValid) {
      let isConfigured = await isClinikoConfigured();
      
      // If no local credentials, try to restore from backend
      if (!isConfigured) {
        logAuth('No local credentials found - checking backend...');
        const restored = await restoreCredentialsFromBackend(sessionUser.id);
        if (restored) {
          logAuth('Credentials restored from backend');
          isConfigured = true;
        } else {
          logAuth('No credentials in backend either');
        }
      }
      
      logAuth(`Cliniko configured: ${isConfigured}`);
      setHasClinikoKey(isConfigured);
    }
    
    // Fire Facebook CompleteRegistration for new sessions from deep links
    // This covers users signing in via magic link email
    if (isNewSession) {
      fbEvents.completeRegistration();
    }
  }, [validateClinikoCredentialOwnership]);

  // Handle deep link URL to create session (used when app is ALREADY running)
  const createSessionFromUrl = useCallback(async (url: string) => {
    try {
      logAuth('Processing deep link URL (app running):', url.substring(0, 100) + '...');
      
      const { params, errorCode } = QueryParams.getQueryParams(url);

      if (errorCode) {
        errorAuth('Deep link error code:', errorCode);
        return;
      }

      const { access_token, refresh_token } = params;
      
      logAuth('Deep link params:', { 
        hasAccessToken: !!access_token, 
        hasRefreshToken: !!refresh_token,
      });

      if (!access_token || !refresh_token) {
        logAuth('No tokens in URL, skipping');
        return;
      }

      logAuth('Setting session from deep link tokens...');
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) {
        errorAuth('Error setting session from URL:', error);
        return;
      }

      if (data.session) {
        logAuth('Session created for user:', data.session.user.email);
        setSession(data.session);
        setUser(data.session.user);
        // This is a new session from deep link - track registration
        await handleSessionEstablished(data.session.user, true);
      }
    } catch (error) {
      errorAuth('Error processing deep link:', error);
    }
  }, [handleSessionEstablished]);

  // Handle deep links when app is ALREADY OPEN (not cold start)
  // This effect MUST be set up FIRST so we don't miss any incoming URLs
  useEffect(() => {
    const handleUrl = (event: { url: string }) => {
      logAuth('Deep link received (app already open):', event.url.substring(0, 100));
      createSessionFromUrl(event.url);
    };

    // Listen for incoming links while app is running
    const subscription = Linking.addEventListener('url', handleUrl);
    logAuth('URL listener registered');

    return () => {
      subscription.remove();
    };
  }, [createSessionFromUrl]);

  // Initialize auth state and handle initial deep links (cold start)
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      logAuth('Initializing auth...');
      try {
        // FIRST: Check for deep link URL with auth tokens
        // This must happen BEFORE we check session state
        // Try multiple times as there can be timing issues
        let initialUrl: string | null = null;
        
        // Attempt to get initial URL - may need retry for timing issues
        for (let attempt = 0; attempt < 3; attempt++) {
          initialUrl = await Linking.getInitialURL();
          if (initialUrl) {
            break;
          }
          // Short delay before retry
          if (attempt < 2) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        logAuth('Initial URL:', initialUrl ? initialUrl.substring(0, 100) + '...' : 'none');
        
        if (initialUrl) {
          const { params, errorCode } = QueryParams.getQueryParams(initialUrl);
          
          if (errorCode) {
            errorAuth('Error code in initial URL:', errorCode);
          }
          
          if (params.access_token && params.refresh_token) {
            logAuth('Found auth tokens in initial URL, setting session...');
            const { data, error } = await supabase.auth.setSession({
              access_token: params.access_token,
              refresh_token: params.refresh_token,
            });
            
            if (error) {
              errorAuth('Error setting session from initial URL:', error);
            } else if (data.session && mounted) {
              logAuth('Session created from deep link for user:', data.session.user.email);
              setSession(data.session);
              setUser(data.session.user);
              // This is a new session from deep link - track registration
              await handleSessionEstablished(data.session.user, true);
              setIsLoading(false);
              return; // Done - session established from deep link
            }
          }
        }
        
        // THEN: Check for existing session (if no deep link tokens)
        logAuth('Checking for existing session...');
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (initialSession?.user) {
            logAuth(`Session found for user: ${maskSecret(initialSession.user.id)} (${initialSession.user.email})`);
            setSession(initialSession);
            setUser(initialSession.user);
            await handleSessionEstablished(initialSession.user);
          } else {
            logAuth('No session found - user not authenticated');
            setSession(null);
            setUser(null);
          }
          
          logAuth('Auth initialization complete');
          setIsLoading(false);
        }
      } catch (error) {
        errorAuth('Error initializing auth:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Subscribe to auth state changes (for subsequent auth events, not initial)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        // Skip during initial load - we handle that in initializeAuth
        if (isLoading) {
          logAuth(`Auth state changed during init (${event}), skipping handler`);
          return;
        }
        
        logAuth(`Auth state changed: ${event}`);
        
        if (mounted) {
          const previousUserId = user?.id;
          const newUserId = newSession?.user?.id;
          
          if (newSession?.user) {
            logAuth(`New session for user: ${maskSecret(newUserId!)} (${newSession.user.email})`);
            setSession(newSession);
            setUser(newSession.user);
            
            // Check if user changed
            if (previousUserId && previousUserId !== newUserId) {
              logAuth(`User changed from ${maskSecret(previousUserId)} to ${maskSecret(newUserId!)} - clearing previous Cliniko data`);
              await clearAllClinikoData();
              queryClient.removeQueries({ queryKey: clinikoKeys.all });
              setHasClinikoKey(false);
            }
            
            // Handle new session
            await handleSessionEstablished(newSession.user);
          } else {
            // User signed out
            logAuth('Session ended - user signed out');
            setSession(null);
            setUser(null);
            setHasClinikoKey(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [validateClinikoCredentialOwnership, handleSessionEstablished]);

  // Send magic link to email
  const sendMagicLink = useCallback(
    async (email: string): Promise<{ error: AuthError | null }> => {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });
      
      return { error };
    },
    []
  );

  // Verify OTP code (for manual code entry)
  const verifyOtp = useCallback(
    async (email: string, token: string): Promise<{ error: AuthError | null }> => {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });
      
      if (!error && data.session) {
        await validateClinikoCredentialOwnership(data.session.user.id);
        await refreshClinikoKeyStatus();
        
        // Fire Facebook CompleteRegistration event for attribution
        fbEvents.completeRegistration();
      }
      
      return { error };
    },
    [refreshClinikoKeyStatus, validateClinikoCredentialOwnership]
  );

  const signOut = useCallback(async () => {
    logAuth('Signing out...');
    
    // Immediately clear local state for instant UI feedback
    setSession(null);
    setUser(null);
    setHasClinikoKey(false);
    logAuth('Local session cleared');
    
    // Clear Cliniko-related cache (synchronous)
    queryClient.removeQueries({ queryKey: clinikoKeys.all });
    logAuth('Cliniko cache cleared');
    
    // Fire Supabase sign out in background (don't wait for it)
    supabase.auth.signOut().then(() => {
      logAuth('Supabase sign out complete');
    }).catch((err) => {
      // Network error is fine - local session is already cleared
      logAuth('Supabase sign out background call failed (ignored):', err);
    });
    
    // Clear Cliniko credentials in background (don't block UI)
    clearAllClinikoData().then(() => {
      logAuth('Cliniko credentials cleared');
    }).catch((err) => {
      errorAuth('Failed to clear Cliniko data:', err);
    });
  }, [queryClient]);

  return {
    // State
    session,
    user,
    isLoading,
    hasClinikoKey,
    // Actions
    sendMagicLink,
    verifyOtp,
    signOut,
    refreshClinikoKeyStatus,
    // Utility
    redirectTo,
  };
});
