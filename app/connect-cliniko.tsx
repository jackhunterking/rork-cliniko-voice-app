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
  ScrollView,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Link2, Eye, EyeOff, ExternalLink } from "lucide-react-native";
import { colors, spacing, radius } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { saveClinikoCredentialsWithBackup } from "@/lib/secure-storage";
import { validateClinikoCredentials, CLINIKO_SHARDS, ClinikoShard } from "@/services/cliniko";

export default function ConnectClinikoScreen() {
  const router = useRouter();
  const { refreshClinikoKeyStatus, signOut, user } = useAuth();
  
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState("");
  const [validationMessage, setValidationMessage] = useState("");

  /**
   * Auto-detect the correct Cliniko shard by trying each one
   */
  const detectShardForApiKey = async (apiKeyToTest: string): Promise<{ shard: ClinikoShard; user: { firstName: string; lastName: string; email: string } } | null> => {
    for (const shardConfig of CLINIKO_SHARDS) {
      try {
        setValidationMessage(`Trying ${shardConfig.region}...`);
        const result = await validateClinikoCredentials(apiKeyToTest, shardConfig.id);
        if (result.valid && result.user) {
          return { shard: shardConfig.id, user: result.user };
        }
      } catch (err) {
        // Continue to next shard
        console.log(`[Cliniko] Shard ${shardConfig.id} failed, trying next...`);
      }
    }
    return null;
  };

  const handleSaveKey = async () => {
    setError("");
    setValidationMessage("");
    
    const trimmedKey = apiKey.trim();
    
    if (!trimmedKey) {
      setError("Please enter your Cliniko API key");
      return;
    }

    // Basic validation - Cliniko API keys are typically long alphanumeric strings
    if (trimmedKey.length < 20) {
      setError("This doesn't look like a valid Cliniko API key");
      return;
    }

    if (!user?.id) {
      setError("You must be signed in to connect Cliniko");
      return;
    }

    setIsLoading(true);
    setValidationMessage("Detecting your Cliniko region...");
    
    try {
      // Auto-detect the correct shard by trying each one
      const detectedConfig = await detectShardForApiKey(trimmedKey);
      
      if (!detectedConfig) {
        setError("Invalid API key. Please check your credentials and try again.");
        setValidationMessage("");
        return;
      }

      setValidationMessage("Saving credentials...");

      // Save all credentials together with the coupled user ID (also syncs to backend)
      await saveClinikoCredentialsWithBackup(trimmedKey, detectedConfig.shard, user.id);
      
      // Update auth context
      await refreshClinikoKeyStatus();
      
      console.log(`[Cliniko] Connected as ${detectedConfig.user.firstName} ${detectedConfig.user.lastName} (${detectedConfig.shard})`);
      
      // Navigation will be handled by AuthGuard
      router.replace("/(tabs)/home");
    } catch (err) {
      console.error("Failed to connect Cliniko:", err);
      
      if (err instanceof Error) {
        if (err.message.includes('Network') || err.message.includes('fetch')) {
          setError("Network error. Please check your connection and try again.");
        } else {
          setError(err.message || "Failed to connect. Please try again.");
        }
      } else {
        setError("Failed to connect. Please try again.");
      }
    } finally {
      setIsLoading(false);
      setValidationMessage("");
    }
  };

  const handleOpenClinikoHelp = () => {
    Linking.openURL("https://help.cliniko.com/en/articles/1023957-generate-a-cliniko-api-key");
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      // Navigation will be handled by AuthGuard
    } catch (err) {
      console.error("Failed to sign out:", err);
      Alert.alert(
        "Sign Out Failed",
        "There was a problem signing out. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  const isFormValid = apiKey.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
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
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Link2 size={40} color={colors.primary} />
            </View>
            <Text style={styles.title}>Connect Cliniko</Text>
            <Text style={styles.subtitle}>
              Enter your Cliniko API key to sync patients and templates.
            </Text>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.formCard}>
            {/* API Key Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>API Key</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={apiKey}
                  onChangeText={(text) => {
                    setApiKey(text);
                    if (error) setError("");
                  }}
                  placeholder="Paste your API key here"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry={!showKey}
                  editable={!isLoading}
                  multiline={false}
                  testID="api-key-input"
                />
                <TouchableOpacity
                  onPress={() => setShowKey(!showKey)}
                  style={styles.eyeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showKey ? (
                    <EyeOff size={20} color={colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.helpLink}
            onPress={handleOpenClinikoHelp}
            activeOpacity={0.7}
          >
            <Text style={styles.helpLinkText}>Where do I find my API key?</Text>
            <ExternalLink size={14} color={colors.primary} />
          </TouchableOpacity>

          {validationMessage ? (
            <View style={styles.validationContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.validationText}>{validationMessage}</Text>
            </View>
          ) : null}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                (!isFormValid || isLoading) && styles.primaryButtonDisabled,
              ]}
              onPress={handleSaveKey}
              disabled={!isFormValid || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Connect</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                isSigningOut && styles.secondaryButtonDisabled,
              ]}
              onPress={handleSignOut}
              activeOpacity={0.7}
              disabled={isLoading || isSigningOut}
            >
              {isSigningOut ? (
                <ActivityIndicator color={colors.textSecondary} size="small" />
              ) : (
                <Text style={styles.secondaryButtonText}>Sign out</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

    </SafeAreaView>
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
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: 80,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: spacing.md,
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
    backgroundColor: colors.backgroundSecondary,
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: colors.textPrimary,
    padding: 0,
  },
  eyeButton: {
    padding: spacing.xs,
  },
  helpLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    gap: 6,
  },
  helpLinkText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "500" as const,
  },
  validationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: spacing.sm,
  },
  validationText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  buttonContainer: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
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
  secondaryButton: {
    backgroundColor: "transparent",
    paddingVertical: 16,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 52,
  },
  secondaryButtonDisabled: {
    opacity: 0.5,
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: 17,
    fontWeight: "500" as const,
  },
});
