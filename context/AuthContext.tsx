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
} from '@/lib/secure-storage';
import { clinikoKeys } from '@/hooks/useCliniko';

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

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasClinikoKey, setHasClinikoKey] = useState(false);
  
  // Get query client for cache management
  const queryClient = useQueryClient();

  // Check Cliniko key status and validate it's for the current user
  const refreshClinikoKeyStatus = useCallback(async () => {
    const isConfigured = await isClinikoConfigured();
    setHasClinikoKey(isConfigured);
  }, []);

  // Validate that Cliniko credentials belong to the current user
  const validateClinikoCredentialOwnership = useCallback(async (currentUserId: string) => {
    const coupledUserId = await getCoupledUserId();
    
    // If there's a coupled user ID and it doesn't match, clear credentials
    if (coupledUserId && coupledUserId !== currentUserId) {
      console.log('[Auth] Cliniko credentials belong to different user, clearing...');
      await clearAllClinikoData();
      // Clear all Cliniko-related cache
      queryClient.removeQueries({ queryKey: clinikoKeys.all });
      setHasClinikoKey(false);
      return false;
    }
    
    return true;
  }, [queryClient]);

  // Handle deep link URL to create session
  const createSessionFromUrl = useCallback(async (url: string) => {
    try {
      const { params, errorCode } = QueryParams.getQueryParams(url);

      if (errorCode) {
        console.error('Deep link error:', errorCode);
        return;
      }

      const { access_token, refresh_token } = params;

      if (!access_token || !refresh_token) {
        return;
      }

      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) {
        console.error('Error setting session from URL:', error);
        return;
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        
        // Validate Cliniko credentials belong to this user
        await validateClinikoCredentialOwnership(data.session.user.id);
        await refreshClinikoKeyStatus();
      }
    } catch (error) {
      console.error('Error processing deep link:', error);
    }
  }, [refreshClinikoKeyStatus, validateClinikoCredentialOwnership]);

  // Initialize auth state and handle deep links
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          // Check Cliniko key if user is authenticated
          if (initialSession?.user) {
            // First validate ownership
            const isValid = await validateClinikoCredentialOwnership(initialSession.user.id);
            
            if (isValid) {
              const isConfigured = await isClinikoConfigured();
              setHasClinikoKey(isConfigured);
            }
          }
          
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event);
        
        if (mounted) {
          const previousUserId = user?.id;
          const newUserId = newSession?.user?.id;
          
          setSession(newSession);
          setUser(newSession?.user ?? null);
          
          if (newSession?.user) {
            // Check if user changed
            if (previousUserId && previousUserId !== newUserId) {
              console.log('[Auth] User changed, clearing previous Cliniko data');
              await clearAllClinikoData();
              queryClient.removeQueries({ queryKey: clinikoKeys.all });
              setHasClinikoKey(false);
            } else {
              // Same user or new login, validate credentials
              const isValid = await validateClinikoCredentialOwnership(newSession.user.id);
              if (isValid) {
                const isConfigured = await isClinikoConfigured();
                setHasClinikoKey(isConfigured);
              }
            }
          } else {
            // User signed out
            setHasClinikoKey(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [validateClinikoCredentialOwnership]);

  // Handle deep links when app is opened via URL
  useEffect(() => {
    // Handle URL when app is already open
    const handleUrl = (event: { url: string }) => {
      createSessionFromUrl(event.url);
    };

    // Listen for incoming links
    const subscription = Linking.addEventListener('url', handleUrl);

    // Check if app was opened with a URL
    Linking.getInitialURL().then((url) => {
      if (url) {
        createSessionFromUrl(url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [createSessionFromUrl]);

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
      }
      
      return { error };
    },
    [refreshClinikoKeyStatus, validateClinikoCredentialOwnership]
  );

  const signOut = useCallback(async () => {
    console.log('[Auth] Signing out, clearing all Cliniko data...');
    
    // Clear Cliniko credentials from secure storage
    await clearAllClinikoData();
    
    // Clear all Cliniko-related cache
    queryClient.removeQueries({ queryKey: clinikoKeys.all });
    
    setHasClinikoKey(false);
    
    // Sign out from Supabase
    await supabase.auth.signOut();
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
