import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Mic, Calendar, AlertCircle } from 'lucide-react-native';
import { BottomSheet } from '@/components/BottomSheet';
import { DropdownSelector, DropdownOption } from '@/components/DropdownSelector';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors, spacing, radius } from '@/constants/colors';
import { useClinikoTemplatesFull } from '@/hooks/useCliniko';
import {
  ClinikoTreatmentNoteTemplate,
  ClinikoIndividualAppointment,
  isVoiceFillable,
} from '@/services/cliniko';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface QuickNoteSheetProps {
  visible: boolean;
  onClose: () => void;
  appointments: ClinikoIndividualAppointment[];
  isLoadingAppointments?: boolean;
  onStartNote: (
    template: ClinikoTreatmentNoteTemplate,
    appointment?: ClinikoIndividualAppointment
  ) => void;
}

/**
 * Format appointment datetime for display
 * Format: "Today, 2:00pm" or "28 Jan, 2:45pm"
 */
function formatAppointmentDateTime(datetime: string): string {
  const date = new Date(datetime);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const timeStr = date.toLocaleTimeString('en-AU', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).toLowerCase();

  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return `Today, ${timeStr}`;
  if (isTomorrow) return `Tomorrow, ${timeStr}`;
  if (isYesterday) return `Yesterday, ${timeStr}`;

  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
  }) + `, ${timeStr}`;
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
 * Count total questions for a template
 */
function countTotalQuestions(template: ClinikoTreatmentNoteTemplate): number {
  let count = 0;
  const sections = template.content?.sections;
  if (!sections || !Array.isArray(sections)) return 0;
  
  for (const section of sections) {
    const questions = section?.questions;
    if (questions && Array.isArray(questions)) {
      count += questions.length;
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

export function QuickNoteSheet({
  visible,
  onClose,
  appointments,
  isLoadingAppointments,
  onStartNote,
}: QuickNoteSheetProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ClinikoTreatmentNoteTemplate | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<ClinikoIndividualAppointment | null>(null);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [showAppointmentDropdown, setShowAppointmentDropdown] = useState(false);

  // Fetch templates from Cliniko
  const {
    data: templates,
    isLoading: isLoadingTemplates,
    isError: isTemplatesError,
    refetch: refetchTemplates,
  } = useClinikoTemplatesFull(undefined, { enabled: visible });

  // Organize appointments - upcoming first, then recent past
  const organizedAppointments = useMemo(() => {
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

  // Convert templates to dropdown options
  const templateOptions: DropdownOption<ClinikoTreatmentNoteTemplate>[] = useMemo(() => {
    if (!templates) return [];
    return templates.map((template) => {
      const voiceCount = countVoiceFillable(template);
      const totalCount = countTotalQuestions(template);
      const sectionCount = getSectionCount(template);
      return {
        id: template.id,
        value: template,
        label: template.name,
        sublabel: `${sectionCount} sections • ${totalCount} fields • ${voiceCount} voice`,
      };
    });
  }, [templates]);

  // Convert appointments to dropdown options
  const appointmentOptions: DropdownOption<ClinikoIndividualAppointment>[] = useMemo(() => {
    return organizedAppointments.map((apt) => {
      const isPast = new Date(apt.starts_at) < new Date();
      return {
        id: apt.id,
        value: apt,
        label: formatAppointmentDateTime(apt.starts_at),
        sublabel: apt.notes || undefined,
        icon: <Calendar size={14} color={isPast ? colors.textSecondary : colors.primary} />,
      };
    });
  }, [organizedAppointments]);

  const handleSelectTemplate = (option: DropdownOption<ClinikoTreatmentNoteTemplate> | null) => {
    setSelectedTemplate(option?.value ?? null);
    setShowTemplateDropdown(false);
  };

  const handleSelectAppointment = (option: DropdownOption<ClinikoIndividualAppointment> | null) => {
    setSelectedAppointment(option?.value ?? null);
    setShowAppointmentDropdown(false);
  };

  const handleStartNote = () => {
    if (selectedTemplate) {
      onStartNote(selectedTemplate, selectedAppointment ?? undefined);
      // Reset state after starting
      setSelectedTemplate(null);
      setSelectedAppointment(null);
      setShowTemplateDropdown(false);
      setShowAppointmentDropdown(false);
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setSelectedTemplate(null);
    setSelectedAppointment(null);
    setShowTemplateDropdown(false);
    setShowAppointmentDropdown(false);
    onClose();
  };

  const canStart = selectedTemplate !== null;

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      maxHeight={SCREEN_HEIGHT * 0.75}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Create Note</Text>

        {/* Template Selector */}
        {isTemplatesError ? (
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Template <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.errorField}>
              <AlertCircle size={16} color={colors.error} />
              <Text style={styles.errorText}>Failed to load templates</Text>
              <TouchableOpacity onPress={() => refetchTemplates()}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <DropdownSelector<ClinikoTreatmentNoteTemplate>
            label="Template"
            required
            placeholder="Select a template"
            options={templateOptions}
            selectedId={selectedTemplate?.id ?? null}
            onSelect={handleSelectTemplate}
            isExpanded={showTemplateDropdown}
            onToggle={() => setShowTemplateDropdown(!showTemplateDropdown)}
            isLoading={isLoadingTemplates}
            loadingText="Loading templates..."
            emptyText="No templates available"
            renderOption={(option, isSelected) => (
              <>
                <Text style={[
                  styles.templateOptionText,
                  isSelected && styles.templateOptionTextSelected
                ]}>
                  {option.label}
                </Text>
                <Text style={styles.templateSubtext}>{option.sublabel}</Text>
              </>
            )}
          />
        )}

        {/* Appointment Selector */}
        <DropdownSelector<ClinikoIndividualAppointment>
          label="Link to Appointment"
          hint="Optional"
          placeholder="No appointment"
          options={appointmentOptions}
          selectedId={selectedAppointment?.id ?? null}
          onSelect={handleSelectAppointment}
          isExpanded={showAppointmentDropdown}
          onToggle={() => setShowAppointmentDropdown(!showAppointmentDropdown)}
          isLoading={isLoadingAppointments}
          loadingText="Loading appointments..."
          emptyText="No appointments found"
          allowNone
          noneLabel="No appointment"
          renderSelectedValue={(option) => (
            <View style={styles.appointmentSelectedValue}>
              <Calendar size={14} color={colors.primary} />
              <Text style={styles.appointmentValueText}>{option.label}</Text>
            </View>
          )}
        />

        {/* Start Button */}
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title="Start Note"
            onPress={handleStartNote}
            disabled={!canStart}
          />
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  fieldContainer: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  required: {
    color: colors.error,
  },
  // Template option styles for custom renderOption
  templateOptionText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  templateOptionTextSelected: {
    color: colors.primary,
    fontWeight: '500' as const,
  },
  templateSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  // Appointment selected value styles
  appointmentSelectedValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  appointmentValueText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  // Error field styles
  errorField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.error + '10',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    flex: 1,
  },
  retryText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500' as const,
  },
  buttonContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
});
