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
  Unlock,
  Heart,
  CheckCircle,
} from 'lucide-react-native';
import { colors, radius, spacing } from '@/constants/colors';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PaywallTimelineLightProps {
  onClose?: () => void;
  onSubscribe?: () => void;
  onRestore?: () => void;
}

export function PaywallTimelineLight({ onClose, onSubscribe, onRestore }: PaywallTimelineLightProps) {
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
    {
      icon: Unlock,
      title: 'Today',
      description: 'Start enjoying full access to all features and try everything for free.',
      color: '#007FA3',
    },
    {
      icon: Heart,
      title: 'Day 2',
      description: 'Take your time to explore. We hope you love it as much as we do.',
      color: '#007FA3',
    },
    {
      icon: CheckCircle,
      title: 'Day 3',
      description: 'Your subscription begins. Cancel anytime before — no questions asked.',
      color: '#007FA3',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#007FA3', '#005A75']}
        style={styles.headerGradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
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
          {/* Hero Section - Compact */}
          <View style={styles.heroSection}>
            <View style={styles.iconCircle}>
              <Mic size={28} color="#FFFFFF" strokeWidth={1.5} />
            </View>
            <Text style={styles.headline}>Unlock Your{'\n'}Clinical Voice</Text>
            <Text style={styles.subheadline}>Document patient care with your voice.</Text>
          </View>

          {/* Features Row - Compact */}
          <View style={styles.featuresRow}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIconCircle}>
                  <feature.icon size={20} color={colors.primary} strokeWidth={2} />
                </View>
                <Text style={styles.featureLabel}>{feature.label}</Text>
              </View>
            ))}
          </View>

          {/* White Card with Timeline */}
          <View style={styles.timelineCard}>
            <Text style={styles.cardTitle}>How your free trial works</Text>
            
            {/* Timeline */}
            <View style={styles.timeline}>
              {timelineSteps.map((step, index) => (
                <View key={index} style={styles.timelineStep}>
                  {/* Icon and Line */}
                  <View style={styles.timelineIconColumn}>
                    <View style={[styles.timelineIconCircle, { backgroundColor: step.color }]}>
                      <step.icon size={16} color="#FFFFFF" strokeWidth={2.5} />
                    </View>
                    {index < timelineSteps.length - 1 && (
                      <View style={styles.timelineLine} />
                    )}
                  </View>
                  
                  {/* Content */}
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineTitle, { color: step.color }]}>{step.title}</Text>
                    <Text style={styles.timelineDescription}>{step.description}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* CTA Button */}
            <TouchableOpacity 
              style={styles.ctaButton} 
              onPress={handleSubscribe}
              activeOpacity={0.9}
            >
              <Text style={styles.ctaText}>Start Free Trial</Text>
            </TouchableOpacity>

            {/* Price Note */}
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
    backgroundColor: '#F5F7FA',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '42%',
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
  },
  // Hero Section - More Compact
  heroSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  headline: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 6,
  },
  subheadline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  // Features Row - Compact
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  featureLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 14,
  },
  // Timeline Card
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  // Timeline
  timeline: {
    marginBottom: 20,
  },
  timelineStep: {
    flexDirection: 'row',
    minHeight: 70,
  },
  timelineIconColumn: {
    alignItems: 'center',
    width: 36,
    marginRight: 14,
  },
  timelineIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#E0E0E0',
    marginVertical: 6,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 16,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  timelineDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  // CTA
  ctaButton: {
    width: '100%',
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  priceNote: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // Footer
  footer: {
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 8 : 16,
    gap: 8,
  },
  restoreText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legalLink: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  legalDivider: {
    fontSize: 12,
    color: colors.textTertiary,
  },
});
