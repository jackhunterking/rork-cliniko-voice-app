import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, FileText, AlertCircle, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Card } from '@/components/Card';
import { colors, spacing, radius } from '@/constants/colors';
import { useClinikoPatient, usePatientAppointments, isClinikoAuthError } from '@/hooks/useCliniko';
import { useNote, Patient } from '@/context/NoteContext';

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'Not available';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatAppointmentDateTime(datetime: string): string {
  const date = new Date(datetime);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const timeStr = date.toLocaleTimeString('en-AU', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  if (isToday) return `Today, ${timeStr}`;
  if (isTomorrow) return `Tomorrow, ${timeStr}`;

  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
  }) + `, ${timeStr}`;
}

export default function PatientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setPatient, noteData } = useNote();

  // Fetch patient details from Cliniko
  const {
    data: clinikoPatient,
    isLoading: isLoadingPatient,
    isError: isPatientError,
    error: patientError,
    refetch: refetchPatient,
  } = useClinikoPatient(id ?? '');

  // Fetch patient appointments from Cliniko
  const {
    data: appointments,
    isLoading: isLoadingAppointments,
  } = usePatientAppointments(id ?? '');

  // Use noteData.patient if available (already selected), otherwise use fetched patient
  const patient = noteData.patient?.id === id ? noteData.patient : (
    clinikoPatient ? {
      id: clinikoPatient.id,
      name: `${clinikoPatient.first_name} ${clinikoPatient.last_name}`.trim(),
      email: clinikoPatient.email ?? '',
      phone: clinikoPatient.phone_numbers?.[0]?.number ?? '',
      dateOfBirth: clinikoPatient.date_of_birth ?? '',
      lastAppointment: null,
    } : null
  );

  // Loading state
  if (isLoadingPatient) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Patient' }} />
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading patient details...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (isPatientError) {
    const isAuthError = isClinikoAuthError(patientError);
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Patient' }} />
        <View style={styles.errorState}>
          <AlertCircle size={48} color={colors.error} />
          <Text style={styles.errorTitle}>
            {isAuthError ? 'Authentication Error' : 'Failed to Load Patient'}
          </Text>
          <Text style={styles.errorMessage}>
            {isAuthError
              ? 'Please check your Cliniko API key in settings.'
              : patientError?.message || 'An unexpected error occurred.'}
          </Text>
          <PrimaryButton title="Try Again" onPress={() => refetchPatient()} />
        </View>
      </View>
    );
  }

  if (!patient) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Patient' }} />
        <View style={styles.errorState}>
          <User size={48} color={colors.textSecondary} />
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

  // Get first 3 upcoming appointments
  const upcomingAppointments = (appointments ?? [])
    .filter(apt => new Date(apt.starts_at) >= new Date() && !apt.cancelled_at)
    .slice(0, 3);

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
            <Text style={styles.cardTitle}>Upcoming Appointments</Text>
          </View>
          {isLoadingAppointments ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.textSecondary} />
              <Text style={styles.loadingRowText}>Loading appointments...</Text>
            </View>
          ) : upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((apt, index) => (
              <View
                key={apt.id}
                style={[
                  styles.appointmentRow,
                  index < upcomingAppointments.length - 1 && styles.appointmentRowBorder,
                ]}
              >
                <Text style={styles.appointmentTime}>
                  {formatAppointmentDateTime(apt.starts_at)}
                </Text>
                <Text style={styles.appointmentType}>
                  {apt.notes || 'Appointment'}
                </Text>
              </View>
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
          <Text style={styles.emptyCardText}>
            View notes in Cliniko
          </Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.detailLabel}>Date of Birth</Text>
          <Text style={styles.detailValue}>
            {patient.dateOfBirth ? formatDate(patient.dateOfBirth) : 'Not available'}
          </Text>
          
          <Text style={[styles.detailLabel, { marginTop: spacing.md }]}>Phone</Text>
          <Text style={styles.detailValue}>
            {patient.phone || 'Not available'}
          </Text>
          
          <Text style={[styles.detailLabel, { marginTop: spacing.md }]}>Email</Text>
          <Text style={styles.detailValue}>
            {patient.email || 'Not available'}
          </Text>

          {clinikoPatient && (
            <>
              {clinikoPatient.address_1 && (
                <>
                  <Text style={[styles.detailLabel, { marginTop: spacing.md }]}>Address</Text>
                  <Text style={styles.detailValue}>
                    {[
                      clinikoPatient.address_1,
                      clinikoPatient.address_2,
                      clinikoPatient.city,
                      clinikoPatient.state,
                      clinikoPatient.post_code,
                    ].filter(Boolean).join(', ')}
                  </Text>
                </>
              )}
            </>
          )}
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
    paddingVertical: spacing.sm,
  },
  appointmentRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
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
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  loadingRowText: {
    fontSize: 14,
    color: colors.textSecondary,
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
