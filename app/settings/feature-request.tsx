import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActionSheetIOS,
  Platform,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ImagePlus, X } from 'lucide-react-native';
import { colors, spacing, radius } from '@/constants/colors';

type Priority = 'low' | 'medium' | 'high';

export default function FeatureRequestScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [requestDetails, setRequestDetails] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [showActionSheet, setShowActionSheet] = useState(false);

  const handleAddScreenshot = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take photo', 'Choose from library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1 || buttonIndex === 2) {
            setScreenshot('https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop');
          }
        }
      );
    } else {
      setShowActionSheet(true);
    }
  };

  const handleActionSheetOption = (option: 'photo' | 'library' | 'cancel') => {
    setShowActionSheet(false);
    if (option !== 'cancel') {
      setScreenshot('https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop');
    }
  };

  const handleRemoveScreenshot = () => {
    setScreenshot(null);
  };

  const handleSubmit = () => {
    console.log('Submitting feature request:', { screenshot, requestDetails, priority });
    router.push('/settings/feature-request/success' as any);
  };

  const priorities: { key: Priority; label: string }[] = [
    { key: 'low', label: 'Low' },
    { key: 'medium', label: 'Medium' },
    { key: 'high', label: 'High' },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Request a feature',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
        }}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 100 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.subtitle}>
            Tell us what would make Cliniko Voice better.
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Screenshot / Image</Text>
            {screenshot ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: screenshot }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={handleRemoveScreenshot}
                  activeOpacity={0.8}
                >
                  <X size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.imagePlaceholder}
                onPress={handleAddScreenshot}
                activeOpacity={0.7}
              >
                <View style={styles.imagePlaceholderContent}>
                  <View style={styles.iconCircle}>
                    <ImagePlus size={24} color={colors.textSecondary} />
                  </View>
                  <Text style={styles.imagePlaceholderText}>Add a screenshot</Text>
                  <Text style={styles.imagePlaceholderSubtext}>Optional</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>What would you like?</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={requestDetails}
                onChangeText={setRequestDetails}
                placeholder="Describe the feature. What were you trying to do? What happened instead?"
                placeholderTextColor={colors.textSecondary}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Priority (optional)</Text>
            <View style={styles.segmentedControl}>
              {priorities.map((p, index) => (
                <TouchableOpacity
                  key={p.key}
                  style={[
                    styles.segment,
                    index === 0 && styles.segmentFirst,
                    index === priorities.length - 1 && styles.segmentLast,
                    priority === p.key && styles.segmentActive,
                  ]}
                  onPress={() => setPriority(p.key)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      priority === p.key && styles.segmentTextActive,
                    ]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Text style={styles.footnote}>
            Please do not include patient-identifying information in screenshots.
          </Text>
        </ScrollView>

        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>Send request</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={showActionSheet}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActionSheet(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowActionSheet(false)}
        >
          <View style={styles.actionSheet}>
            <TouchableOpacity
              style={styles.actionSheetOption}
              onPress={() => handleActionSheetOption('photo')}
            >
              <Text style={styles.actionSheetOptionText}>Take photo</Text>
            </TouchableOpacity>
            <View style={styles.actionSheetSeparator} />
            <TouchableOpacity
              style={styles.actionSheetOption}
              onPress={() => handleActionSheetOption('library')}
            >
              <Text style={styles.actionSheetOptionText}>Choose from library</Text>
            </TouchableOpacity>
            <View style={styles.actionSheetSeparator} />
            <TouchableOpacity
              style={styles.actionSheetOption}
              onPress={() => handleActionSheetOption('cancel')}
            >
              <Text style={styles.actionSheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  scrollContent: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 21,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  imagePlaceholder: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderContent: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  imagePlaceholderText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  imagePlaceholderSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: radius.md,
  },
  removeButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 140,
  },
  textInput: {
    fontSize: 15,
    color: colors.textPrimary,
    padding: spacing.md,
    lineHeight: 22,
    minHeight: 140,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.sm,
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radius.sm - 2,
  },
  segmentFirst: {},
  segmentLast: {},
  segmentActive: {
    backgroundColor: colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.textPrimary,
  },
  footnote: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing.lg,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  actionSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingBottom: spacing.xl,
  },
  actionSheetOption: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionSheetOptionText: {
    fontSize: 17,
    color: colors.primary,
  },
  actionSheetCancelText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  actionSheetSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
});
