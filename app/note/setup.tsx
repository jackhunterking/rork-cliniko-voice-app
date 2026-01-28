import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ChevronRight, Check, ChevronDown, AlertCircle, Mic } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Card } from '@/components/Card';
import { BottomSheet } from '@/components/BottomSheet';
import { colors, spacing, radius } from '@/constants/colors';
import { useClinikoTemplatesFull, useClinikoTemplate } from '@/hooks/useCliniko';
import { useNote } from '@/context/NoteContext';
import { ClinikoTreatmentNoteTemplate, isVoiceFillable } from '@/services/cliniko';

export default function NoteSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    noteData,
    setTemplate,
    isSetupComplete,
  } = useNote();

  const [templateSheetVisible, setTemplateSheetVisible] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // Fetch templates from Cliniko
  const {
    data: templates,
    isLoading: isLoadingTemplates,
    isError: isTemplatesError,
    error: templatesError,
    refetch: refetchTemplates,
  } = useClinikoTemplatesFull();

  // Fetch selected template details
  const {
    data: templateDetail,
    isLoading: isLoadingTemplateDetail,
  } = useClinikoTemplate(selectedTemplateId ?? undefined);

  // Set template when detail is loaded
  useEffect(() => {
    if (templateDetail) {
      setTemplate(templateDetail);
      setSelectedTemplateId(null); // Clear to prevent re-fetching
    }
  }, [templateDetail, setTemplate]);

  const handleContinue = () => {
    if (isSetupComplete) {
      console.log('Proceeding to note editor');
      router.push('/note/editor');
    }
  };

  const handleSelectTemplate = (template: ClinikoTreatmentNoteTemplate) => {
    console.log('Selected template:', template.name);
    // Set the template directly since we already have full details
    setTemplate(template);
    setTemplateSheetVisible(false);
  };

  // Count voice-fillable questions for a template
  const countVoiceFillable = (template: ClinikoTreatmentNoteTemplate) => {
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
  };

  const countTotalQuestions = (template: ClinikoTreatmentNoteTemplate) => {
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
  };
  
  // Safe getter for section count
  const getSectionCount = (template: ClinikoTreatmentNoteTemplate) => {
    const sections = template.content?.sections;
    if (!sections || !Array.isArray(sections)) return 0;
    return sections.length;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'New Treatment Note',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.lg + 70 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {noteData.patient && (
          <View style={styles.patientBadge}>
            <Text style={styles.patientBadgeLabel}>Patient</Text>
            <Text style={styles.patientBadgeName}>{noteData.patient.name}</Text>
          </View>
        )}

        <Card>
          <Text style={styles.cardTitle}>Select Template</Text>
          <Text style={styles.cardSubtitle}>
            Choose a template to structure your treatment note
          </Text>

          <TouchableOpacity
            style={styles.templateSelector}
            onPress={() => setTemplateSheetVisible(true)}
            activeOpacity={0.7}
            disabled={isLoadingTemplates}
          >
            <View style={styles.templateSelectorContent}>
              {isLoadingTemplates || isLoadingTemplateDetail ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <Text
                    style={[
                      styles.templateSelectorText,
                      !noteData.template && styles.templateSelectorPlaceholder,
                    ]}
                  >
                    {noteData.template?.name ?? 'Select a template'}
                  </Text>
                  <ChevronRight size={18} color={colors.textSecondary} />
                </>
              )}
            </View>
          </TouchableOpacity>
        </Card>

        {noteData.template && (
          <View style={styles.previewSection}>
            <TouchableOpacity
              style={styles.previewToggle}
              onPress={() => setPreviewExpanded(!previewExpanded)}
              activeOpacity={0.6}
            >
              <Text style={styles.previewLink}>Preview fields</Text>
              <ChevronDown
                size={16}
                color={colors.primary}
                style={[
                  styles.previewChevron,
                  previewExpanded && styles.previewChevronExpanded,
                ]}
              />
            </TouchableOpacity>
            {previewExpanded && noteData.template.content?.sections && (
              <View style={styles.sectionsList}>
                {noteData.template.content.sections.map((section, sectionIndex) => (
                  <View key={`section-${sectionIndex}`} style={styles.sectionPreview}>
                    <Text style={styles.sectionName}>{section.name}</Text>
                    {section.description && (
                      <Text style={styles.sectionDescription}>{section.description}</Text>
                    )}
                    <View style={styles.questionsList}>
                      {(section.questions ?? []).map((question, questionIndex) => {
                        return (
                          <View key={`question-${sectionIndex}-${questionIndex}`} style={styles.questionPreview}>
                            <Text style={styles.questionLabel}>
                              {question.name}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {isTemplatesError && (
          <View style={styles.errorCard}>
            <AlertCircle size={20} color={colors.error} />
            <Text style={styles.errorText}>
              Failed to load templates. {templatesError?.message || 'Please try again.'}
            </Text>
            <TouchableOpacity onPress={() => refetchTemplates()} style={styles.retryLink}>
              <Text style={styles.retryLinkText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.hint}>
          You can link an appointment to this note in the next step.
        </Text>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <PrimaryButton
          title="Continue"
          onPress={handleContinue}
          disabled={!isSetupComplete}
        />
      </View>

      <BottomSheet
        visible={templateSheetVisible}
        onClose={() => setTemplateSheetVisible(false)}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Select Template</Text>
          
          {isLoadingTemplates ? (
            <View style={styles.sheetLoading}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.sheetLoadingText}>Loading templates...</Text>
            </View>
          ) : isTemplatesError ? (
            <View style={styles.sheetError}>
              <AlertCircle size={32} color={colors.error} />
              <Text style={styles.sheetErrorText}>Failed to load templates</Text>
              <TouchableOpacity onPress={() => refetchTemplates()} style={styles.sheetRetryButton}>
                <Text style={styles.sheetRetryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : templates && templates.length > 0 ? (
            <ScrollView style={styles.templatesList} showsVerticalScrollIndicator={false}>
              {templates.map(template => {
                const voiceFillableCount = countVoiceFillable(template);
                const totalCount = countTotalQuestions(template);
                const isSelected = noteData.template?.id === template.id;
                
                return (
                  <TouchableOpacity
                    key={template.id}
                    style={styles.sheetOption}
                    onPress={() => handleSelectTemplate(template)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.sheetOptionContent}>
                      <Text style={[
                        styles.sheetOptionText,
                        isSelected && styles.sheetOptionTextSelected,
                      ]}>
                        {template.name}
                      </Text>
                      <View style={styles.sheetOptionMeta}>
                        <Text style={styles.sheetOptionSubtext}>
                          {getSectionCount(template)} sections • {totalCount} fields
                        </Text>
                        <View style={styles.sheetOptionBadge}>
                          <Mic size={10} color={colors.success} />
                          <Text style={styles.sheetOptionBadgeText}>
                            {voiceFillableCount} voice
                          </Text>
                        </View>
                      </View>
                    </View>
                    {isSelected && (
                      <Check size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.sheetEmpty}>
              <Text style={styles.sheetEmptyText}>
                No templates found in your Cliniko account.
              </Text>
            </View>
          )}
        </View>
      </BottomSheet>
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
  patientBadge: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  patientBadgeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  patientBadgeName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginTop: 4,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  templateSelector: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  templateSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  templateSelectorText: {
    fontSize: 16,
    color: colors.primary,
    flex: 1,
  },
  templateSelectorPlaceholder: {
    color: colors.textSecondary,
  },
  hint: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
    fontStyle: 'italic' as const,
  },
  previewSection: {
    marginTop: spacing.md,
  },
  previewToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
  },
  previewLink: {
    fontSize: 14,
    color: colors.primary,
  },
  previewChevron: {
    transform: [{ rotate: '0deg' }],
  },
  previewChevronExpanded: {
    transform: [{ rotate: '180deg' }],
  },
  sectionsList: {
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  sectionPreview: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  sectionDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  questionsList: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  questionPreview: {
    paddingVertical: spacing.xs,
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
    paddingLeft: spacing.sm,
  },
  questionLabel: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '10',
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: colors.error,
  },
  retryLink: {
    padding: spacing.xs,
  },
  retryLinkText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500' as const,
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
  sheetContent: {
    paddingHorizontal: spacing.lg,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  sheetLoading: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  sheetLoadingText: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  sheetError: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  sheetErrorText: {
    fontSize: 15,
    color: colors.error,
    marginTop: spacing.sm,
  },
  sheetRetryButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
  },
  sheetRetryText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500' as const,
  },
  sheetEmpty: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  sheetEmptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  templatesList: {
    maxHeight: 400,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sheetOptionContent: {
    flex: 1,
  },
  sheetOptionText: {
    fontSize: 17,
    color: colors.textPrimary,
  },
  sheetOptionTextSelected: {
    color: colors.primary,
    fontWeight: '500' as const,
  },
  sheetOptionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4,
  },
  sheetOptionSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  sheetOptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.success + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  sheetOptionBadgeText: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '500' as const,
  },
});
