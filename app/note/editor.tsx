import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import { List, Mic, MicOff } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SecondaryButton } from '@/components/SecondaryButton';
import { NoteTextField } from '@/components/NoteTextField';
import { BottomSheet } from '@/components/BottomSheet';
import { DictationSheet } from '@/components/DictationSheet';
import { colors, spacing, radius } from '@/constants/colors';
import { useNote } from '@/context/NoteContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function NoteEditorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const {
    noteData,
    updateFieldValue,
    appendToField,
    replaceFieldValue,
    filledFieldsCount,
    fieldsBySection,
    voiceFillableFields,
  } = useNote();

  const [fieldsSheetVisible, setFieldsSheetVisible] = useState(false);
  const [dictationVisible, setDictationVisible] = useState(false);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [fieldLayouts, setFieldLayouts] = useState<Record<string, number>>({});
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipOpacity = useRef(new Animated.Value(0)).current;

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

  const handleSaveDraft = () => {
    console.log('Saving as draft...');
    router.push('/note/success?type=draft');
  };

  const handleReview = () => {
    console.log('Proceeding to review');
    router.push('/note/review');
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

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Treatment Note',
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

      <View style={styles.subheader}>
        <Text style={styles.patientName}>{noteData.patient.name}</Text>
        <Text style={styles.templateName}>{noteData.template.name}</Text>
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
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.name}</Text>
              <View style={styles.sectionBadges}>
                <View style={styles.sectionBadge}>
                  <Mic size={10} color={colors.success} />
                  <Text style={styles.sectionBadgeText}>
                    {section.fields.filter(f => f.isVoiceFillable).length}
                  </Text>
                </View>
                {section.fields.filter(f => !f.isVoiceFillable).length > 0 && (
                  <View style={[styles.sectionBadge, styles.sectionBadgeSecondary]}>
                    <MicOff size={10} color={colors.textSecondary} />
                    <Text style={styles.sectionBadgeTextSecondary}>
                      {section.fields.filter(f => !f.isVoiceFillable).length}
                    </Text>
                  </View>
                )}
              </View>
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
        <View style={styles.progressText}>
          <Text style={styles.progressLabel}>
            {filledFieldsCount} of {voiceFillableFields.length} voice fields started
          </Text>
          <Text style={styles.progressFootnote}>
            Fields can be left empty if not applicable
          </Text>
        </View>
        <View style={styles.buttonRow}>
          <SecondaryButton
            title="Save draft"
            onPress={handleSaveDraft}
            style={styles.buttonHalf}
          />
          <PrimaryButton
            title="Review"
            onPress={handleReview}
            style={styles.buttonHalf}
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
  subheader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  patientName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  templateName: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
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
  progressText: {
    marginBottom: spacing.sm,
  },
  progressLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  progressFootnote: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    opacity: 0.7,
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
