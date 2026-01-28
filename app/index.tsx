import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';

export default function IndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to splash screen immediately
    const timeout = setTimeout(() => {
      console.log('Redirecting to splash screen');
      router.replace('/splash');
    }, 50);
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
