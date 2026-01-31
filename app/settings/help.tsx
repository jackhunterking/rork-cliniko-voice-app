import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Linking,
} from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight, Mail, Key, Shield, FileText, X, ExternalLink } from 'lucide-react-native';
import { colors, spacing, radius } from '@/constants/colors';
import { BottomSheet } from '@/components/BottomSheet';

// Centralized URLs for consistency
const URLS = {
  SUPPORT_EMAIL: 'hello@clinikovoice.com',
  CLINIKO_API_KEY_HELP: 'https://help.cliniko.com/en/articles/1023957-generate-a-cliniko-api-key',
  PRIVACY_POLICY: 'https://clinikovoice.com/privacy',
  TERMS_OF_SERVICE: 'https://clinikovoice.com/terms',
};

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const [showContactModal, setShowContactModal] = useState(false);
  const [showApiKeySheet, setShowApiKeySheet] = useState(false);

  const handleContactSupport = () => {
    setShowContactModal(true);
  };

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${URLS.SUPPORT_EMAIL}`);
    setShowContactModal(false);
  };

  const handleApiKeyHelp = () => {
    setShowApiKeySheet(true);
  };

  const handleOpenClinikoHelp = () => {
    Linking.openURL(URLS.CLINIKO_API_KEY_HELP);
    setShowApiKeySheet(false);
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL(URLS.PRIVACY_POLICY);
  };

  const handleTermsOfService = () => {
    Linking.openURL(URLS.TERMS_OF_SERVICE);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Help & Support',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
        }}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            onPress={handleContactSupport}
            activeOpacity={0.6}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                <Mail size={18} color={colors.primary} />
              </View>
              <Text style={styles.rowTitle}>Contact support</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity
            style={styles.row}
            onPress={handleApiKeyHelp}
            activeOpacity={0.6}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#FEF3C7' }]}>
                <Key size={18} color="#D97706" />
              </View>
              <Text style={styles.rowTitle}>How to find your Cliniko API key</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            onPress={handlePrivacyPolicy}
            activeOpacity={0.6}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#EDE9FE' }]}>
                <Shield size={18} color="#7C3AED" />
              </View>
              <Text style={styles.rowTitle}>Privacy policy</Text>
            </View>
            <ExternalLink size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity
            style={styles.row}
            onPress={handleTermsOfService}
            activeOpacity={0.6}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]}>
                <FileText size={18} color="#2563EB" />
              </View>
              <Text style={styles.rowTitle}>Terms of service</Text>
            </View>
            <ExternalLink size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showContactModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowContactModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowContactModal(false)}
              activeOpacity={0.7}
            >
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.modalIconContainer}>
              <Mail size={28} color={colors.primary} />
            </View>

            <Text style={styles.modalTitle}>Contact Support</Text>
            <Text style={styles.modalDescription}>
              Send us an email and we'll get back to you as soon as possible.
            </Text>

            <TouchableOpacity
              style={styles.emailButton}
              onPress={handleEmailPress}
              activeOpacity={0.8}
            >
              <Text style={styles.emailButtonText}>{URLS.SUPPORT_EMAIL}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomSheet
        visible={showApiKeySheet}
        onClose={() => setShowApiKeySheet(false)}
        maxHeight={440}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Finding your Cliniko API key</Text>
          
          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepText}>
                Log in to your Cliniko account and go to{' '}
                <Text style={styles.stepBold}>Settings → API Keys</Text>
              </Text>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepText}>
                Click <Text style={styles.stepBold}>Generate new API key</Text> and give it a name (e.g., "Cliniko Voice")
              </Text>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepText}>
                Copy the key and paste it in the app. Keep it secure — it grants access to your Cliniko data.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.helpLinkButton}
            onPress={handleOpenClinikoHelp}
            activeOpacity={0.7}
          >
            <Text style={styles.helpLinkText}>View Cliniko's guide</Text>
            <ExternalLink size={14} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sheetButton}
            onPress={() => setShowApiKeySheet(false)}
            activeOpacity={0.8}
          >
            <Text style={styles.sheetButtonText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  card: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 56,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: spacing.xs,
  },
  modalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  modalDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  emailButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    width: '100%',
    alignItems: 'center',
  },
  emailButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  sheetContent: {
    paddingHorizontal: spacing.lg,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
  },
  stepText: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  stepBold: {
    fontWeight: '600' as const,
  },
  helpLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: 6,
  },
  helpLinkText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500' as const,
  },
  sheetButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  sheetButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
