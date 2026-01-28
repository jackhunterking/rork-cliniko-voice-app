import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, Mail } from "lucide-react-native";
import { colors, spacing, radius } from "@/constants/colors";

/**
 * Forgot Password screen - redirects to sign-in since we use Magic Links.
 * Magic Links handle both sign-in and account recovery automatically.
 */
export default function ForgotPasswordScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Forgot password?</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Mail size={48} color={colors.primary} />
        </View>
        
        <Text style={styles.heading}>No password needed!</Text>
        
        <Text style={styles.description}>
          Cliniko Voice uses magic links instead of passwords. Just enter your email on the sign-in screen and we'll send you a secure link.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace("/auth/sign-in")}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Go to sign in</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: colors.textPrimary,
  },
  placeholder: {
    width: 32,
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
