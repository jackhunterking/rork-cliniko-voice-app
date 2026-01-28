import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '@/constants/colors';

export default function QuickLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: 'Back',
        headerTintColor: colors.primary,
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.textPrimary },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Quick' }} />
    </Stack>
  );
}
