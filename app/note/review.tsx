import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SecondaryButton } from '@/components/SecondaryButton';
import { colors, spacing, radius } from '@/constants/colors';
import { useNote } from '@/context/NoteContext';

export default function NoteReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { noteData, filledFieldsCount } = useNote();
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());

  const toggleField = useCallback((fieldId: string) => {
    setExpandedFields(prev => {
      const next = new Set(prev);
      if (next.has(fieldId)) {
        next.delete(fieldId);
      } else {
        next.add(fieldId);
      }
      return next;
    });
  }, []);

  const handleSaveDraft = () => {
    console.log('Saving note as draft');
    router.push('/note/success?type=draft');
  };

  const handleSaveFinal = () => {
    console.log('Saving note as final');
    router.push('/note/success?type=final');
  };

  if (!noteData.template || !noteData.patient) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Review' }} />
        <View style={styles.errorState}>
          <Text style={styles.errorText}>No note to review</Text>
        </View>
      </View>
    );
  }

  const emptyFields = noteData.fieldValues.filter(f => !f.value.trim());
  const hasEmptyFields = emptyFields.length > 0;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Review',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.lg + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.patientName}>{noteData.patient.name}</Text>
          <Text style={styles.templateName}>{noteData.template.name}</Text>
          {noteData.appointment && (
            <Text style={styles.appointmentLabel}>{noteData.appointment.label}</Text>
          )}
        </View>

        {hasEmptyFields && (
          <View style={styles.warningBanner}>
            <AlertCircle size={18} color={colors.error} />
            <Text style={styles.warningText}>
              {emptyFields.length} field{emptyFields.length > 1 ? 's' : ''} empty
            </Text>
          </View>
        )}

        <View style={styles.fieldsContainer}>
          {noteData.fieldValues.map(fieldValue => {
            const isExpanded = expandedFields.has(fieldValue.fieldId);
            const isEmpty = !fieldValue.value.trim();
            const preview = fieldValue.value.trim()
              ? fieldValue.value.substring(0, 100) + (fieldValue.value.length > 100 ? '...' : '')
              : 'No content';

            return (
              <TouchableOpacity
                key={fieldValue.fieldId}
                style={[styles.fieldCard, isEmpty && styles.fieldCardEmpty]}
                onPress={() => toggleField(fieldValue.fieldId)}
                activeOpacity={0.7}
              >
                <View style={styles.fieldHeader}>
                  <Text style={styles.fieldLabel}>{fieldValue.label}</Text>
                  {isExpanded ? (
                    <ChevronUp size={18} color={colors.textSecondary} />
                  ) : (
                    <ChevronDown size={18} color={colors.textSecondary} />
                  )}
                </View>
                <Text
                  style={[styles.fieldContent, isEmpty && styles.fieldContentEmpty]}
                  numberOfLines={isExpanded ? undefined : 3}
                >
                  {isExpanded ? fieldValue.value || 'No content' : preview}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {filledFieldsCount} of {noteData.fieldValues.length} fields completed
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.buttonRow}>
          <SecondaryButton
            title="Save as draft"
            onPress={handleSaveDraft}
            style={styles.buttonHalf}
          />
          <PrimaryButton
            title="Save as final"
            onPress={handleSaveFinal}
            style={styles.buttonHalf}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  templateName: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 4,
  },
  appointmentLabel: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 4,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  warningText: {
    fontSize: 14,
    color: colors.error,
    fontWeight: '500' as const,
  },
  fieldsContainer: {
    gap: spacing.sm,
  },
  fieldCard: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fieldCardEmpty: {
    borderColor: colors.error,
    borderStyle: 'dashed' as const,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.primary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  fieldContent: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  fieldContentEmpty: {
    fontStyle: 'italic' as const,
    color: colors.textSecondary,
  },
  summary: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  buttonHalf: {
    flex: 1,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
