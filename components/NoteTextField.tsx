import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Mic } from 'lucide-react-native';
import { colors, radius, spacing } from '@/constants/colors';

interface NoteTextFieldProps {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (text: string) => void;
  onMicPress: () => void;
  isRecording?: boolean;
}

export function NoteTextField({
  label,
  value,
  placeholder,
  onChangeText,
  onMicPress,
  isRecording = false,
}: NoteTextFieldProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          onPress={onMicPress}
          style={[styles.micButton, isRecording && styles.micButtonActive]}
          activeOpacity={0.7}
        >
          <Mic
            size={18}
            color={isRecording ? '#FFFFFF' : colors.primary}
          />
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        multiline
        textAlignVertical="top"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  micButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonActive: {
    backgroundColor: colors.primary,
  },
  input: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    minHeight: 100,
  },
});
