import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ImagePlus, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, radius } from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

type Priority = 'low' | 'medium' | 'high';

export default function FeatureRequestScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [requestDetails, setRequestDetails] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddScreenshot = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to add a screenshot.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch image picker (library only, no camera)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setScreenshot(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(
        'Error',
        'Failed to select image. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleRemoveScreenshot = () => {
    setScreenshot(null);
  };

  const uploadScreenshot = async (uri: string): Promise<string | null> => {
    try {
      // Convert URI to blob for upload
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Generate unique filename
      const filename = `feature-requests/${user?.id}/${Date.now()}.jpg`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('screenshots')
        .upload(filename, blob, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) {
        console.error('Screenshot upload error:', error);
        // Continue without screenshot if upload fails
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('screenshots')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Failed to upload screenshot:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!requestDetails.trim()) {
      Alert.alert(
        'Missing Details',
        'Please describe the feature you would like to request.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsSubmitting(true);

    try {
      let screenshotUrl: string | null = null;

      // Upload screenshot if provided
      if (screenshot) {
        screenshotUrl = await uploadScreenshot(screenshot);
      }

      // Insert feature request into Supabase
      const { error } = await supabase
        .from('feature_requests')
        .insert({
          user_id: user?.id || null,
          user_email: user?.email || null,
          request_details: requestDetails.trim(),
          priority: priority,
          screenshot_url: screenshotUrl,
          status: 'new',
        });

      if (error) {
        console.error('Feature request submission error:', error);
        Alert.alert(
          'Error',
          'Failed to submit your feature request. Please try again.',
          [{ text: 'OK' }]
        );
        return;
      }

      console.log('Feature request submitted successfully');
      router.push('/settings/feature-request/success' as any);
    } catch (error) {
      console.error('Failed to submit feature request:', error);
      Alert.alert(
        'Error',
        'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
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
                  <Text style={styles.imagePlaceholderText}>Upload an image</Text>
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
                editable={!isSubmitting}
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
                  disabled={isSubmitting}
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
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Send request</Text>
            )}
          </TouchableOpacity>
        </View>
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
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
