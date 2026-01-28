import { Stack, useRouter } from "expo-router";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { colors, spacing } from "@/constants/colors";

export default function NotFoundScreen() {
  const router = useRouter();

  const handleBackToPatients = () => {
    router.replace('/(tabs)/patients');
  };

  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View style={styles.container}>
        <Text style={styles.title}>Page not found</Text>
        <Text style={styles.subtitle}>The page you are looking for does not exist.</Text>

        <TouchableOpacity style={styles.link} onPress={handleBackToPatients}>
          <Text style={styles.linkText}>Back to patients</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "600" as const,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  link: {
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: 14,
  },
  linkText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
});
