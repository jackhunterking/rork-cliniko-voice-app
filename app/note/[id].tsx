import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { FileText, AlertCircle, CheckCircle, Clock, Edit3 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Card } from '@/components/Card';
import { colors, spacing, radius } from '@/constants/colors';
import { useTreatmentNote, useClinikoTemplate, useClinikoPatient, isClinikoAuthError } from '@/hooks/useCliniko';
import { useNote, Patient } from '@/context/NoteContext';

/**
 * Format date for display
 */
function formatDate(datetime: string): string {
  const date = new Date(datetime);
  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Extract template ID from a Cliniko HATEOAS link
 * Format: https://api.au1.cliniko.com/v1/treatment_note_templates/123456
 */
function extractTemplateIdFromLink(link: string | undefined): string | null {
  if (!link) return null;
  const match = link.match(/\/treatment_note_templates\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Extract patient ID from a Cliniko HATEOAS link
 * Format: https://api.au1.cliniko.com/v1/patients/123456
 */
function extractPatientIdFromLink(link: string | undefined): string | null {
  if (!link) return null;
  const match = link.match(/\/patients\/(\d+)/);
  return match ? match[1] : null;
}

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { loadExistingNote } = useNote();
  
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);

  // Fetch the treatment note by ID
  const {
    data: note,
    isLoading,
    isError,
    error,
    refetch,
  } = useTreatmentNote(id ?? '');

  // Extract template ID and patient ID from note's links
  const templateId = extractTemplateIdFromLink(note?.treatment_note_template?.links?.self);
  const patientIdFromNote = extractPatientIdFromLink(note?.patient?.links?.self);
  
  // Fetch the template (needed to populate edit fields properly)
  const {
    data: template,
    isLoading: isLoadingTemplate,
  } = useClinikoTemplate(templateId ?? undefined);

  // Fetch patient details (needed for editor context)
  const {
    data: patientData,
  } = useClinikoPatient(patientIdFromNote ?? '');

  /**
   * Handle edit button press - load note into context and navigate to editor
   */
  const handleEdit = useCallback(async () => {
    if (!note || !template) {
      Alert.alert('Error', 'Unable to load note data for editing.');
      return;
    }

    setIsLoadingEdit(true);

    try {
      // Use the patient ID we already extracted
      if (!patientIdFromNote) {
        Alert.alert('Error', 'Unable to determine patient for this note.');
        setIsLoadingEdit(false);
        return;
      }

      // Create patient object using fetched data if available
      const patient: Patient = {
        id: patientIdFromNote,
        name: patientData 
          ? `${patientData.first_name} ${patientData.last_name}`.trim() 
          : `Patient ${patientIdFromNote}`,
        email: patientData?.email ?? '',
        phone: patientData?.phone_numbers?.[0]?.number ?? '',
        dateOfBirth: patientData?.date_of_birth ?? '',
        lastAppointment: null,
      };

      // Load the note into the NoteContext
      loadExistingNote(note, template, patient);

      // Navigate to the editor
      router.push('/note/editor');
    } catch (err) {
      console.error('Error preparing note for edit:', err);
      Alert.alert('Error', 'Failed to prepare note for editing.');
    } finally {
      setIsLoadingEdit(false);
    }
  }, [note, template, patientIdFromNote, patientData, loadExistingNote, router]);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Treatment Note', headerBackTitle: 'Back' }} />
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading note...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (isError) {
    const isAuthError = isClinikoAuthError(error);
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Treatment Note', headerBackTitle: 'Back' }} />
        <View style={styles.errorState}>
          <AlertCircle size={48} color={colors.error} />
          <Text style={styles.errorTitle}>
            {isAuthError ? 'Authentication Error' : 'Failed to Load Note'}
          </Text>
          <Text style={styles.errorMessage}>
            {isAuthError
              ? 'Please check your Cliniko API key in settings.'
              : error?.message || 'An unexpected error occurred.'}
          </Text>
          <PrimaryButton title="Try Again" onPress={() => refetch()} />
        </View>
      </View>
    );
  }

  // Note not found
  if (!note) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Treatment Note', headerBackTitle: 'Back' }} />
        <View style={styles.errorState}>
          <FileText size={48} color={colors.textSecondary} />
          <Text style={styles.errorText}>Note not found</Text>
        </View>
      </View>
    );
  }

  // Get note title from first section name or use default
  const noteTitle = note.content?.sections?.[0]?.name || 'Treatment Note';
  const isDraft = note.draft === true;

  // Check if edit is available (draft note with template loaded)
  const canEdit = isDraft && template && !isLoadingTemplate;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Treatment Note',
          headerBackTitle: 'Back',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerRight: () => canEdit ? (
            <TouchableOpacity
              onPress={handleEdit}
              style={styles.editButton}
              disabled={isLoadingEdit}
            >
              {isLoadingEdit ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <View style={styles.editButtonContent}>
                  <Edit3 size={20} color={colors.primary} />
                  <Text style={styles.editButtonText}>Edit</Text>
                </View>
              )}
            </TouchableOpacity>
          ) : null,
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Note Header */}
        <Card style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.headerTitleContainer}>
              <FileText size={20} color={colors.primary} />
              <Text style={styles.headerTitle}>{noteTitle}</Text>
            </View>
            <View style={[styles.statusBadge, isDraft ? styles.draftBadge : styles.finalizedBadge]}>
              {isDraft ? (
                <Clock size={12} color={colors.textSecondary} />
              ) : (
                <CheckCircle size={12} color={colors.success} />
              )}
              <Text style={[styles.statusText, isDraft ? styles.draftText : styles.finalizedText]}>
                {isDraft ? 'DRAFT' : 'FINALIZED'}
              </Text>
            </View>
          </View>
          
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Created</Text>
            <Text style={styles.metaValue}>{formatDate(note.created_at)}</Text>
          </View>
          
          {note.updated_at && note.updated_at !== note.created_at && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Updated</Text>
              <Text style={styles.metaValue}>{formatDate(note.updated_at)}</Text>
            </View>
          )}
        </Card>

        {/* Note Content - Sections */}
        {note.content?.sections?.map((section, sectionIndex) => (
          <Card key={`section-${sectionIndex}`} style={styles.sectionCard}>
            {section.name && (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.name}</Text>
              </View>
            )}
            
            {section.description && (
              <Text style={styles.sectionDescription}>{section.description}</Text>
            )}

            {section.questions?.map((question, questionIndex) => {
              // Handle both object format and string format
              const isObjectFormat = typeof question === 'object' && question !== null;
              const questionName = isObjectFormat ? (question as any).name : null;
              const answerValue = isObjectFormat ? (question as any).answer : question;

              // Skip empty questions/answers
              if (!answerValue && !questionName) return null;

              return (
                <View key={`q-${sectionIndex}-${questionIndex}`} style={styles.questionContainer}>
                  {questionName && (
                    <Text style={styles.questionLabel}>{questionName}</Text>
                  )}
                  <Text style={styles.answerText}>
                    {answerValue || 'No answer provided'}
                  </Text>
                </View>
              );
            })}

            {(!section.questions || section.questions.length === 0) && (
              <Text style={styles.emptyText}>No content in this section</Text>
            )}
          </Card>
        ))}

        {(!note.content?.sections || note.content.sections.length === 0) && (
          <Card style={styles.sectionCard}>
            <Text style={styles.emptyText}>This note has no content sections.</Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  editButton: {
    padding: spacing.xs,
    marginRight: spacing.xs,
  },
  editButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  headerCard: {
    marginBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  draftBadge: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  finalizedBadge: {
    backgroundColor: colors.success + '15',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
  draftText: {
    color: colors.textSecondary,
  },
  finalizedText: {
    color: colors.success,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  metaLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  metaValue: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  sectionDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic' as const,
    marginBottom: spacing.sm,
  },
  questionContainer: {
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  questionLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  answerText: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic' as const,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});
