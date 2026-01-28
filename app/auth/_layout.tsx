import { Stack } from "expo-router";
import { colors } from "@/constants/colors";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTransparent: false,
        headerBackTitle: "",
        headerBackButtonDisplayMode: "minimal",
        headerTintColor: colors.primary,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { 
          color: colors.textPrimary,
          fontSize: 17,
          fontWeight: "600",
        },
        contentStyle: { backgroundColor: colors.backgroundSecondary },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ headerTitle: "Sign in" }} />
      <Stack.Screen name="sign-up" options={{ headerTitle: "Create account" }} />
      <Stack.Screen name="forgot-password" options={{ headerTitle: "Reset password" }} />
    </Stack>
  );
}
