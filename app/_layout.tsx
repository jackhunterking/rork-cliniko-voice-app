import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NoteProvider } from "@/context/NoteContext";
import { colors } from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

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
      <Stack.Screen name="index" options={{ title: "Patients" }} />
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
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NoteProvider>
          <RootLayoutNav />
        </NoteProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
