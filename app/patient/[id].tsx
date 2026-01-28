import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, FileText, AlertCircle, User, Clock, ChevronRight, Plus, CheckCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Card } from '@/components/Card';
import { QuickNoteSheet } from '@/components/QuickNoteSheet';
import { colors, spacing, radius } from '@/constants/colors';
import { useClinikoPatient, usePatientAppointments, usePatientTreatmentNotes, isClinikoAuthError, clinikoKeys } from '@/hooks/useCliniko';
import { useNote, Patient } from '@/context/NoteContext';
import { ClinikoTreatmentNoteTemplate, ClinikoIndividualAppointment } from '@/services/cliniko';

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
  });

  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return `Today, ${timeStr}`;
  if (isTomorrow) return `Tomorrow, ${timeStr}`;
  if (isYesterday) return `Yesterday, ${timeStr}`;

  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  }) + `, ${timeStr}`;
}

function formatNoteDate(datetime: string): string {
  const date = new Date(datetime);
  const today = new Date();

  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

export default function PatientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { setPatient, setTemplate, setClinikoAppointment, noteData, resetNote } = useNote();
  
  // Track the previous patient ID to detect changes
  const previousIdRef = useRef<string | undefined>(undefined);
  
  // State for the quick note sheet
  const [quickNoteSheetVisible, setQuickNoteSheetVisible] = useState(false);
  
  // State for pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);
  
  // Track if we're switching patients (to show loading during transition)
  const [isSwitchingPatient, setIsSwitchingPatient] = useState(false);

  // CRITICAL: Reset data when patient ID changes to prevent data mixing
  useEffect(() => {
    if (id && previousIdRef.current !== undefined && previousIdRef.current !== id) {
      console.log(`[PatientDetail] Patient changed from ${previousIdRef.current} to ${id} - clearing stale data`);
      setIsSwitchingPatient(true);
      
      // Remove stale cached data for the OLD patient's queries to prevent any mixing
      // This ensures we start fresh when viewing a new patient
      queryClient.removeQueries({ 
        queryKey: clinikoKeys.patientNotes(previousIdRef.current),
        exact: true 
      });
      queryClient.removeQueries({ 
        queryKey: clinikoKeys.appointmentsPatient(previousIdRef.current),
        exact: true 
      });
      
      // Reset NoteContext if it contains data from a different patient
      if (noteData.patient && noteData.patient.id !== id) {
        console.log('[PatientDetail] Resetting NoteContext - patient mismatch');
        resetNote();
      }
    }
    
    previousIdRef.current = id;
    
    // Clear switching state after a brief delay to allow queries to start
    if (isSwitchingPatient) {
      const timer = setTimeout(() => setIsSwitchingPatient(false), 100);
      return () => clearTimeout(timer);
    }
  }, [id, queryClient, noteData.patient, resetNote, isSwitchingPatient]);

  // Fetch patient details from Cliniko
  const {
    data: clinikoPatient,
    isLoading: isLoadingPatient,
    isError: isPatientError,
    error: patientError,
    refetch: refetchPatient,
    isFetching: isFetchingPatient,
  } = useClinikoPatient(id ?? '');

  // Fetch patient appointments from Cliniko
  const {
    data: appointments,
    isLoading: isLoadingAppointments,
    isFetching: isFetchingAppointments,
    refetch: refetchAppointments,
  } = usePatientAppointments(id ?? '');

  // Fetch patient treatment notes from Cliniko
  const {
    data: treatmentNotes,
    isLoading: isLoadingNotes,
    isFetching: isFetchingNotes,
    refetch: refetchNotes,
  } = usePatientTreatmentNotes(id ?? '');
  
  // CRITICAL VALIDATION: Filter notes to only show those belonging to current patient
  // This is a safety check to prevent showing wrong patient's notes even if caching has issues
  const validatedNotes = React.useMemo(() => {
    if (!treatmentNotes || !id) return [];
    
    // Filter notes to ensure they belong to the current patient
    // Each treatment note should have a patient link that contains the patient ID
    return treatmentNotes.filter(note => {
      // Check if note has patient link that matches current patient ID
      const patientLink = note.patient?.links?.self;
      if (patientLink) {
        // Extract patient ID from link (e.g., "/patients/123456789")
        const linkPatientId = patientLink.split('/').pop();
        const matches = linkPatientId === id;
        if (!matches) {
          console.warn(`[PatientDetail] Note ${note.id} belongs to patient ${linkPatientId}, not ${id} - filtering out`);
        }
        return matches;
      }
      // If we can't verify patient ownership, exclude the note for safety
      console.warn(`[PatientDetail] Note ${note.id} has no patient link - filtering out for safety`);
      return false;
    });
  }, [treatmentNotes, id]);
  
  // CRITICAL VALIDATION: Filter appointments to only show those belonging to current patient
  const validatedAppointments = React.useMemo(() => {
    if (!appointments || !id) return [];
    
    return appointments.filter(apt => {
      const patientLink = apt.patient?.links?.self;
      if (patientLink) {
        const linkPatientId = patientLink.split('/').pop();
        const matches = linkPatientId === id;
        if (!matches) {
          console.warn(`[PatientDetail] Appointment ${apt.id} belongs to patient ${linkPatientId}, not ${id} - filtering out`);
        }
        return matches;
      }
      return false;
    });
  }, [appointments, id]);

  // Handle pull-to-refresh - refreshes patient, appointments, and notes
  const handleRefresh = useCallback(async () => {
    console.log('[PatientDetail] Pull-to-refresh triggered for patient:', id);
    setRefreshing(true);
    try {
      // Refetch all data in parallel
      await Promise.all([
        refetchPatient(),
        refetchAppointments(),
        refetchNotes(),
      ]);
      console.log('[PatientDetail] Refresh completed successfully');
    } catch (error) {
      console.error('[PatientDetail] Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [id, refetchPatient, refetchAppointments, refetchNotes]);

  // IMPORTANT: Only use noteData.patient if it matches the current patient ID
  // This prevents showing wrong patient's cached data
  const patient = React.useMemo(() => {
    // Always prefer the freshly fetched patient to ensure data accuracy
    if (clinikoPatient && clinikoPatient.id === id) {
      return {
        id: clinikoPatient.id,
        name: `${clinikoPatient.first_name} ${clinikoPatient.last_name}`.trim(),
        email: clinikoPatient.email ?? '',
        phone: clinikoPatient.phone_numbers?.[0]?.number ?? '',
        dateOfBirth: clinikoPatient.date_of_birth ?? '',
        lastAppointment: null,
      };
    }
    // Only use cached noteData.patient if ID matches AND we don't have clinikoPatient yet
    if (noteData.patient?.id === id) {
      return noteData.patient;
    }
    return null;
  }, [clinikoPatient, id, noteData.patient]);

  // Loading state - also show loading when switching patients
  if (isLoadingPatient || isSwitchingPatient) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Patient', headerBackTitle: 'Back' }} />
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
        <Stack.Screen options={{ title: 'Patient', headerBackTitle: 'Back' }} />
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
        <Stack.Screen options={{ title: 'Patient', headerBackTitle: 'Back' }} />
        <View style={styles.errorState}>
          <User size={48} color={colors.textSecondary} />
          <Text style={styles.errorText}>Patient not found</Text>
        </View>
      </View>
    );
  }

  const handleOpenQuickNoteSheet = () => {
    console.log('Opening quick note sheet for:', patient.name);
    // Pre-set the patient so it's ready when navigating to editor
    setPatient(patient);
    setQuickNoteSheetVisible(true);
  };

  const handleStartNote = (
    template: ClinikoTreatmentNoteTemplate,
    appointment?: ClinikoIndividualAppointment
  ) => {
    console.log('Starting note with template:', template.name);
    console.log('Linked appointment:', appointment?.id ?? 'none');
    
    // Set up the note context
    setTemplate(template);
    if (appointment) {
      setClinikoAppointment(appointment);
    }
    
    // Close the sheet and navigate directly to editor
    setQuickNoteSheetVisible(false);
    router.push('/note/editor');
  };

  // Separate appointments into upcoming and past
  // IMPORTANT: Using validatedAppointments to ensure correct patient data
  const now = new Date();
  const allAppointments = validatedAppointments;
  
  const upcomingAppointments = allAppointments
    .filter(apt => new Date(apt.starts_at) >= now && !apt.cancelled_at)
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
    .slice(0, 3);

  const pastAppointments = allAppointments
    .filter(apt => new Date(apt.starts_at) < now && !apt.cancelled_at)
    .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime())
    .slice(0, 5);

  // Get recent treatment notes (limit to 5)
  // IMPORTANT: Using validatedNotes to ensure correct patient data
  const recentNotes = validatedNotes
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: patient.name,
          headerBackTitle: 'Back',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Upcoming Appointments */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Calendar size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Upcoming Appointments</Text>
          </View>
          {isLoadingAppointments || isFetchingAppointments ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.textSecondary} />
              <Text style={styles.loadingRowText}>Loading...</Text>
            </View>
          ) : upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((apt, index) => (
              <View
                key={apt.id}
                style={[
                  styles.appointmentRow,
                  index < upcomingAppointments.length - 1 && styles.rowBorder,
                ]}
              >
                <Text style={styles.appointmentTime}>
                  {formatAppointmentDateTime(apt.starts_at)}
                </Text>
                {apt.notes && (
                  <Text style={styles.appointmentNotes} numberOfLines={1}>
                    {apt.notes}
                  </Text>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No upcoming appointments</Text>
          )}
        </Card>

        {/* Previous Appointments */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Clock size={18} color={colors.textSecondary} />
            <Text style={styles.cardTitle}>Previous Appointments</Text>
          </View>
          {isLoadingAppointments || isFetchingAppointments ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.textSecondary} />
              <Text style={styles.loadingRowText}>Loading...</Text>
            </View>
          ) : pastAppointments.length > 0 ? (
            pastAppointments.map((apt, index) => (
              <View
                key={apt.id}
                style={[
                  styles.appointmentRow,
                  index < pastAppointments.length - 1 && styles.rowBorder,
                ]}
              >
                <Text style={styles.pastAppointmentTime}>
                  {formatAppointmentDateTime(apt.starts_at)}
                </Text>
                {apt.notes && (
                  <Text style={styles.appointmentNotes} numberOfLines={1}>
                    {apt.notes}
                  </Text>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No previous appointments</Text>
          )}
        </Card>

        {/* Notes - Restructured with inline "New" button */}
        <Card style={styles.card}>
          <View style={styles.cardHeaderWithAction}>
            <View style={styles.cardHeaderLeft}>
              <FileText size={18} color={colors.primary} />
              <Text style={styles.cardTitle}>Notes</Text>
            </View>
            <TouchableOpacity
              style={styles.newNoteButton}
              onPress={handleOpenQuickNoteSheet}
              activeOpacity={0.7}
            >
              <Plus size={16} color={colors.primary} strokeWidth={2.5} />
              <Text style={styles.newNoteButtonText}>New</Text>
            </TouchableOpacity>
          </View>
          {isLoadingNotes || isFetchingNotes ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.textSecondary} />
              <Text style={styles.loadingRowText}>Loading notes...</Text>
            </View>
          ) : recentNotes.length > 0 ? (
            recentNotes.map((note, index) => (
              <TouchableOpacity
                key={note.id}
                style={[
                  styles.noteRow,
                  index < recentNotes.length - 1 && styles.rowBorder,
                ]}
                onPress={() => router.push(`/note/${note.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.noteInfo}>
                  <View style={styles.noteDateRow}>
                    <Text style={styles.noteDate}>
                      {formatNoteDate(note.created_at)}
                    </Text>
                    {note.draft ? (
                      <View style={styles.draftBadge}>
                        <Clock size={10} color={colors.textSecondary} />
                        <Text style={styles.draftBadgeText}>DRAFT</Text>
                      </View>
                    ) : (
                      <View style={styles.finalizedBadge}>
                        <CheckCircle size={10} color={colors.success} />
                        <Text style={styles.finalizedBadgeText}>FINAL</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.notePreview} numberOfLines={1}>
                    {note.content?.sections?.[0]?.name || 'Treatment Note'}
                  </Text>
                </View>
                <ChevronRight size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>No notes yet</Text>
          )}
        </Card>
      </ScrollView>

      {/* Quick Note Sheet - using validated appointments to ensure correct patient */}
      <QuickNoteSheet
        visible={quickNoteSheetVisible}
        onClose={() => setQuickNoteSheetVisible(false)}
        appointments={allAppointments}
        isLoadingAppointments={isLoadingAppointments || isFetchingAppointments}
        onStartNote={handleStartNote}
      />
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
  cardHeaderWithAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  newNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  newNoteButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  appointmentRow: {
    paddingVertical: spacing.sm,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  appointmentTime: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.textPrimary,
  },
  pastAppointmentTime: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  appointmentNotes: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  noteInfo: {
    flex: 1,
  },
  noteDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  noteDate: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.textPrimary,
  },
  draftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  draftBadgeText: {
    fontSize: 9,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  finalizedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.success + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  finalizedBadgeText: {
    fontSize: 9,
    fontWeight: '600' as const,
    color: colors.success,
    letterSpacing: 0.5,
  },
  notePreview: {
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
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontStyle: 'italic' as const,
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
