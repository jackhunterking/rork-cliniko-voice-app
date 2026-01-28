import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '@/constants/colors';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: 'Back',
        headerTintColor: colors.primary,
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { 
          color: colors.textPrimary,
          fontSize: 17,
          fontWeight: '600',
        },
        contentStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Settings',
        }} 
      />
    </Stack>
  );
}
