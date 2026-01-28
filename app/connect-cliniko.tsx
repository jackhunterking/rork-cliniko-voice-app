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
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { Link2, Eye, EyeOff, ExternalLink, ChevronDown, Check, Globe } from "lucide-react-native";
import { colors, spacing, radius } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { saveClinikoCredentials } from "@/lib/secure-storage";
import { validateClinikoCredentials, CLINIKO_SHARDS, ClinikoShard, ClinikoShardConfig } from "@/services/cliniko";

export default function ConnectClinikoScreen() {
  const router = useRouter();
  const { refreshClinikoKeyStatus, signOut, user } = useAuth();
  
  const [apiKey, setApiKey] = useState("");
  const [selectedShard, setSelectedShard] = useState<ClinikoShardConfig>(CLINIKO_SHARDS[0]);
  const [showKey, setShowKey] = useState(false);
  const [showShardPicker, setShowShardPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationMessage, setValidationMessage] = useState("");

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
    setValidationMessage("Validating API key...");
    
    try {
      // Validate the API key by calling Cliniko
      const validation = await validateClinikoCredentials(trimmedKey, selectedShard.id);
      
      if (!validation.valid) {
        setError("Invalid API key or incorrect region. Please check your credentials and try again.");
        setValidationMessage("");
        return;
      }

      setValidationMessage("Saving credentials...");

      // Save all credentials together with the coupled user ID
      await saveClinikoCredentials(trimmedKey, selectedShard.id, user.id);
      
      // Update auth context
      await refreshClinikoKeyStatus();
      
      console.log(`[Cliniko] Connected as ${validation.user?.firstName} ${validation.user?.lastName}`);
      
      // Navigation will be handled by AuthGuard
      router.replace("/(tabs)/home");
    } catch (err) {
      console.error("Failed to connect Cliniko:", err);
      
      if (err instanceof Error) {
        if (err.message.includes('401') || err.message.includes('Unauthorized')) {
          setError("Invalid API key. Please check your key and selected region.");
        } else if (err.message.includes('Network') || err.message.includes('fetch')) {
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
    Linking.openURL("https://help.cliniko.com/en/articles/2643149-where-can-i-find-my-api-key");
  };

  const handleSignOut = async () => {
    await signOut();
    // Navigation will be handled by AuthGuard
  };

  const handleSelectShard = (shard: ClinikoShardConfig) => {
    setSelectedShard(shard);
    setShowShardPicker(false);
    setError(""); // Clear any previous errors
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
            {/* Region Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Region</Text>
              <TouchableOpacity
                style={styles.shardSelector}
                onPress={() => setShowShardPicker(true)}
                activeOpacity={0.7}
                disabled={isLoading}
              >
                <View style={styles.shardSelectorContent}>
                  <Globe size={18} color={colors.textSecondary} />
                  <Text style={styles.shardSelectorText}>{selectedShard.label}</Text>
                </View>
                <ChevronDown size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              <Text style={styles.inputHint}>
                Select the region where your Cliniko account is hosted
              </Text>
            </View>

            <View style={styles.separator} />

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
              style={styles.secondaryButton}
              onPress={handleSignOut}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <Text style={styles.secondaryButtonText}>Sign out</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footnote}>
            Your API key is stored securely on your device and never sent to our servers.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Shard Picker Modal */}
      <Modal
        visible={showShardPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowShardPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Region</Text>
              <TouchableOpacity
                onPress={() => setShowShardPicker(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>Done</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Choose the region where your Cliniko account is hosted
            </Text>
            <ScrollView style={styles.shardList}>
              {CLINIKO_SHARDS.map((shard) => (
                <TouchableOpacity
                  key={shard.id}
                  style={[
                    styles.shardOption,
                    selectedShard.id === shard.id && styles.shardOptionSelected,
                  ]}
                  onPress={() => handleSelectShard(shard)}
                  activeOpacity={0.7}
                >
                  <View style={styles.shardOptionContent}>
                    <Text style={styles.shardOptionLabel}>{shard.label}</Text>
                    <Text style={styles.shardOptionRegion}>{shard.region}</Text>
                  </View>
                  {selectedShard.id === shard.id && (
                    <Check size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: colors.textPrimary,
    padding: 0,
  },
  inputHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
  },
  eyeButton: {
    padding: spacing.xs,
  },
  shardSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  shardSelectorContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  shardSelectorText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
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
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: 17,
    fontWeight: "500" as const,
  },
  footnote: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xl,
    lineHeight: 18,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: spacing.md,
    paddingBottom: 40,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: colors.textPrimary,
  },
  modalCloseButton: {
    padding: spacing.xs,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: colors.primary,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  shardList: {
    paddingHorizontal: spacing.lg,
  },
  shardOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  shardOptionSelected: {
    backgroundColor: colors.primaryLight,
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
    borderBottomWidth: 0,
  },
  shardOptionContent: {
    flex: 1,
  },
  shardOptionLabel: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: colors.textPrimary,
  },
  shardOptionRegion: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
