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
  Check,
  X,
  Crown,
} from 'lucide-react-native';
import { colors, radius, spacing } from '@/constants/colors';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PaywallPreviewMinimalProps {
  onClose?: () => void;
  onSubscribe?: () => void;
  onRestore?: () => void;
}

export function PaywallPreviewMinimal({ onClose, onSubscribe, onRestore }: PaywallPreviewMinimalProps) {
  const handleSubscribe = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSubscribe?.();
  };

  const handleRestore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRestore?.();
  };

  const benefits = [
    'Unlimited voice recording',
    'Real-time transcription',
    'Direct Cliniko sync',
    'Priority support',
  ];

  return (
    <View style={styles.container}>
      {/* Dark overlay background */}
      <LinearGradient
        colors={['#0B1220', '#1A2744', '#0B1220']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Close Button */}
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={22} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        )}

        <View style={styles.content}>
          {/* Hero */}
          <View style={styles.heroSection}>
            {/* Glowing Icon */}
            <View style={styles.iconGlow}>
              <View style={styles.iconContainer}>
                <Crown size={32} color="#FFD700" />
              </View>
            </View>

            <Text style={styles.headline}>Go Pro</Text>
            <Text style={styles.subheadline}>
              Unlock the full power of{'\n'}voice-to-text documentation
            </Text>
          </View>

          {/* Benefits */}
          <View style={styles.benefitsContainer}>
            {benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitRow}>
                <View style={styles.checkCircle}>
                  <Check size={14} color="#FFFFFF" strokeWidth={3} />
                </View>
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>

          {/* Pricing Card */}
          <View style={styles.pricingCard}>
            <View style={styles.trialBanner}>
              <Text style={styles.trialText}>🎉 3 DAYS FREE</Text>
            </View>
            
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Monthly</Text>
              <View style={styles.priceRow}>
                <Text style={styles.currencySymbol}>$</Text>
                <Text style={styles.priceAmount}>14.99</Text>
              </View>
              <Text style={styles.priceNote}>per month after trial</Text>
            </View>
          </View>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <TouchableOpacity 
              style={styles.ctaButton}
              onPress={handleSubscribe}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#007FA3', '#00B4D8']}
                style={styles.ctaGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.ctaText}>Start Free Trial</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.cancelNote}>Cancel anytime. No questions asked.</Text>

            <TouchableOpacity onPress={handleRestore}>
              <Text style={styles.restoreText}>Restore Purchases</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Legal */}
        <View style={styles.legalSection}>
          <TouchableOpacity>
            <Text style={styles.legalLink}>Terms</Text>
          </TouchableOpacity>
          <Text style={styles.legalDivider}>•</Text>
          <TouchableOpacity>
            <Text style={styles.legalLink}>Privacy</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  // Hero
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconGlow: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subheadline: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
  },
  // Benefits
  benefitsContainer: {
    marginBottom: spacing.xl,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  benefitText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  // Pricing Card
  pricingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  trialBanner: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingVertical: 10,
    alignItems: 'center',
  },
  trialText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  priceContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 6,
    marginRight: 2,
  },
  priceAmount: {
    fontSize: 44,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  priceNote: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
  },
  // CTA
  ctaSection: {
    alignItems: 'center',
  },
  ctaButton: {
    width: '100%',
    height: 56,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
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
  cancelNote: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: spacing.md,
  },
  restoreText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  // Legal
  legalSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  legalLink: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  legalDivider: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.3)',
  },
});
