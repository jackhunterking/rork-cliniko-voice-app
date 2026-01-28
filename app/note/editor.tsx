import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { List } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SecondaryButton } from '@/components/SecondaryButton';
import { NoteTextField } from '@/components/NoteTextField';
import { BottomSheet } from '@/components/BottomSheet';
import { DictationSheet } from '@/components/DictationSheet';
import { colors, spacing } from '@/constants/colors';
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
  } = useNote();

  const [fieldsSheetVisible, setFieldsSheetVisible] = useState(false);
  const [dictationVisible, setDictationVisible] = useState(false);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [fieldLayouts, setFieldLayouts] = useState<Record<string, number>>({});

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
            <TouchableOpacity
              onPress={() => setFieldsSheetVisible(true)}
              style={styles.headerButton}
            >
              <List size={22} color={colors.primary} />
            </TouchableOpacity>
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
        {noteData.fieldValues.map((fieldValue, index) => {
          const templateField = noteData.template?.fields.find(
            f => f.id === fieldValue.fieldId
          );
          return (
            <View
              key={fieldValue.fieldId}
              onLayout={(e) => handleFieldLayout(fieldValue.fieldId, e.nativeEvent.layout.y)}
            >
              <NoteTextField
                label={fieldValue.label}
                value={fieldValue.value}
                placeholder={templateField?.placeholder ?? 'Tap to type or dictate…'}
                onChangeText={(text) => updateFieldValue(fieldValue.fieldId, text)}
                onMicPress={() => handleMicPress(fieldValue.fieldId)}
              />
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.progressText}>
          <Text style={styles.progressLabel}>
            {filledFieldsCount} of {noteData.fieldValues.length} fields started
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

      <BottomSheet
        visible={fieldsSheetVisible}
        onClose={() => setFieldsSheetVisible(false)}
        maxHeight={SCREEN_HEIGHT * 0.6}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Jump to Field</Text>
          {noteData.fieldValues.map((fieldValue, index) => (
            <TouchableOpacity
              key={fieldValue.fieldId}
              style={styles.fieldItem}
              onPress={() => scrollToField(fieldValue.fieldId)}
              activeOpacity={0.7}
            >
              <View style={styles.fieldItemLeft}>
                <Text style={styles.fieldItemNumber}>{index + 1}</Text>
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
      </BottomSheet>

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
  fieldItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  fieldItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fieldItemNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.backgroundSecondary,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600' as const,
    overflow: 'hidden',
  },
  fieldItemLabel: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  filledBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filledBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600' as const,
  },
});
