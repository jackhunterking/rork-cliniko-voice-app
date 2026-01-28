import { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Mic } from 'lucide-react-native';
import { colors } from '@/constants/colors';

/**
 * Splash screen component - displays app branding during load.
 * Navigation is handled by AuthGuard in _layout.tsx, not here.
 */
export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.iconContainer}>
          <Mic size={48} color="#FFFFFF" strokeWidth={2} />
        </View>
        <Text style={styles.appName}>Cliniko Voice</Text>
        <Text style={styles.subtitle}>Dictate treatment notes.</Text>
      </Animated.View>

      <Animated.View style={[styles.loaderContainer, { opacity: fadeAnim }]}>
        <ActivityIndicator size="small" color={colors.textSecondary} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 80,
  },
});
