import { Stack } from "expo-router";
import { colors } from "@/constants/colors";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTransparent: true,
        headerTitle: "",
        headerBackTitle: "",
        headerBackButtonDisplayMode: "minimal",
        headerTintColor: colors.primary,
        contentStyle: { backgroundColor: colors.background },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="forgot-password" options={{ headerTitle: "Reset password", headerTransparent: false, headerShadowVisible: false, headerStyle: { backgroundColor: colors.background } }} />
    </Stack>
  );
}
