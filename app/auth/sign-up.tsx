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
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Eye, EyeOff } from "lucide-react-native";
import { colors } from "@/constants/colors";

export default function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleCreateAccount = () => {
    setPasswordError("");

    if (password !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.replace("/connect-cliniko");
    }, 1000);
  };

  const isFormValid = fullName.trim() && email.trim() && password && confirmPassword;

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + 12,
              paddingBottom: insets.bottom + 40,
              minHeight: height - insets.top - insets.bottom,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={28} color={colors.primary} />
          </TouchableOpacity>

          <Text style={styles.largeTitle}>Create account</Text>
          <Text style={styles.subtitle}>Set up your Cliniko Voice account</Text>

          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>FULL NAME</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="John Smith"
                placeholderTextColor={colors.placeholder}
                autoCapitalize="words"
                autoComplete="name"
                testID="fullname-input"
              />
            </View>
            <View style={styles.separator} />
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>EMAIL</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={colors.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                testID="email-input"
              />
            </View>
            <View style={styles.separator} />
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create a password"
                  placeholderTextColor={colors.placeholder}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="new-password"
                  testID="password-input"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={colors.iconMuted} />
                  ) : (
                    <Eye size={20} color={colors.iconMuted} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.separator} />
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={styles.passwordInput}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (passwordError) setPasswordError("");
                  }}
                  placeholder="Confirm your password"
                  placeholderTextColor={colors.placeholder}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoComplete="new-password"
                  testID="confirm-password-input"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={colors.iconMuted} />
                  ) : (
                    <Eye size={20} color={colors.iconMuted} />
                  )}
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!isFormValid || isLoading) && styles.primaryButtonDisabled,
            ]}
            onPress={handleCreateAccount}
            disabled={!isFormValid || isLoading}
            activeOpacity={0.8}
            testID="create-account-button"
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Create account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?{" "}
              <Text
                style={styles.footerLink}
                onPress={() => router.replace("/auth/sign-in")}
              >
                Sign in
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  backButton: {
    alignSelf: "flex-start",
    padding: 4,
    marginLeft: -8,
    marginBottom: 20,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: "700" as const,
    color: colors.textPrimary,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  formSection: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    overflow: "hidden",
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    fontSize: 17,
    color: colors.textPrimary,
    paddingVertical: 4,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    fontSize: 17,
    color: colors.textPrimary,
    paddingVertical: 4,
  },
  eyeButton: {
    padding: 8,
    marginRight: -8,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 16,
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
  },
  primaryButtonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600" as const,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: "600" as const,
  },
});
