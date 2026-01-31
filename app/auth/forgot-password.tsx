import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Mail } from "lucide-react-native";
import { colors, spacing, radius } from "@/constants/colors";
import { TouchableOpacity } from "react-native";

/**
 * Forgot Password screen - redirects to sign-in since we use verification codes.
 * Verification codes handle both sign-in and account recovery automatically.
 */
export default function ForgotPasswordScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Mail size={48} color={colors.primary} />
        </View>
        
        <Text style={styles.heading}>No password needed!</Text>
        
        <Text style={styles.description}>
          Cliniko Voice uses verification codes instead of passwords. Just enter your email on the sign-in screen and we'll send you a secure code.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace("/auth/sign-in")}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Go to sign in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  heading: {
    fontSize: 24,
    fontWeight: "600" as const,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600" as const,
  },
});
