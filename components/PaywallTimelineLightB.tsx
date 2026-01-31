import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Mic,
  Zap,
  Send,
  X,
  Sparkles,
  Clock,
  Check,
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import * as Haptics from 'expo-haptics';

interface PaywallTimelineLightBProps {
  onClose?: () => void;
  onSubscribe?: () => void;
  onRestore?: () => void;
}

export function PaywallTimelineLightB({ onClose, onSubscribe, onRestore }: PaywallTimelineLightBProps) {
  const handleSubscribe = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSubscribe?.();
  };

  const handleRestore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRestore?.();
  };

  const features = [
    { icon: Mic, label: 'Recording' },
    { icon: Zap, label: 'Transcription' },
    { icon: Send, label: 'Cliniko Sync' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0891B2', '#0E7490']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.content}>
          {/* Hero */}
          <View style={styles.heroSection}>
            <View style={styles.iconCircle}>
              <Mic size={24} color="#FFFFFF" strokeWidth={1.5} />
            </View>
            <Text style={styles.headline}>Clinical Voice</Text>
            <Text style={styles.subheadline}>Document with your voice</Text>
          </View>

          {/* Feature Pills */}
          <View style={styles.featurePills}>
            {features.map((feature, index) => (
              <View key={index} style={styles.pill}>
                <feature.icon size={14} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.pillText}>{feature.label}</Text>
              </View>
            ))}
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>3-Day Free Trial</Text>
            
            {/* Simple Steps */}
            <View style={styles.steps}>
              <View style={styles.stepRow}>
                <View style={styles.stepIcon}>
                  <Sparkles size={16} color={colors.primary} />
                </View>
                <View style={styles.stepTextContainer}>
                  <Text style={styles.stepLabel}>Today</Text>
                  <Text style={styles.stepDesc}>Try everything free</Text>
                </View>
              </View>

              <View style={styles.stepDivider} />

              <View style={styles.stepRow}>
                <View style={styles.stepIcon}>
                  <Clock size={16} color={colors.primary} />
                </View>
                <View style={styles.stepTextContainer}>
                  <Text style={styles.stepLabel}>Day 2</Text>
                  <Text style={styles.stepDesc}>Explore at your pace</Text>
                </View>
              </View>

              <View style={styles.stepDivider} />

              <View style={styles.stepRow}>
                <View style={styles.stepIcon}>
                  <Check size={16} color={colors.primary} />
                </View>
                <View style={styles.stepTextContainer}>
                  <Text style={styles.stepLabel}>Day 3</Text>
                  <Text style={styles.stepDesc}>Billing begins</Text>
                </View>
              </View>
            </View>

            {/* CTA */}
            <TouchableOpacity style={styles.ctaButton} onPress={handleSubscribe} activeOpacity={0.9}>
              <Text style={styles.ctaText}>Start Free Trial</Text>
            </TouchableOpacity>
            
            <Text style={styles.priceNote}>$14.99/mo after trial · Cancel anytime</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleRestore}>
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </TouchableOpacity>
          <View style={styles.legalRow}>
            <TouchableOpacity><Text style={styles.legalLink}>Terms</Text></TouchableOpacity>
            <Text style={styles.legalDivider}>·</Text>
            <TouchableOpacity><Text style={styles.legalLink}>Privacy</Text></TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '35%',
  },
  safeArea: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 12 : 20,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 28,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  headline: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subheadline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
  },
  featurePills: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  steps: {
    marginBottom: 24,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 127, 163, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepTextContainer: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  stepDesc: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  stepDivider: {
    width: 2,
    height: 16,
    backgroundColor: '#E5E7EB',
    marginLeft: 15,
    marginVertical: 4,
  },
  ctaButton: {
    width: '100%',
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  priceNote: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 8 : 16,
    gap: 6,
  },
  restoreText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legalLink: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  legalDivider: {
    fontSize: 11,
    color: colors.textTertiary,
  },
});
