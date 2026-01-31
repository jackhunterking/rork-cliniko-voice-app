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
  Sparkles,
  ThumbsUp,
  Rocket,
} from 'lucide-react-native';
import { colors, radius, spacing } from '@/constants/colors';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PaywallTimelineDarkProps {
  onClose?: () => void;
  onSubscribe?: () => void;
  onRestore?: () => void;
}

export function PaywallTimelineDark({ onClose, onSubscribe, onRestore }: PaywallTimelineDarkProps) {
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
      icon: Sparkles,
      title: 'Today',
      description: 'Unlock everything free. Start documenting with your voice right away.',
      iconBg: '#00B4D8',
      accentColor: '#00B4D8',
    },
    {
      icon: ThumbsUp,
      title: 'Day 2',
      description: 'See if it fits your workflow. We built this for clinicians like you.',
      iconBg: '#00B4D8',
      accentColor: '#00B4D8',
    },
    {
      icon: Rocket,
      title: 'Day 3',
      description: 'Subscription activates. Cancel anytime before if it\'s not for you.',
      iconBg: '#00B4D8',
      accentColor: '#00B4D8',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Dark gradient background */}
      <LinearGradient
        colors={['#0A1628', '#132744', '#0A1628']}
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

        {/* Main Content */}
        <View style={styles.content}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.iconGlow}>
              <View style={styles.iconCircle}>
                <Mic size={28} color="#00B4D8" strokeWidth={1.5} />
              </View>
            </View>
            <Text style={styles.headline}>Unlock Your{'\n'}Clinical Voice</Text>
            <Text style={styles.subheadline}>Document patient care with your voice.</Text>
          </View>

          {/* Features Row */}
          <View style={styles.featuresRow}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIconCircle}>
                  <feature.icon size={20} color="#00B4D8" strokeWidth={2} />
                </View>
                <Text style={styles.featureLabel}>{feature.label}</Text>
              </View>
            ))}
          </View>

          {/* Timeline Card */}
          <View style={styles.timelineCard}>
            <Text style={styles.cardTitle}>Your Free Trial Journey</Text>
            
            {/* Timeline */}
            <View style={styles.timeline}>
              {timelineSteps.map((step, index) => (
                <View key={index} style={styles.timelineStep}>
                  {/* Icon and Line */}
                  <View style={styles.timelineIconColumn}>
                    <View style={[styles.timelineIconCircle, { backgroundColor: step.iconBg }]}>
                      <step.icon size={16} color="#FFFFFF" strokeWidth={2.5} />
                    </View>
                    {index < timelineSteps.length - 1 && (
                      <View style={styles.timelineLine} />
                    )}
                  </View>
                  
                  {/* Content */}
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineTitle, { color: step.accentColor }]}>
                      {step.title}
                    </Text>
                    <Text style={styles.timelineDescription}>{step.description}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Price Badge */}
            <View style={styles.priceBadge}>
              <Text style={styles.priceText}>$14.99/month</Text>
              <Text style={styles.priceSubtext}>after trial ends</Text>
            </View>

            {/* CTA Button */}
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  // Hero Section
  heroSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconGlow: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 180, 216, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 180, 216, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 8,
  },
  subheadline: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  // Features Row
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 180, 216, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 180, 216, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  featureLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 14,
  },
  // Timeline Card
  timelineCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 18,
  },
  // Timeline
  timeline: {
    marginBottom: 16,
  },
  timelineStep: {
    flexDirection: 'row',
    minHeight: 64,
  },
  timelineIconColumn: {
    alignItems: 'center',
    width: 32,
    marginRight: 14,
  },
  timelineIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: 'rgba(0, 180, 216, 0.3)',
    marginVertical: 6,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 12,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  timelineDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 18,
  },
  // Price Badge
  priceBadge: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 180, 216, 0.1)',
    borderRadius: 12,
    alignSelf: 'center',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00B4D8',
  },
  priceSubtext: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  // CTA
  ctaButton: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#00B4D8',
    shadowColor: '#00B4D8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Footer
  footer: {
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 8 : 16,
    gap: 8,
  },
  restoreText: {
    fontSize: 14,
    color: '#00B4D8',
    fontWeight: '500',
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
