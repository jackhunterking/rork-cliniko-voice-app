import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ChevronRight, Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Card } from '@/components/Card';
import { BottomSheet } from '@/components/BottomSheet';
import { colors, spacing, radius } from '@/constants/colors';
import { templates, Template } from '@/mocks/templates';
import { getAppointmentsForPatient, Appointment } from '@/mocks/appointments';
import { useNote } from '@/context/NoteContext';

export default function NoteSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    noteData,
    setTemplate,
    setAppointment,
    setCopyPreviousNote,
    isSetupComplete,
  } = useNote();

  const [templateSheetVisible, setTemplateSheetVisible] = useState(false);
  const [appointmentSheetVisible, setAppointmentSheetVisible] = useState(false);

  const patientAppointments = noteData.patient
    ? getAppointmentsForPatient(noteData.patient.id)
    : [];

  const handleContinue = () => {
    if (isSetupComplete) {
      console.log('Proceeding to note editor');
      router.push('/note/editor');
    }
  };

  const handleSelectTemplate = (template: Template) => {
    setTemplate(template);
    setTemplateSheetVisible(false);
  };

  const handleSelectAppointment = (appointment: Appointment | null) => {
    setAppointment(appointment);
    setAppointmentSheetVisible(false);
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
          <Text style={styles.cardTitle}>Note Settings</Text>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setTemplateSheetVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Template</Text>
              <View style={styles.settingValueRow}>
                <Text
                  style={[
                    styles.settingValue,
                    !noteData.template && styles.settingPlaceholder,
                  ]}
                >
                  {noteData.template?.name ?? 'Select template'}
                </Text>
                <ChevronRight size={18} color={colors.textSecondary} />
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setAppointmentSheetVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Appointment</Text>
              <View style={styles.settingValueRow}>
                <Text
                  style={[
                    styles.settingValue,
                    !noteData.appointment && styles.settingPlaceholder,
                  ]}
                >
                  {noteData.appointment?.label ?? 'No appointment'}
                </Text>
                <ChevronRight size={18} color={colors.textSecondary} />
              </View>
            </View>
          </TouchableOpacity>

          <View style={[styles.settingRow, styles.settingRowLast]}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Copy previous note</Text>
              <Text style={styles.settingHint}>
                Pre-fill fields from last treatment note
              </Text>
            </View>
            <Switch
              value={noteData.copyPreviousNote}
              onValueChange={setCopyPreviousNote}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>

        {noteData.template && (
          <Card style={styles.previewCard}>
            <Text style={styles.previewTitle}>Template Preview</Text>
            <Text style={styles.previewSubtitle}>
              {noteData.template.fields.length} fields
            </Text>
            <View style={styles.fieldsList}>
              {noteData.template.fields.map((field, index) => (
                <View key={field.id} style={styles.fieldPreview}>
                  <Text style={styles.fieldNumber}>{index + 1}</Text>
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}
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
          {templates.map(template => (
            <TouchableOpacity
              key={template.id}
              style={styles.sheetOption}
              onPress={() => handleSelectTemplate(template)}
              activeOpacity={0.7}
            >
              <View style={styles.sheetOptionContent}>
                <Text style={styles.sheetOptionText}>{template.name}</Text>
                <Text style={styles.sheetOptionSubtext}>
                  {template.fields.length} fields
                </Text>
              </View>
              {noteData.template?.id === template.id && (
                <Check size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheet>

      <BottomSheet
        visible={appointmentSheetVisible}
        onClose={() => setAppointmentSheetVisible(false)}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Select Appointment</Text>
          <TouchableOpacity
            style={styles.sheetOption}
            onPress={() => handleSelectAppointment(null)}
            activeOpacity={0.7}
          >
            <Text style={styles.sheetOptionText}>No appointment</Text>
            {noteData.appointment === null && (
              <Check size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
          {patientAppointments.map(apt => (
            <TouchableOpacity
              key={apt.id}
              style={styles.sheetOption}
              onPress={() => handleSelectAppointment(apt)}
              activeOpacity={0.7}
            >
              <View style={styles.sheetOptionContent}>
                <Text style={styles.sheetOptionText}>{apt.label}</Text>
                <Text style={styles.sheetOptionSubtext}>{apt.type}</Text>
              </View>
              {noteData.appointment?.id === apt.id && (
                <Check size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
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
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  settingRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  settingHint: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  settingValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  settingValue: {
    fontSize: 15,
    color: colors.primary,
  },
  settingPlaceholder: {
    color: colors.textSecondary,
  },
  previewCard: {
    marginTop: spacing.md,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  previewSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  fieldsList: {
    gap: spacing.sm,
  },
  fieldPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fieldNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.backgroundSecondary,
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600' as const,
    overflow: 'hidden',
  },
  fieldLabel: {
    fontSize: 15,
    color: colors.textPrimary,
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
  sheetOptionSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
