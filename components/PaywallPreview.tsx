import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Mic,
  Clock,
  FileText,
  Zap,
  Shield,
  Check,
  X,
  Sparkles,
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
    {
      icon: Mic,
      title: 'Unlimited Recording',
      description: 'Record as much as you need, no daily limits',
    },
    {
      icon: Zap,
      title: 'Real-Time Transcription',
      description: 'See your words appear instantly as you speak',
    },
    {
      icon: FileText,
      title: 'Cliniko Integration',
      description: 'Send notes directly to patient records',
    },
    {
      icon: Clock,
      title: 'Save 2+ Hours Daily',
      description: 'Spend less time typing, more time with patients',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#007FA3', '#005F7A', '#003D4D']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Close Button */}
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            {/* Trial Badge */}
            <View style={styles.trialBadge}>
              <Sparkles size={14} color="#FFD700" />
              <Text style={styles.trialBadgeText}>3 DAYS FREE</Text>
            </View>

            {/* Icon */}
            <View style={styles.heroIcon}>
              <Mic size={48} color="#FFFFFF" strokeWidth={1.5} />
            </View>

            {/* Headline */}
            <Text style={styles.headline}>
              Unlock Your{'\n'}Clinical Voice
            </Text>

            {/* Subheadline */}
            <Text style={styles.subheadline}>
              Transform how you document patient care.{'\n'}
              Speak naturally, save hours every day.
            </Text>
          </View>

          {/* Features Card */}
          <View style={styles.featuresCard}>
            <Text style={styles.featuresTitle}>Everything you need</Text>
            
            {features.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <View style={styles.featureIconContainer}>
                  <feature.icon size={20} color={colors.primary} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
                <Check size={18} color={colors.success} />
              </View>
            ))}
          </View>

          {/* Pricing Section */}
          <View style={styles.pricingSection}>
            {/* Price Display */}
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Then just</Text>
              <View style={styles.priceRow}>
                <Text style={styles.currencySymbol}>$</Text>
                <Text style={styles.priceAmount}>14</Text>
                <Text style={styles.priceCents}>.99</Text>
                <Text style={styles.pricePeriod}>/month</Text>
              </View>
              <Text style={styles.priceNote}>Cancel anytime. No commitment.</Text>
            </View>

            {/* CTA Button */}
            <TouchableOpacity 
              style={styles.ctaButton} 
              onPress={handleSubscribe}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#007FA3', '#00A3CC']}
                style={styles.ctaGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.ctaText}>Start Free Trial</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Trial Reminder */}
            <View style={styles.trialReminder}>
              <Shield size={16} color={colors.textSecondary} />
              <Text style={styles.trialReminderText}>
                Free for 3 days, then $14.99/month
              </Text>
            </View>

            {/* Restore Purchases */}
            <TouchableOpacity 
              style={styles.restoreButton} 
              onPress={handleRestore}
            >
              <Text style={styles.restoreText}>Restore Purchases</Text>
            </TouchableOpacity>
          </View>

          {/* Trust Section */}
          <View style={styles.trustSection}>
            <View style={styles.trustItem}>
              <Shield size={16} color={colors.textSecondary} />
              <Text style={styles.trustText}>Secure & Private</Text>
            </View>
            <View style={styles.trustDivider} />
            <View style={styles.trustItem}>
              <Text style={styles.trustText}>HIPAA Compliant</Text>
            </View>
          </View>

          {/* Legal Links */}
          <View style={styles.legalSection}>
            <TouchableOpacity>
              <Text style={styles.legalLink}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={styles.legalDivider}>•</Text>
            <TouchableOpacity>
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 380,
  },
  safeArea: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  trialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    marginBottom: spacing.lg,
  },
  trialBadgeText: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  headline: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: spacing.md,
  },
  subheadline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 24,
  },
  // Features Card
  featuresCard: {
    backgroundColor: colors.background,
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  // Pricing Section
  pricingSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    alignItems: 'center',
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 8,
  },
  priceAmount: {
    fontSize: 56,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 60,
  },
  priceCents: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 8,
  },
  pricePeriod: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    marginLeft: 4,
  },
  priceNote: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  // CTA Button
  ctaButton: {
    width: '100%',
    height: 56,
    borderRadius: radius.md,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  trialReminder: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: 6,
  },
  trialReminderText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  restoreButton: {
    marginTop: spacing.lg,
    padding: spacing.sm,
  },
  restoreText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  // Trust Section
  trustSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  trustDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.border,
  },
  // Legal Section
  legalSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  legalLink: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  legalDivider: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
