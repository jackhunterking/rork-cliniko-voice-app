import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';

// Mock auth state flags - default to unauthenticated
const isAuthed = false;
const isClinikoConnected = false;

export default function IndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    const redirect = () => {
      if (!isAuthed) {
        console.log('User not authenticated, redirecting to auth/welcome');
        router.replace('/(tabs)/home');
      } else if (!isClinikoConnected) {
        console.log('User authenticated but not connected to Cliniko');
        router.replace('/(tabs)/home');
      } else {
        console.log('User authenticated and connected, redirecting to home');
        router.replace('/(tabs)/home');
      }
    };

    // Small delay to ensure router is ready
    const timeout = setTimeout(redirect, 100);
    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
