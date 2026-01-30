import React, { useState } from 'react';
import { Alert, View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { PaywallPreview } from '@/components/PaywallPreview';
import { PaywallPreviewMinimal } from '@/components/PaywallPreviewMinimal';
import { colors, spacing, radius } from '@/constants/colors';
import { ChevronLeft } from 'lucide-react-native';

type DesignType = 'feature-rich' | 'minimal';

export default function PaywallPreviewScreen() {
  const router = useRouter();
  const [currentDesign, setCurrentDesign] = useState<DesignType>('feature-rich');

  const handleClose = () => {
    router.back();
  };

  const handleSubscribe = () => {
    Alert.alert(
      'Subscribe Tapped',
      'In production, this would trigger the Superwall purchase flow.\n\nReplicate this design in Superwall\'s visual editor.',
      [{ text: 'OK' }]
    );
  };

  const handleRestore = () => {
    Alert.alert(
      'Restore Tapped',
      'In production, this would restore purchases via Superwall.',
      [{ text: 'OK' }]
    );
  };

  const toggleDesign = () => {
    setCurrentDesign(prev => prev === 'feature-rich' ? 'minimal' : 'feature-rich');
  };

  return (
    <View style={styles.container}>
      {/* Design Selector */}
      <SafeAreaView style={styles.selectorContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleClose}>
          <ChevronLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[
              styles.segment,
              currentDesign === 'feature-rich' && styles.segmentActive,
            ]}
            onPress={() => setCurrentDesign('feature-rich')}
          >
            <Text
              style={[
                styles.segmentText,
                currentDesign === 'feature-rich' && styles.segmentTextActive,
              ]}
            >
              Feature Rich
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segment,
              currentDesign === 'minimal' && styles.segmentActive,
            ]}
            onPress={() => setCurrentDesign('minimal')}
          >
            <Text
              style={[
                styles.segmentText,
                currentDesign === 'minimal' && styles.segmentTextActive,
              ]}
            >
              Minimal Dark
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.placeholder} />
      </SafeAreaView>

      {/* Paywall Preview */}
      <View style={styles.previewContainer}>
        {currentDesign === 'feature-rich' ? (
          <PaywallPreview
            onClose={undefined} // Using top nav instead
            onSubscribe={handleSubscribe}
            onRestore={handleRestore}
          />
        ) : (
          <PaywallPreviewMinimal
            onClose={undefined} // Using top nav instead
            onSubscribe={handleSubscribe}
            onRestore={handleRestore}
          />
        )}
      </View>

      {/* Design Tips */}
      <SafeAreaView style={styles.tipsContainer}>
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>
            {currentDesign === 'feature-rich' ? '📋 Feature-Rich Design' : '🌙 Minimal Dark Design'}
          </Text>
          <Text style={styles.tipsText}>
            {currentDesign === 'feature-rich' 
              ? 'Best for: Showing value & features. Uses white card over gradient header. Great for first-time users.'
              : 'Best for: Premium feel & urgency. Dark immersive background. Great for re-engagement.'}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  selectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.sm,
    padding: 3,
  },
  segment: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.sm - 2,
  },
  segmentActive: {
    backgroundColor: colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.textPrimary,
  },
  previewContainer: {
    flex: 1,
  },
  tipsContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tipsCard: {
    padding: spacing.md,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  tipsText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
