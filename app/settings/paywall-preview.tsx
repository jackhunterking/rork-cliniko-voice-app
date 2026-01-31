import React, { useState } from 'react';
import { Alert, View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { PaywallPreview } from '@/components/PaywallPreview';
import { PaywallPreviewMinimal } from '@/components/PaywallPreviewMinimal';
import { PaywallTimelineLight } from '@/components/PaywallTimelineLight';
import { PaywallTimelineDark } from '@/components/PaywallTimelineDark';
import { PaywallTimelineLightA } from '@/components/PaywallTimelineLightA';
import { PaywallTimelineLightB } from '@/components/PaywallTimelineLightB';
import { colors, spacing, radius } from '@/constants/colors';
import { ChevronLeft } from 'lucide-react-native';

type DesignType = 'feature-rich' | 'minimal' | 'timeline-light' | 'timeline-dark' | 'light-a' | 'light-b';

const designs: { id: DesignType; label: string; shortLabel: string }[] = [
  { id: 'light-a', label: 'Light Clean A', shortLabel: 'Clean A' },
  { id: 'light-b', label: 'Light Clean B', shortLabel: 'Clean B' },
  { id: 'timeline-light', label: 'Timeline Light', shortLabel: 'TL Full' },
  { id: 'timeline-dark', label: 'Timeline Dark', shortLabel: 'TL Dark' },
  { id: 'feature-rich', label: 'Feature Rich', shortLabel: 'Feature' },
  { id: 'minimal', label: 'Minimal Dark', shortLabel: 'Minimal' },
];

const designTips: Record<DesignType, { emoji: string; title: string; description: string }> = {
  'light-a': {
    emoji: '✨',
    title: 'Light Clean A',
    description: 'Clean & lean. Vertical timeline with icons. Short descriptions. Great for clarity.',
  },
  'light-b': {
    emoji: '💎',
    title: 'Light Clean B',
    description: 'Minimal & modern. Horizontal feature pills. Compact steps. Premium feel.',
  },
  'timeline-light': {
    emoji: '📅',
    title: 'Timeline Light (Full)',
    description: 'Original timeline with longer descriptions. More detail-oriented approach.',
  },
  'timeline-dark': {
    emoji: '🚀',
    title: 'Timeline Dark',
    description: 'Dark theme with timeline. Premium feel with transparency.',
  },
  'feature-rich': {
    emoji: '📋',
    title: 'Feature-Rich Design',
    description: 'Shows value & features. White card over gradient. Great for first-time users.',
  },
  'minimal': {
    emoji: '🌙',
    title: 'Minimal Dark Design',
    description: 'Premium feel & urgency. Dark immersive background. Great for re-engagement.',
  },
};

export default function PaywallPreviewScreen() {
  const router = useRouter();
  const [currentDesign, setCurrentDesign] = useState<DesignType>('light-a');

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

  const currentTip = designTips[currentDesign];

  const renderPaywall = () => {
    switch (currentDesign) {
      case 'light-a':
        return (
          <PaywallTimelineLightA
            onClose={handleClose}
            onSubscribe={handleSubscribe}
            onRestore={handleRestore}
          />
        );
      case 'light-b':
        return (
          <PaywallTimelineLightB
            onClose={handleClose}
            onSubscribe={handleSubscribe}
            onRestore={handleRestore}
          />
        );
      case 'feature-rich':
        return (
          <PaywallPreview
            onClose={handleClose}
            onSubscribe={handleSubscribe}
            onRestore={handleRestore}
          />
        );
      case 'minimal':
        return (
          <PaywallPreviewMinimal
            onClose={handleClose}
            onSubscribe={handleSubscribe}
            onRestore={handleRestore}
          />
        );
      case 'timeline-light':
        return (
          <PaywallTimelineLight
            onClose={handleClose}
            onSubscribe={handleSubscribe}
            onRestore={handleRestore}
          />
        );
      case 'timeline-dark':
        return (
          <PaywallTimelineDark
            onClose={handleClose}
            onSubscribe={handleSubscribe}
            onRestore={handleRestore}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Design Selector */}
      <SafeAreaView style={styles.selectorContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleClose}>
          <ChevronLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.segmentedScrollContent}
        >
          <View style={styles.segmentedControl}>
            {designs.map((design) => (
              <TouchableOpacity
                key={design.id}
                style={[
                  styles.segment,
                  currentDesign === design.id && styles.segmentActive,
                ]}
                onPress={() => setCurrentDesign(design.id)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    currentDesign === design.id && styles.segmentTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {design.shortLabel}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.placeholder} />
      </SafeAreaView>

      {/* Paywall Preview */}
      <View style={styles.previewContainer}>
        {renderPaywall()}
      </View>

      {/* Design Tips */}
      <SafeAreaView style={styles.tipsContainer}>
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>
            {currentTip.emoji} {currentTip.title}
          </Text>
          <Text style={styles.tipsText}>
            {currentTip.description}
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
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 36,
  },
  segmentedScrollContent: {
    paddingHorizontal: 4,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.sm,
    padding: 3,
  },
  segment: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radius.sm - 2,
    minWidth: 56,
    alignItems: 'center',
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
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
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
