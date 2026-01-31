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
  Gift,
  Heart,
  CreditCard,
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import * as Haptics from 'expo-haptics';

interface PaywallTimelineLightAProps {
  onClose?: () => void;
  onSubscribe?: () => void;
  onRestore?: () => void;
}

export function PaywallTimelineLightA({ onClose, onSubscribe, onRestore }: PaywallTimelineLightAProps) {
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

  const timelineSteps = [
    { icon: Gift, title: 'Today', description: 'Full access, completely free', color: '#007FA3' },
    { icon: Heart, title: 'Day 2', description: 'See if you love it', color: '#007FA3' },
    { icon: CreditCard, title: 'Day 3', description: 'Subscription starts', color: '#007FA3' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#007FA3', '#005A75']}
        style={styles.headerGradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
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
              <Mic size={26} color="#FFFFFF" strokeWidth={1.5} />
            </View>
            <Text style={styles.headline}>Unlock Your{'\n'}Clinical Voice</Text>
          </View>

          {/* Features */}
          <View style={styles.featuresRow}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIconCircle}>
                  <feature.icon size={18} color={colors.primary} strokeWidth={2} />
                </View>
                <Text style={styles.featureLabel}>{feature.label}</Text>
              </View>
            ))}
          </View>

          {/* Timeline Card */}
          <View style={styles.timelineCard}>
            {/* Timeline */}
            <View style={styles.timeline}>
              {timelineSteps.map((step, index) => (
                <View key={index} style={styles.timelineStep}>
                  <View style={styles.timelineIconColumn}>
                    <View style={[styles.timelineIconCircle, { backgroundColor: step.color }]}>
                      <step.icon size={14} color="#FFFFFF" strokeWidth={2.5} />
                    </View>
                    {index < timelineSteps.length - 1 && <View style={styles.timelineLine} />}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineTitle, { color: step.color }]}>{step.title}</Text>
                    <Text style={styles.timelineDescription}>{step.description}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* CTA */}
            <TouchableOpacity style={styles.ctaButton} onPress={handleSubscribe} activeOpacity={0.9}>
              <Text style={styles.ctaText}>Start Free Trial</Text>
            </TouchableOpacity>
            <Text style={styles.priceNote}>Then $14.99/month · Cancel anytime</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleRestore}>
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </TouchableOpacity>
          <View style={styles.legalRow}>
            <TouchableOpacity><Text style={styles.legalLink}>Terms</Text></TouchableOpacity>
            <Text style={styles.legalDivider}>•</Text>
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
    backgroundColor: '#F5F7FA',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '38%',
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
    paddingTop: Platform.OS === 'ios' ? 16 : 24,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headline: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 30,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  featureLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 13,
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  timeline: {
    marginBottom: 24,
  },
  timelineStep: {
    flexDirection: 'row',
    minHeight: 52,
  },
  timelineIconColumn: {
    alignItems: 'center',
    width: 28,
    marginRight: 12,
  },
  timelineIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#E8E8E8',
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 10,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  timelineDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 1,
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
