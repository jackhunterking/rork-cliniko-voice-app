import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, FileText, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Card } from '@/components/Card';
import { colors, spacing } from '@/constants/colors';
import { patients, formatDate } from '@/mocks/patients';
import { getAppointmentsForPatient, formatAppointmentDateTime } from '@/mocks/appointments';
import { useNote } from '@/context/NoteContext';

export default function PatientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setPatient } = useNote();

  const patient = useMemo(() => {
    return patients.find(p => p.id === id);
  }, [id]);

  const appointments = useMemo(() => {
    if (!id) return [];
    return getAppointmentsForPatient(id).slice(0, 3);
  }, [id]);

  if (!patient) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Patient' }} />
        <View style={styles.errorState}>
          <Text style={styles.errorText}>Patient not found</Text>
        </View>
      </View>
    );
  }

  const handleNewNote = () => {
    console.log('Starting new treatment note for:', patient.name);
    setPatient(patient);
    router.push('/note/setup');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: patient.name,
          headerLargeTitle: true,
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
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Calendar size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Appointments</Text>
          </View>
          {appointments.length > 0 ? (
            appointments.map((apt, index) => (
              <TouchableOpacity
                key={apt.id}
                style={[
                  styles.appointmentRow,
                  index < appointments.length - 1 && styles.appointmentRowBorder,
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.appointmentInfo}>
                  <Text style={styles.appointmentTime}>
                    {formatAppointmentDateTime(apt.datetime)}
                  </Text>
                  <Text style={styles.appointmentType}>{apt.type}</Text>
                </View>
                <ChevronRight size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyCardText}>No upcoming appointments</Text>
          )}
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <FileText size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Previous Notes</Text>
          </View>
          <TouchableOpacity style={styles.noteRow} activeOpacity={0.7}>
            <View style={styles.noteInfo}>
              <Text style={styles.noteDate}>
                {formatDate(patient.lastAppointment)}
              </Text>
              <Text style={styles.noteType}>Standard Treatment Note</Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          {patient.lastAppointment && (
            <TouchableOpacity style={styles.noteRow} activeOpacity={0.7}>
              <View style={styles.noteInfo}>
                <Text style={styles.noteDate}>15 Jan 2026</Text>
                <Text style={styles.noteType}>Follow-up Note</Text>
              </View>
              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.detailLabel}>Date of Birth</Text>
          <Text style={styles.detailValue}>{formatDate(patient.dateOfBirth)}</Text>
          
          <Text style={[styles.detailLabel, { marginTop: spacing.md }]}>Phone</Text>
          <Text style={styles.detailValue}>{patient.phone}</Text>
          
          <Text style={[styles.detailLabel, { marginTop: spacing.md }]}>Email</Text>
          <Text style={styles.detailValue}>{patient.email}</Text>
        </Card>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <PrimaryButton title="New treatment note" onPress={handleNewNote} />
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
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  appointmentRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentTime: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  appointmentType: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  noteInfo: {
    flex: 1,
  },
  noteDate: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  noteType: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyCardText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontStyle: 'italic' as const,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    color: colors.textPrimary,
    marginTop: 4,
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
