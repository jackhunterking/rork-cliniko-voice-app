import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import { List, Mic, MicOff, Calendar, FileText, ChevronDown, Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SecondaryButton } from '@/components/SecondaryButton';
import { NoteTextField } from '@/components/NoteTextField';
import { BottomSheet } from '@/components/BottomSheet';
import { DictationSheet } from '@/components/DictationSheet';
import { colors, spacing, radius } from '@/constants/colors';
import { useNote } from '@/context/NoteContext';
import { useCreateTreatmentNote, useUpdateTreatmentNote, usePatientAppointments, useClinikoTemplatesFull, isClinikoAuthError, isClinikoNetworkError } from '@/hooks/useCliniko';
import { CreateTreatmentNotePayload, UpdateTreatmentNotePayload, ClinikoError, ClinikoIndividualAppointment, ClinikoTreatmentNoteTemplate, isVoiceFillable } from '@/services/cliniko';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Format appointment datetime for display
 * Format: "28 Jan 2026, 2:45pm"
 */
function formatAppointmentDateTime(datetime: string): string {
  const date = new Date(datetime);
  const day = date.getDate();
  const month = date.toLocaleDateString('en-AU', { month: 'short' });
  const year = date.getFullYear();
  const time = date.toLocaleTimeString('en-AU', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).toLowerCase();
  
  return `${day} ${month} ${year}, ${time}`;
}

/**
 * Count voice-fillable questions for a template
 */
function countVoiceFillable(template: ClinikoTreatmentNoteTemplate): number {
  let count = 0;
  const sections = template.content?.sections;
  if (!sections || !Array.isArray(sections)) return 0;
  
  for (const section of sections) {
    const questions = section?.questions;
    if (!questions || !Array.isArray(questions)) continue;
    
    for (const question of questions) {
      if (question?.type && isVoiceFillable(question.type)) {
        count++;
      }
    }
  }
  return count;
}

/**
 * Get section count safely
 */
function getSectionCount(template: ClinikoTreatmentNoteTemplate): number {
  const sections = template.content?.sections;
  if (!sections || !Array.isArray(sections)) return 0;
  return sections.length;
}

export default function NoteEditorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const {
    noteData,
    updateFieldValue,
    appendToField,
    replaceFieldValue,
    fieldsBySection,
    toClinikoNoteContent,
    setClinikoAppointment,
    setTemplate,
    isEditMode,
    resetNote,
  } = useNote();

  // Mutation for creating treatment note
  const createNoteMutation = useCreateTreatmentNote();
  
  // Mutation for updating existing treatment note
  const updateNoteMutation = useUpdateTreatmentNote();

  // Fetch templates from Cliniko
  const {
    data: templates,
    isLoading: isLoadingTemplates,
  } = useClinikoTemplatesFull();

  // Fetch patient appointments for inline dropdown
  const {
    data: appointments,
    isLoading: isLoadingAppointments,
  } = usePatientAppointments(noteData.patient?.id ?? '');

  // Organize appointments - upcoming first, then recent past
  const organizedAppointments = useMemo(() => {
    if (!appointments) return [];
    
    const now = new Date();
    const upcoming = appointments
      .filter(apt => new Date(apt.starts_at) >= now && !apt.cancelled_at)
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
    
    const recent = appointments
      .filter(apt => new Date(apt.starts_at) < now && !apt.cancelled_at)
      .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime())
      .slice(0, 5);

    return [...upcoming, ...recent];
  }, [appointments]);

  const [fieldsSheetVisible, setFieldsSheetVisible] = useState(false);
  const [dictationVisible, setDictationVisible] = useState(false);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [showAppointmentDropdown, setShowAppointmentDropdown] = useState(false);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [fieldLayouts, setFieldLayouts] = useState<Record<string, number>>({});
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipOpacity = useRef(new Animated.Value(0)).current;

  // Handle template selection
  const handleSelectTemplate = useCallback((template: ClinikoTreatmentNoteTemplate) => {
    console.log('Selected template:', template.name);
    setTemplate(template);
    setShowTemplateDropdown(false);
  }, [setTemplate]);

  // Handle appointment selection
  const handleSelectAppointment = useCallback((appointment: ClinikoIndividualAppointment | null) => {
    console.log('Selected appointment:', appointment?.id ?? 'No appointment');
    setClinikoAppointment(appointment);
    setShowAppointmentDropdown(false);
  }, [setClinikoAppointment]);

  useEffect(() => {
    const checkTooltipShown = async () => {
      try {
        const hasShown = await AsyncStorage.getItem('fieldsTooltipShown');
        if (!hasShown) {
          setShowTooltip(true);
          Animated.timing(tooltipOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }
      } catch (error) {
        console.log('Error checking tooltip state:', error);
      }
    };
    checkTooltipShown();
  }, [tooltipOpacity]);

  const dismissTooltip = useCallback(async () => {
    if (showTooltip) {
      Animated.timing(tooltipOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShowTooltip(false));
      try {
        await AsyncStorage.setItem('fieldsTooltipShown', 'true');
      } catch (error) {
        console.log('Error saving tooltip state:', error);
      }
    }
  }, [showTooltip, tooltipOpacity]);

  const activeField = noteData.fieldValues.find(f => f.fieldId === activeFieldId);

  const handleMicPress = useCallback((fieldId: string) => {
    console.log('Opening dictation for field:', fieldId);
    setActiveFieldId(fieldId);
    setDictationVisible(true);
  }, []);

  const handleDictationInsert = useCallback((text: string) => {
    if (activeFieldId) {
      console.log('Inserting dictation text:', text.substring(0, 50) + '...');
      appendToField(activeFieldId, text);
    }
  }, [activeFieldId, appendToField]);

  const handleDictationReplace = useCallback((text: string) => {
    if (activeFieldId) {
      console.log('Replacing with dictation text:', text.substring(0, 50) + '...');
      replaceFieldValue(activeFieldId, text);
    }
  }, [activeFieldId, replaceFieldValue]);

  const handleFieldLayout = useCallback((fieldId: string, y: number) => {
    setFieldLayouts(prev => ({ ...prev, [fieldId]: y }));
  }, []);

  const scrollToField = useCallback((fieldId: string) => {
    const y = fieldLayouts[fieldId];
    if (y !== undefined && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: y - 20, animated: true });
    }
    setFieldsSheetVisible(false);
  }, [fieldLayouts]);

  /**
   * Save the treatment note to Cliniko (create or update)
   */
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

    try {
      let resultNoteId: string;

      if (isEditMode && noteData.editingNoteId) {
        // UPDATE existing note
        const updatePayload: UpdateTreatmentNotePayload = {
          content,
          draft: asDraft,
        };

        console.log('Updating note:', noteData.editingNoteId, updatePayload);
        const result = await updateNoteMutation.mutateAsync({
          noteId: noteData.editingNoteId,
          payload: updatePayload,
        });
        resultNoteId = result.id;
        
        // Clear the editing state after successful save
        resetNote();
        
        // Navigate back to the note detail page
        router.replace(`/note/${resultNoteId}`);
      } else {
        // CREATE new note
        // Extract attendee_id from the attendee's self link if available
        // The link format is: https://api.XX.cliniko.com/v1/attendees/123456
        let attendeeId: string | undefined;
        const attendeeLink = noteData.clinikoAppointment?.attendee?.links?.self;
        if (attendeeLink) {
          const match = attendeeLink.match(/\/attendees\/(\d+)/);
          if (match) {
            attendeeId = match[1];
            console.log('Extracted attendee_id from link:', attendeeId);
          }
        }

        const createPayload: CreateTreatmentNotePayload = {
          patient_id: noteData.patient.id,
          treatment_note_template_id: noteData.template.id,
          content,
          draft: asDraft,
          // Only include attendee_id if we successfully extracted it
          ...(attendeeId && { attendee_id: attendeeId }),
        };

        console.log('Creating note:', createPayload);
        const result = await createNoteMutation.mutateAsync(createPayload);
        resultNoteId = result.id;
        
        // Navigate to success screen with the note ID
        router.push(`/note/success?type=${asDraft ? 'draft' : 'final'}&noteId=${resultNoteId}`);
      }
    } catch (error) {
      console.error('Failed to save treatment note:', error);
      
      let errorMessage = 'Failed to save the treatment note. Please try again.';
      
      if (isClinikoAuthError(error)) {
        errorMessage = 'Authentication error. Please check your Cliniko API key in settings.';
      } else if (isClinikoNetworkError(error)) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error instanceof ClinikoError && error.errors) {
        // Show specific validation errors from Cliniko
        // Note: error values can be strings or arrays
        const validationErrors = Object.entries(error.errors)
          .map(([field, messages]) => {
            const messageText = Array.isArray(messages) 
              ? messages.join(', ') 
              : String(messages);
            return `${field}: ${messageText}`;
          })
          .join('\n');
        errorMessage = `Validation failed:\n${validationErrors}`;
        console.error('Cliniko validation errors:', error.errors);
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
        <Stack.Screen options={{ title: 'Treatment Note' }} />
        <View style={styles.errorState}>
          <Text style={styles.errorText}>Setup incomplete</Text>
        </View>
      </View>
    );
  }

  // Combined mutation pending state
  const isSaving = createNoteMutation.isPending || updateNoteMutation.isPending;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: isEditMode ? 'Edit Treatment Note' : 'Treatment Note',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerRight: () => (
            <View>
              <TouchableOpacity
                onPress={() => {
                  dismissTooltip();
                  setFieldsSheetVisible(true);
                }}
                style={styles.headerButton}
              >
                <List size={22} color={colors.primary} />
              </TouchableOpacity>
              {showTooltip && (
                <Animated.View style={[styles.tooltip, { opacity: tooltipOpacity }]}>
                  <TouchableOpacity onPress={dismissTooltip} activeOpacity={0.9}>
                    <Text style={styles.tooltipText}>Jump to section</Text>
                    <View style={styles.tooltipArrow} />
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          ),
        }}
      />

      <View style={styles.headerSection}>
        {/* Patient Card - Compact */}
        <View style={styles.patientCard}>
          <View style={styles.patientAvatar}>
            <Text style={styles.patientInitial}>
              {noteData.patient.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{noteData.patient.name}</Text>
            {isEditMode && (
              <Text style={styles.editModeLabel}>Editing draft note</Text>
            )}
          </View>
        </View>

        {/* Form Fields Container - Hidden in edit mode since template/appointment are fixed */}
        {!isEditMode && (
        <View style={styles.formFieldsContainer}>
          {/* Template Selector */}
          <View style={styles.formField}>
            <Text style={styles.formFieldLabel}>Template</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                setShowTemplateDropdown(!showTemplateDropdown);
                setShowAppointmentDropdown(false);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.dropdownButtonContent}>
                <FileText size={16} color={colors.primary} />
                <Text style={styles.dropdownButtonText} numberOfLines={1}>
                  {noteData.template.name}
                </Text>
              </View>
              <ChevronDown
                size={18}
                color={colors.textSecondary}
                style={showTemplateDropdown ? styles.chevronUp : undefined}
              />
            </TouchableOpacity>

            {/* Template Dropdown List */}
            {showTemplateDropdown && (
              <View style={styles.dropdownList}>
                {isLoadingTemplates ? (
                  <View style={styles.dropdownLoading}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.dropdownLoadingText}>Loading templates...</Text>
                  </View>
                ) : (
                  <ScrollView style={styles.dropdownScroll} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                    {templates?.map((template) => {
                      const isSelected = noteData.template?.id === template.id;
                      const voiceCount = countVoiceFillable(template);
                      const sectionCount = getSectionCount(template);

                      return (
                        <TouchableOpacity
                          key={template.id}
                          style={[styles.dropdownOption, isSelected && styles.dropdownOptionSelected]}
                          onPress={() => handleSelectTemplate(template)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.dropdownOptionContent}>
                            <Text style={[styles.dropdownOptionText, isSelected && styles.dropdownOptionTextSelected]}>
                              {template.name}
                            </Text>
                            <Text style={styles.dropdownOptionMeta}>
                              {sectionCount} sections • {voiceCount} voice fields
                            </Text>
                          </View>
                          {isSelected && <Check size={18} color={colors.primary} />}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
            )}
          </View>

          {/* Appointment Selector */}
          <View style={styles.formField}>
            <View style={styles.formFieldLabelRow}>
              <Text style={styles.formFieldLabel}>Appointment</Text>
              <Text style={styles.formFieldHint}>Optional</Text>
            </View>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                setShowAppointmentDropdown(!showAppointmentDropdown);
                setShowTemplateDropdown(false);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.dropdownButtonContent}>
                <Calendar size={16} color={noteData.clinikoAppointment ? colors.primary : colors.textSecondary} />
                <Text style={[
                  styles.dropdownButtonText,
                  !noteData.clinikoAppointment && styles.dropdownButtonPlaceholder
                ]}>
                  {noteData.clinikoAppointment
                    ? formatAppointmentDateTime(noteData.clinikoAppointment.starts_at)
                    : 'No appointment linked'}
                </Text>
              </View>
              <ChevronDown
                size={18}
                color={colors.textSecondary}
                style={showAppointmentDropdown ? styles.chevronUp : undefined}
              />
            </TouchableOpacity>

            {/* Appointment Dropdown List */}
            {showAppointmentDropdown && (
              <View style={styles.dropdownList}>
                {isLoadingAppointments ? (
                  <View style={styles.dropdownLoading}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.dropdownLoadingText}>Loading appointments...</Text>
                  </View>
                ) : (
                  <ScrollView style={styles.dropdownScroll} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                    {/* No appointment option */}
                    <TouchableOpacity
                      style={[styles.dropdownOption, !noteData.clinikoAppointment && styles.dropdownOptionSelected]}
                      onPress={() => handleSelectAppointment(null)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.dropdownOptionText,
                        !noteData.clinikoAppointment && styles.dropdownOptionTextSelected
                      ]}>
                        No appointment
                      </Text>
                      {!noteData.clinikoAppointment && <Check size={18} color={colors.primary} />}
                    </TouchableOpacity>

                    {/* Appointment options */}
                    {organizedAppointments.map((apt) => {
                      const isSelected = noteData.clinikoAppointment?.id === apt.id;
                      const isPast = new Date(apt.starts_at) < new Date();

                      return (
                        <TouchableOpacity
                          key={apt.id}
                          style={[styles.dropdownOption, isSelected && styles.dropdownOptionSelected]}
                          onPress={() => handleSelectAppointment(apt)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.dropdownOptionContent}>
                            <View style={styles.appointmentOptionRow}>
                              <Calendar size={14} color={isPast ? colors.textSecondary : colors.primary} />
                              <Text style={[
                                styles.dropdownOptionText,
                                isSelected && styles.dropdownOptionTextSelected,
                                isPast && !isSelected && styles.dropdownOptionTextMuted
                              ]}>
                                {formatAppointmentDateTime(apt.starts_at)}
                              </Text>
                            </View>
                            {apt.notes && (
                              <Text style={styles.appointmentNotes} numberOfLines={1}>
                                {apt.notes}
                              </Text>
                            )}
                          </View>
                          {isSelected && <Check size={18} color={colors.primary} />}
                        </TouchableOpacity>
                      );
                    })}

                    {organizedAppointments.length === 0 && (
                      <Text style={styles.dropdownEmptyText}>No appointments found</Text>
                    )}
                  </ScrollView>
                )}
              </View>
            )}
          </View>
        </View>
        )}
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.lg + 80 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Render fields grouped by section */}
        {fieldsBySection.map((section, sectionIndex) => (
          <View key={`section-${sectionIndex}`} style={styles.sectionContainer}>
            <View style={[
              styles.sectionHeader,
              sectionIndex === 0 && styles.sectionHeaderFirst
            ]}>
              <Text style={styles.sectionTitle}>{section.name}</Text>
            </View>

            {section.fields.map((fieldValue) => (
              <View
                key={fieldValue.fieldId}
                onLayout={(e) => handleFieldLayout(fieldValue.fieldId, e.nativeEvent.layout.y)}
              >
                {fieldValue.isVoiceFillable ? (
                  <NoteTextField
                    label={fieldValue.label}
                    value={fieldValue.value}
                    placeholder={`Tap to type or dictate ${fieldValue.label.toLowerCase()}...`}
                    onChangeText={(text) => updateFieldValue(fieldValue.fieldId, text)}
                    onMicPress={() => handleMicPress(fieldValue.fieldId)}
                  />
                ) : (
                  // Non-voice-fillable fields - read-only display or manual entry
                  <View style={styles.nonVoiceField}>
                    <View style={styles.nonVoiceFieldHeader}>
                      <MicOff size={14} color={colors.textSecondary} />
                      <Text style={styles.nonVoiceFieldLabel}>{fieldValue.label}</Text>
                    </View>
                    <Text style={styles.nonVoiceFieldHint}>
                      {fieldValue.questionType} - Manual entry only
                    </Text>
                    {/* Could add manual input here for non-voice fields */}
                  </View>
                )}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
        {isSaving && (
          <View style={styles.savingIndicator}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.savingText}>
              {isEditMode ? 'Updating note...' : 'Saving to Cliniko...'}
            </Text>
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
            title={isEditMode ? 'Save & Finalize' : 'Save as final'}
            onPress={handleSaveFinal}
            style={styles.buttonHalf}
            disabled={isSaving}
          />
        </View>
      </View>

      {/* Jump to Field Sheet */}
      <BottomSheet
        visible={fieldsSheetVisible}
        onClose={() => setFieldsSheetVisible(false)}
        maxHeight={SCREEN_HEIGHT * 0.6}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Jump to Field</Text>
          <ScrollView style={styles.fieldList} showsVerticalScrollIndicator={false}>
            {fieldsBySection.map((section, sectionIndex) => (
              <View key={`section-list-${sectionIndex}`}>
                <Text style={styles.sheetSectionTitle}>{section.name}</Text>
                {section.fields.filter(f => f.isVoiceFillable).map((fieldValue, index) => (
                  <TouchableOpacity
                    key={fieldValue.fieldId}
                    style={styles.fieldItem}
                    onPress={() => scrollToField(fieldValue.fieldId)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.fieldItemLeft}>
                      <Mic size={14} color={fieldValue.value.trim() ? colors.success : colors.textSecondary} />
                      <Text style={styles.fieldItemLabel}>{fieldValue.label}</Text>
                    </View>
                    {fieldValue.value.trim() && (
                      <View style={styles.filledBadge}>
                        <Text style={styles.filledBadgeText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      </BottomSheet>

      {/* Dictation Sheet */}
      <DictationSheet
        visible={dictationVisible}
        onClose={() => setDictationVisible(false)}
        fieldLabel={activeField?.label ?? ''}
        onInsert={handleDictationInsert}
        onReplace={handleDictationReplace}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerButton: {
    padding: spacing.xs,
  },
  tooltip: {
    position: 'absolute',
    top: 36,
    right: 0,
    backgroundColor: colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  tooltipText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500' as const,
  },
  tooltipArrow: {
    position: 'absolute',
    top: -6,
    right: 10,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.textPrimary,
  },
  // New Header Section Styles
  headerSection: {
    backgroundColor: colors.backgroundSecondary,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  patientAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientInitial: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  editModeLabel: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 2,
  },
  formFieldsContainer: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  formField: {
    gap: spacing.xs,
  },
  formFieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  formFieldLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  formFieldHint: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    marginRight: spacing.sm,
  },
  dropdownButtonText: {
    fontSize: 15,
    color: colors.textPrimary,
    flex: 1,
  },
  dropdownButtonPlaceholder: {
    color: colors.textSecondary,
  },
  chevronUp: {
    transform: [{ rotate: '180deg' }],
  },
  dropdownList: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  dropdownOptionSelected: {
    backgroundColor: colors.primaryLight,
  },
  dropdownOptionContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  dropdownOptionText: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  dropdownOptionTextSelected: {
    color: colors.primary,
    fontWeight: '500' as const,
  },
  dropdownOptionTextMuted: {
    color: colors.textSecondary,
  },
  dropdownOptionMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  appointmentOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  appointmentNotes: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    marginLeft: 22,
  },
  dropdownLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  dropdownLoadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  dropdownEmptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  sectionContainer: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeaderFirst: {
    borderBottomWidth: 0,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  sectionBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  sectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.success + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  sectionBadgeSecondary: {
    backgroundColor: colors.backgroundSecondary,
  },
  sectionBadgeText: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '500' as const,
  },
  sectionBadgeTextSecondary: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
  nonVoiceField: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    opacity: 0.7,
  },
  nonVoiceFieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nonVoiceFieldLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  nonVoiceFieldHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic' as const,
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
  sheetContent: {
    paddingHorizontal: spacing.lg,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  fieldList: {
    maxHeight: SCREEN_HEIGHT * 0.4,
  },
  sheetSectionTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.primary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  fieldItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  fieldItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fieldItemLabel: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  filledBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filledBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600' as const,
  },
});
