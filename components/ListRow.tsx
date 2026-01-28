import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors, spacing } from '@/constants/colors';

interface ListRowProps {
  title: string;
  subtitle?: string;
  value?: string;
  onPress: () => void;
  showChevron?: boolean;
}

export function ListRow({
  title,
  subtitle,
  value,
  onPress,
  showChevron = true,
}: ListRowProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        )}
      </View>
      <View style={styles.right}>
        {value && <Text style={styles.value}>{value}</Text>}
        {showChevron && (
          <ChevronRight size={20} color={colors.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    color: colors.textPrimary,
    fontWeight: '400' as const,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  value: {
    fontSize: 15,
    color: colors.textSecondary,
  },
});
