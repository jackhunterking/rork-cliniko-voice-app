import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Calendar, Clock, AlertCircle, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueries } from '@tanstack/react-query';
import { colors, spacing, radius } from '@/constants/colors';
import { usePractitionerAppointments, clinikoKeys } from '@/hooks/useCliniko';
import { ClinikoIndividualAppointment, ClinikoPatient, getPatient } from '@/services/cliniko';

/**
 * Format time for appointment display
 */
function formatTime(datetime: string): string {
  const date = new Date(datetime);
  return date.toLocaleTimeString('en-AU', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).toLowerCase();
}

/**
 * Format date for section headers
 */
function formatSectionDate(date: Date, isPast: boolean): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);

  if (dateOnly.getTime() === today.getTime()) return 'Today';
  if (dateOnly.getTime() === tomorrow.getTime()) return 'Tomorrow';
  if (dateOnly.getTime() === yesterday.getTime()) return 'Yesterday';

  // Check if it's within this week (next 7 days for upcoming)
  const daysDiff = Math.floor((dateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (!isPast && daysDiff > 0 && daysDiff <= 7) {
    return date.toLocaleDateString('en-AU', { weekday: 'long' });
  }

  return date.toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Extract patient ID from patient link
 */
function extractPatientIdFromLink(link?: string): string | null {
  if (!link) return null;
  const match = link.match(/\/patients\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Group appointments by date
 */
interface AppointmentSection {
  title: string;
  date: Date;
  isPast: boolean;
  appointments: ClinikoIndividualAppointment[];
}

function groupAppointmentsByDate(appointments: ClinikoIndividualAppointment[]): {
  upcoming: AppointmentSection[];
  past: AppointmentSection[];
} {
  const upcomingSections: Map<string, AppointmentSection> = new Map();
  const pastSections: Map<string, AppointmentSection> = new Map();
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Sort appointments by date
  const sorted = [...appointments].sort(
    (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
  );

  for (const apt of sorted) {
    if (apt.cancelled_at) continue; // Skip cancelled appointments
    
    const aptDate = new Date(apt.starts_at);
    const dateKey = aptDate.toDateString();
    
    const sectionDate = new Date(aptDate);
    sectionDate.setHours(0, 0, 0, 0);
    const isPast = sectionDate < now;
    
    const targetMap = isPast ? pastSections : upcomingSections;
    
    if (!targetMap.has(dateKey)) {
      targetMap.set(dateKey, {
        title: formatSectionDate(sectionDate, isPast),
        date: sectionDate,
        isPast,
        appointments: [],
      });
    }
    
    targetMap.get(dateKey)!.appointments.push(apt);
  }

  // Sort upcoming by date ascending
  const upcoming = Array.from(upcomingSections.values())
    .sort((a, b) => a.date.getTime() - b.date.getTime());
    
  // Sort past by date descending (most recent first)
  const past = Array.from(pastSections.values())
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  return { upcoming, past };
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Fetch practitioner appointments
  const {
    data: appointments,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = usePractitionerAppointments({ daysBack: 7, daysForward: 30 });

  // Extract unique patient IDs from appointments
  const patientIds = useMemo(() => {
    if (!appointments) return [];
    const ids = new Set<string>();
    for (const apt of appointments) {
      const id = extractPatientIdFromLink(apt.patient?.links?.self);
      if (id) ids.add(id);
    }
    return Array.from(ids);
  }, [appointments]);

  // Fetch patient details for all appointments in parallel
  const patientQueries = useQueries({
    queries: patientIds.map(patientId => ({
      queryKey: clinikoKeys.patientDetail(patientId),
      queryFn: () => getPatient(patientId),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
    })),
  });

  // Create a map of patient ID to patient data
  const patientMap = useMemo(() => {
    const map = new Map<string, ClinikoPatient>();
    patientQueries.forEach((query, index) => {
      if (query.data) {
        map.set(patientIds[index], query.data);
      }
    });
    return map;
  }, [patientQueries, patientIds]);

  // Check if any patient queries are still loading
  const isLoadingPatients = patientQueries.some(q => q.isLoading);

  // Group appointments by date
  const { upcoming, past } = useMemo(() => {
    if (!appointments) return { upcoming: [], past: [] };
    return groupAppointmentsByDate(appointments);
  }, [appointments]);

  // Count stats
  const stats = useMemo(() => {
    const upcomingCount = upcoming.reduce((sum, s) => sum + s.appointments.length, 0);
    const pastCount = past.reduce((sum, s) => sum + s.appointments.length, 0);
    return { upcoming: upcomingCount, past: pastCount };
  }, [upcoming, past]);

  const handleAppointmentPress = (appointment: ClinikoIndividualAppointment) => {
    const patientId = extractPatientIdFromLink(appointment.patient?.links?.self);
    if (patientId) {
      console.log('Navigating to patient:', patientId);
      router.push(`/patient/${patientId}`);
    } else {
      console.warn('Could not extract patient ID from appointment');
    }
  };

  const getPatientName = (appointment: ClinikoIndividualAppointment): string => {
    const patientId = extractPatientIdFromLink(appointment.patient?.links?.self);
    if (!patientId) return 'Unknown Patient';
    
    const patient = patientMap.get(patientId);
    if (patient) {
      return `${patient.first_name} ${patient.last_name}`;
    }
    return 'Loading...';
  };

  const renderAppointmentRow = (apt: ClinikoIndividualAppointment, isPast: boolean, isLast: boolean) => {
    const patientName = getPatientName(apt);
    const patientId = extractPatientIdFromLink(apt.patient?.links?.self);
    const patient = patientId ? patientMap.get(patientId) : null;
    const initial = patient ? patient.first_name.charAt(0).toUpperCase() : '?';
    
    return (
      <TouchableOpacity
        key={apt.id}
        style={[
          styles.appointmentRow,
          isLast && styles.appointmentRowLast,
        ]}
        onPress={() => handleAppointmentPress(apt)}
        activeOpacity={0.7}
      >
        <View style={[
          styles.appointmentTime,
          isPast && styles.appointmentTimePast,
        ]}>
          <Text style={[
            styles.timeText,
            isPast && styles.timeTextPast,
          ]}>
            {formatTime(apt.starts_at)}
          </Text>
        </View>
        
        <View style={styles.appointmentContent}>
          <View style={styles.patientRow}>
            <View style={[
              styles.patientAvatar,
              isPast && styles.patientAvatarPast,
            ]}>
              <Text style={[
                styles.patientInitial,
                isPast && styles.patientInitialPast,
              ]}>
                {initial}
              </Text>
            </View>
            <Text style={[
              styles.patientName,
              isPast && styles.patientNamePast,
            ]} numberOfLines={1}>
              {patientName}
            </Text>
          </View>
          {apt.notes && (
            <Text style={styles.appointmentNotes} numberOfLines={1}>
              {apt.notes}
            </Text>
          )}
        </View>
        
        <ChevronRight size={18} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  const renderSection = (section: AppointmentSection) => (
    <View key={section.date.toISOString()} style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[
          styles.sectionTitle,
          section.isPast && styles.sectionTitlePast,
        ]}>
          {section.title}
        </Text>
        {section.isPast && (
          <Clock size={14} color={colors.textSecondary} />
        )}
      </View>

      <View style={styles.appointmentCard}>
        {section.appointments.map((apt, aptIndex) => 
          renderAppointmentRow(apt, section.isPast, aptIndex === section.appointments.length - 1)
        )}
      </View>
    </View>
  );

  const hasNoAppointments = !isLoading && !isError && upcoming.length === 0 && past.length === 0;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Appointments</Text>
          {!isLoading && !isError && (
            <Text style={styles.headerSubtitle}>
              {stats.upcoming} upcoming • {stats.past} past
            </Text>
          )}
        </View>

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading appointments...</Text>
          </View>
        )}

        {/* Error State */}
        {isError && (
          <View style={styles.errorContainer}>
            <AlertCircle size={48} color={colors.error} />
            <Text style={styles.errorTitle}>Failed to load appointments</Text>
            <Text style={styles.errorMessage}>
              {error?.message || 'Please check your connection and try again.'}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State */}
        {hasNoAppointments && (
          <View style={styles.emptyContainer}>
            <Calendar size={48} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No appointments</Text>
            <Text style={styles.emptyMessage}>
              Your upcoming and recent appointments will appear here when scheduled.
            </Text>
          </View>
        )}

        {/* Upcoming Appointments */}
        {!isLoading && !isError && upcoming.length > 0 && (
          <View style={styles.groupContainer}>
            <Text style={styles.groupTitle}>Upcoming</Text>
            {upcoming.map(section => renderSection(section))}
          </View>
        )}

        {/* Past Appointments */}
        {!isLoading && !isError && past.length > 0 && (
          <View style={styles.groupContainer}>
            <Text style={[styles.groupTitle, styles.groupTitlePast]}>Past</Text>
            {past.map(section => renderSection(section))}
          </View>
        )}

        {/* Loading patients indicator */}
        {isLoadingPatients && !isLoading && (
          <View style={styles.patientsLoadingBar}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.patientsLoadingText}>Loading patient details...</Text>
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 3,
  },
  loadingText: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  errorMessage: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 3,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptyMessage: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  groupContainer: {
    marginBottom: spacing.lg,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.primary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  groupTitlePast: {
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  sectionTitlePast: {
    color: colors.textSecondary,
  },
  appointmentCard: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  appointmentRowLast: {
    borderBottomWidth: 0,
  },
  appointmentTime: {
    width: 70,
    paddingRight: spacing.sm,
  },
  appointmentTimePast: {
    opacity: 0.7,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  timeTextPast: {
    color: colors.textSecondary,
  },
  appointmentContent: {
    flex: 1,
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  patientAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientAvatarPast: {
    backgroundColor: colors.backgroundSecondary,
  },
  patientInitial: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  patientInitialPast: {
    color: colors.textSecondary,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.textPrimary,
    flex: 1,
  },
  patientNamePast: {
    color: colors.textSecondary,
  },
  appointmentNotes: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    marginLeft: 40,
  },
  patientsLoadingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  patientsLoadingText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
