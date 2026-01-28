import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ChevronDown, ChevronUp, AlertCircle, Mic, MicOff, CheckCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SecondaryButton } from '@/components/SecondaryButton';
import { colors, spacing, radius } from '@/constants/colors';
import { useNote } from '@/context/NoteContext';
import { useCreateTreatmentNote, isClinikoAuthError, isClinikoNetworkError } from '@/hooks/useCliniko';
import { CreateTreatmentNotePayload } from '@/services/cliniko';

export default function NoteReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { noteData, filledFieldsCount, toClinikoNoteContent, fieldsBySection, resetNote } = useNote();
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(
    // Expand all sections by default
    noteData.template?.content.sections.map(s => s.name) ?? []
  ));

  // Mutation for creating treatment note
  const createNoteMutation = useCreateTreatmentNote();

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

  const toggleSection = useCallback((sectionName: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionName)) {
        next.delete(sectionName);
      } else {
        next.add(sectionName);
      }
      return next;
    });
  }, []);

  const handleSave = async (asDraft: boolean) => {
    if (!noteData.template || !noteData.patient) {
      Alert.alert('Error', 'Missing template or patient information.');
      return;
    }

    const content = toClinikoNoteContent();
    if (!content) {
      Alert.alert('Error', 'Failed to prepare note content.');
      return;
    }

    const payload: CreateTreatmentNotePayload = {
      patient_id: noteData.patient.id,
      treatment_note_template_id: noteData.template.id,
      content,
      draft: asDraft,
      // Add attendee_id or booking_id if we have appointment info
      ...(noteData.clinikoAppointment?.attendee?.links?.self && {
        attendee_id: noteData.clinikoAppointment.id, // This would need proper parsing from the link
      }),
    };

    try {
      const result = await createNoteMutation.mutateAsync(payload);
      console.log('Treatment note created:', result.id);
      
      // Navigate to success screen
      router.push(`/note/success?type=${asDraft ? 'draft' : 'final'}&noteId=${result.id}`);
    } catch (error) {
      console.error('Failed to create treatment note:', error);
      
      let errorMessage = 'Failed to save the treatment note. Please try again.';
      
      if (isClinikoAuthError(error)) {
        errorMessage = 'Authentication error. Please check your Cliniko API key in settings.';
      } else if (isClinikoNetworkError(error)) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      Alert.alert('Save Failed', errorMessage, [
        { text: 'OK' },
        { text: 'Go to Settings', onPress: () => router.push('/settings/api-key') },
      ]);
    }
  };

  const handleSaveDraft = () => {
    Alert.alert(
      'Save as Draft',
      'This will save the note to Cliniko as a draft. You can complete it later.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Save Draft', onPress: () => handleSave(true) },
      ]
    );
  };

  const handleSaveFinal = () => {
    const emptyVoiceFillable = noteData.fieldValues.filter(
      f => f.isVoiceFillable && !f.value.trim()
    );

    if (emptyVoiceFillable.length > 0) {
      Alert.alert(
        'Empty Fields',
        `You have ${emptyVoiceFillable.length} voice-fillable field(s) that are empty. Do you want to save anyway?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save Anyway', onPress: () => handleSave(false) },
        ]
      );
    } else {
      handleSave(false);
    }
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

  const voiceFillableEmpty = noteData.fieldValues.filter(f => f.isVoiceFillable && !f.value.trim());
  const hasEmptyVoiceFillable = voiceFillableEmpty.length > 0;
  const isSaving = createNoteMutation.isPending;

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

        {hasEmptyVoiceFillable && (
          <View style={styles.warningBanner}>
            <AlertCircle size={18} color={colors.error} />
            <Text style={styles.warningText}>
              {voiceFillableEmpty.length} voice-fillable field{voiceFillableEmpty.length > 1 ? 's' : ''} empty
            </Text>
          </View>
        )}

        {/* Render by sections */}
        <View style={styles.sectionsContainer}>
          {fieldsBySection.map((section, sectionIndex) => {
            const isExpanded = expandedSections.has(section.name);
            const filledInSection = section.fields.filter(f => f.value.trim()).length;
            
            return (
              <View key={`section-${sectionIndex}`} style={styles.sectionCard}>
                <TouchableOpacity
                  style={styles.sectionHeader}
                  onPress={() => toggleSection(section.name)}
                  activeOpacity={0.7}
                >
                  <View style={styles.sectionHeaderLeft}>
                    <Text style={styles.sectionName}>{section.name}</Text>
                    <Text style={styles.sectionCount}>
                      {filledInSection}/{section.fields.length} filled
                    </Text>
                  </View>
                  {isExpanded ? (
                    <ChevronUp size={20} color={colors.textSecondary} />
                  ) : (
                    <ChevronDown size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.fieldsList}>
                    {section.fields.map((fieldValue) => {
                      const isFieldExpanded = expandedFields.has(fieldValue.fieldId);
                      const isEmpty = !fieldValue.value.trim();
                      const preview = fieldValue.value.trim()
                        ? fieldValue.value.substring(0, 100) + (fieldValue.value.length > 100 ? '...' : '')
                        : 'No content';

                      return (
                        <TouchableOpacity
                          key={fieldValue.fieldId}
                          style={[
                            styles.fieldCard,
                            isEmpty && fieldValue.isVoiceFillable && styles.fieldCardEmpty,
                          ]}
                          onPress={() => toggleField(fieldValue.fieldId)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.fieldHeader}>
                            <View style={styles.fieldLabelRow}>
                              {fieldValue.isVoiceFillable ? (
                                <Mic size={14} color={isEmpty ? colors.error : colors.success} />
                              ) : (
                                <MicOff size={14} color={colors.textSecondary} />
                              )}
                              <Text style={styles.fieldLabel}>{fieldValue.label}</Text>
                            </View>
                            {!isEmpty && <CheckCircle size={16} color={colors.success} />}
                          </View>
                          <Text
                            style={[styles.fieldContent, isEmpty && styles.fieldContentEmpty]}
                            numberOfLines={isFieldExpanded ? undefined : 3}
                          >
                            {isFieldExpanded ? fieldValue.value || 'No content' : preview}
                          </Text>
                          {!fieldValue.isVoiceFillable && (
                            <Text style={styles.fieldTypeHint}>
                              {fieldValue.questionType} (manual entry only)
                            </Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
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
        {isSaving && (
          <View style={styles.savingIndicator}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.savingText}>Saving to Cliniko...</Text>
          </View>
        )}
        <View style={styles.buttonRow}>
          <SecondaryButton
            title="Save as draft"
            onPress={handleSaveDraft}
            style={styles.buttonHalf}
            disabled={isSaving}
          />
          <PrimaryButton
            title="Save as final"
            onPress={handleSaveFinal}
            style={styles.buttonHalf}
            disabled={isSaving}
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
  sectionsContainer: {
    gap: spacing.md,
  },
  sectionCard: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
  },
  sectionHeaderLeft: {
    flex: 1,
  },
  sectionName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  sectionCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  fieldsList: {
    padding: spacing.sm,
    gap: spacing.sm,
  },
  fieldCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  fieldCardEmpty: {
    borderWidth: 1,
    borderColor: colors.error,
    borderStyle: 'dashed' as const,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textPrimary,
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
  fieldTypeHint: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontStyle: 'italic' as const,
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
  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  savingText: {
    fontSize: 14,
    color: colors.textSecondary,
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
