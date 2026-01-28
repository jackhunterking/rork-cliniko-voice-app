import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NoteProvider } from "@/context/NoteContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { colors } from "@/constants/colors";
import { logRouter } from "@/lib/debug";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

/**
 * Route guard component that handles navigation based on auth state
 */
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, isLoading, hasClinikoKey } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't do anything while loading
    if (isLoading) {
      logRouter('AuthGuard: Still loading, waiting...');
      return;
    }

    // Hide splash screen once we know auth state
    SplashScreen.hideAsync();

    // Determine current route group
    const inAuthGroup = segments[0] === "auth";
    const inTabsGroup = segments[0] === "(tabs)";
    const onConnectCliniko = pathname === "/connect-cliniko";
    const onSplash = pathname === "/splash";
    const onIndex = pathname === "/";

    logRouter(`AuthGuard: session=${!!session}, hasClinikoKey=${hasClinikoKey}, pathname=${pathname}`);

    // User is NOT authenticated
    if (!session) {
      // If not in auth group and not on splash/index, redirect to welcome
      if (!inAuthGroup && !onSplash && !onIndex) {
        logRouter('AuthGuard: No session, not in auth group → /auth/welcome');
        router.replace("/auth/welcome");
      } else if (onIndex || onSplash) {
        // If on index or splash, go to welcome
        logRouter('AuthGuard: No session, on index/splash → /auth/welcome');
        router.replace("/auth/welcome");
      } else {
        logRouter('AuthGuard: No session, already in auth group → staying');
      }
      return;
    }

    // User IS authenticated
    if (session) {
      // If user doesn't have Cliniko key
      if (!hasClinikoKey) {
        // If not already on connect-cliniko, redirect there
        if (!onConnectCliniko) {
          logRouter('AuthGuard: Has session, no Cliniko key → /connect-cliniko');
          router.replace("/connect-cliniko");
        } else {
          logRouter('AuthGuard: Has session, no Cliniko key, already on connect-cliniko → staying');
        }
        return;
      }

      // User has both session and Cliniko key
      // If still in auth group, connect screen, splash, or index, redirect to home
      if (inAuthGroup || onConnectCliniko || onSplash || onIndex) {
        logRouter('AuthGuard: Has session + Cliniko key, on setup screen → /(tabs)/home');
        router.replace("/(tabs)/home");
      } else {
        logRouter(`AuthGuard: Has session + Cliniko key, on ${pathname} → staying`);
      }
    }
  }, [session, isLoading, hasClinikoKey, segments, pathname, router]);

  // Show nothing while loading (splash screen is visible)
  if (isLoading) {
    return null;
  }

  return <>{children}</>;
}

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerTintColor: colors.primary,
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.textPrimary },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="splash" options={{ headerShown: false, animation: 'none' }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="patient/[id]" options={{ title: "Patient" }} />
      <Stack.Screen name="note/setup" options={{ title: "New Treatment Note" }} />
      <Stack.Screen name="note/editor" options={{ title: "Treatment Note" }} />
      <Stack.Screen name="note/review" options={{ title: "Review" }} />
      <Stack.Screen
        name="note/success"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="connect-cliniko" options={{ headerShown: false }} />
      <Stack.Screen name="settings/api-key" options={{ title: "Cliniko API Key" }} />
      <Stack.Screen name="settings/help" options={{ title: "Help & Support" }} />
      <Stack.Screen name="settings/feature-request" options={{ title: "Request a Feature" }} />
      <Stack.Screen name="settings/feature-request/success" options={{ headerShown: false }} />
      <Stack.Screen name="settings/delete-data" options={{ title: "Delete My Data" }} />
      <Stack.Screen name="settings/delete-data/success" options={{ headerShown: false }} />
      <Stack.Screen name="settings/diagnostics" options={{ title: "Diagnostics" }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <NoteProvider>
            <AuthGuard>
              <RootLayoutNav />
            </AuthGuard>
          </NoteProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
