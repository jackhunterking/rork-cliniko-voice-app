import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { Mail, CheckCircle } from "lucide-react-native";
import { colors, spacing, radius } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";

type ScreenState = "email" | "code" | "sent";

export default function SignInScreen() {
  const router = useRouter();
  const { sendMagicLink, verifyOtp } = useAuth();
  
  const [screenState, setScreenState] = useState<ScreenState>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendMagicLink = async () => {
    setError("");
    
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    
    const { error: authError } = await sendMagicLink(email.trim());
    
    setIsLoading(false);
    
    if (authError) {
      setError(authError.message || "Failed to send magic link. Please try again.");
    } else {
      setScreenState("sent");
    }
  };

  const handleVerifyCode = async () => {
    setError("");
    
    if (!code.trim() || code.trim().length !== 6) {
      setError("Please enter the 6-digit code from your email");
      return;
    }

    setIsLoading(true);
    
    const { error: authError } = await verifyOtp(email.trim(), code.trim());
    
    setIsLoading(false);
    
    if (authError) {
      setError(authError.message || "Invalid or expired code. Please try again.");
    }
    // Navigation is handled by AuthGuard in _layout.tsx
  };

  const handleResendCode = async () => {
    setError("");
    setIsLoading(true);
    
    const { error: authError } = await sendMagicLink(email.trim());
    
    setIsLoading(false);
    
    if (authError) {
      setError(authError.message || "Failed to resend. Please try again.");
    } else {
      setError(""); // Clear any previous errors
      // Show a brief success indicator could be added here
    }
  };

  // Success screen - magic link sent
  if (screenState === "sent") {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerTitle: "Check your email" }} />
        <View style={styles.successContent}>
          <View style={styles.successIconContainer}>
            <CheckCircle size={48} color={colors.primary} />
          </View>
          <Text style={styles.successTitle}>Magic link sent!</Text>
          <Text style={styles.successText}>
            We sent a sign-in link to{"\n"}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>
          <Text style={styles.instructionText}>
            Click the link in your email, or enter the 6-digit code below.
          </Text>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.codeCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Verification Code</Text>
              <TextInput
                style={styles.codeInput}
                value={code}
                onChangeText={(text) => {
                  // Only allow numbers, max 6 digits
                  const cleaned = text.replace(/[^0-9]/g, "").slice(0, 6);
                  setCode(cleaned);
                  if (error) setError("");
                }}
                placeholder="000000"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
                editable={!isLoading}
                testID="code-input"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              (code.length !== 6 || isLoading) && styles.primaryButtonDisabled,
            ]}
            onPress={handleVerifyCode}
            disabled={code.length !== 6 || isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Verify code</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resendLink}
            onPress={handleResendCode}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Text style={styles.resendText}>
              Didn't receive the email?{" "}
              <Text style={styles.resendTextBold}>Resend</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Email entry screen
  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconContainer}>
            <Mail size={32} color={colors.primary} />
          </View>
          
          <Text style={styles.description}>
            Enter your email and we'll send you a magic link to sign in instantly. No password needed.
          </Text>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) setError("");
                }}
                placeholder="Enter your email"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                autoFocus
                editable={!isLoading}
                testID="email-input"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!email.trim() || isLoading) && styles.primaryButtonDisabled,
            ]}
            onPress={handleSendMagicLink}
            disabled={!email.trim() || isLoading}
            activeOpacity={0.8}
            testID="send-magic-link-button"
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Send magic link</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signUpLink}
            onPress={() => router.replace("/auth/sign-up")}
            activeOpacity={0.7}
          >
            <Text style={styles.signUpText}>
              New to Cliniko Voice?{" "}
              <Text style={styles.signUpTextBold}>Create account</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
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
    paddingHorizontal: spacing.sm,
  },
  errorContainer: {
    backgroundColor: colors.error + "15",
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.error + "30",
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: "center",
  },
  formCard: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
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
  signUpLink: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  signUpText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  signUpTextBold: {
    color: colors.primary,
    fontWeight: "600" as const,
  },
  // Success screen styles
  successContent: {
    flex: 1,
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  successIconContainer: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "600" as const,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  successText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  emailHighlight: {
    fontWeight: "600" as const,
    color: colors.textPrimary,
  },
  instructionText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  codeCard: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  codeInput: {
    fontSize: 24,
    fontWeight: "600" as const,
    color: colors.textPrimary,
    padding: 0,
    letterSpacing: 8,
    textAlign: "center",
  },
  resendLink: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  resendText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  resendTextBold: {
    color: colors.primary,
    fontWeight: "600" as const,
  },
});
