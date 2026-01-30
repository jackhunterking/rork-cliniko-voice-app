import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Mic,
  Zap,
  Send,
  X,
} from 'lucide-react-native';
import { colors, radius, spacing } from '@/constants/colors';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PaywallPreviewProps {
  onClose?: () => void;
  onSubscribe?: () => void;
  onRestore?: () => void;
}

export function PaywallPreview({ onClose, onSubscribe, onRestore }: PaywallPreviewProps) {
  const handleSubscribe = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSubscribe?.();
  };

  const handleRestore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRestore?.();
  };

  const features = [
    { icon: Mic, label: 'Unlimited\nRecording' },
    { icon: Zap, label: 'Real-Time\nTranscription' },
    { icon: Send, label: 'Sync to\nCliniko' },
  ];

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#007FA3', '#005A75']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Close Button */}
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={22} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {/* Main Content */}
        <View style={styles.content}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            {/* Icon */}
            <View style={styles.iconCircle}>
              <Mic size={32} color="#FFFFFF" strokeWidth={1.5} />
            </View>

            {/* Headline */}
            <Text style={styles.headline}>
              Unlock Your{'\n'}Clinical Voice
            </Text>

            {/* Subheadline */}
            <Text style={styles.subheadline}>
              Document patient care with your voice.
            </Text>
          </View>

          {/* Features Row */}
          <View style={styles.featuresRow}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIconCircle}>
                  <feature.icon size={22} color={colors.primary} strokeWidth={2} />
                </View>
                <Text style={styles.featureLabel}>{feature.label}</Text>
              </View>
            ))}
          </View>

          {/* CTA Card - Trial Focused */}
          <View style={styles.ctaCard}>
            {/* Big Trial Text */}
            <Text style={styles.trialHeadline}>Try Free for 3 Days</Text>
            
            {/* Cancel Anytime Badge */}
            <View style={styles.cancelBadge}>
              <Text style={styles.cancelBadgeText}>Cancel anytime</Text>
            </View>

            {/* CTA Button */}
            <TouchableOpacity 
              style={styles.ctaButton} 
              onPress={handleSubscribe}
              activeOpacity={0.9}
            >
              <Text style={styles.ctaText}>Start Free Trial</Text>
            </TouchableOpacity>

            {/* Small Price Note */}
            <Text style={styles.priceNote}>
              $14.99/month after free trial
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleRestore}>
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </TouchableOpacity>
          
          <View style={styles.legalRow}>
            <TouchableOpacity>
              <Text style={styles.legalLink}>Terms</Text>
            </TouchableOpacity>
            <Text style={styles.legalDivider}>•</Text>
            <TouchableOpacity>
              <Text style={styles.legalLink}>Privacy</Text>
            </TouchableOpacity>
          </View>
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
  safeArea: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 12 : 20,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  // Main Content
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  // Hero
  heroSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headline: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 8,
  },
  subheadline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  // Features Row
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 16,
  },
  // CTA Card
  ctaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  trialHeadline: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  cancelBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 20,
  },
  cancelBadgeText: {
    color: '#2E7D32',
    fontSize: 13,
    fontWeight: '600',
  },
  ctaButton: {
    width: '100%',
    height: 54,
    backgroundColor: colors.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  priceNote: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  // Footer
  footer: {
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 8 : 16,
    gap: 12,
  },
  restoreText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legalLink: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  legalDivider: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.3)',
  },
});
