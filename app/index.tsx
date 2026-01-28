import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

/**
 * Root index screen - acts as initial entry point.
 * The AuthGuard in _layout.tsx handles all routing logic.
 * This just shows a brief loading state while auth is being checked.
 */
export default function Index() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
