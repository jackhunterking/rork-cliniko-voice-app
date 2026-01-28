import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, Mail, CheckCircle } from "lucide-react-native";
import { colors, spacing, radius } from "@/constants/colors";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSendResetLink = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1000);
  };

  const isFormValid = email.trim().length > 0;

  if (isSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContent}>
          <View style={styles.successIconContainer}>
            <CheckCircle size={48} color={colors.primary} />
          </View>
          <Text style={styles.successTitle}>Check your inbox</Text>
          <Text style={styles.successText}>
            We've sent a password reset link to{"\n"}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace("/auth/sign-in")}
            activeOpacity={0.8}
            testID="back-to-signin-button"
          >
            <Text style={styles.primaryButtonText}>Back to sign in</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Reset password</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Mail size={32} color={colors.primary} />
          </View>
          <Text style={styles.description}>
            Enter your email and we'll send a reset link.
          </Text>

          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoFocus
                testID="email-input"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!isFormValid || isLoading) && styles.primaryButtonDisabled,
            ]}
            onPress={handleSendResetLink}
            disabled={!isFormValid || isLoading}
            activeOpacity={0.8}
            testID="send-reset-link-button"
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Send reset link</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingTop: spacing.xl,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  inputGroup: {
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: colors.textSecondary,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  input: {
    fontSize: 17,
    color: colors.textPrimary,
    padding: 0,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.lg,
    minHeight: 52,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600" as const,
  },
  successContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  successIconContainer: {
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "600" as const,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  successText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  emailHighlight: {
    fontWeight: "600" as const,
    color: colors.textPrimary,
  },
});
