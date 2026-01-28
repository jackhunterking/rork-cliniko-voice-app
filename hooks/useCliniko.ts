/**
 * React Query Hooks for Cliniko API
 * Provides data fetching, caching, and state management for Cliniko resources
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import {
  getCurrentUser,
  listAppPatients,
  getPatient,
  listAppTemplates,
  listTreatmentNoteTemplates,
  getTreatmentNoteTemplate,
  listTreatmentNotes,
  getTreatmentNote,
  createTreatmentNote,
  updateTreatmentNote,
  getPatientAppointments,
  getTodayAppointments,
  getAppointmentsInRange,
  getAppointmentType,
  ListPatientsOptions,
  ListTemplatesOptions,
  ListNotesOptions,
  ClinikoUser,
  ClinikoPatient,
  ClinikoTreatmentNoteTemplate,
  ClinikoTreatmentNote,
  ClinikoIndividualAppointment,
  ClinikoAppointmentType,
  CreateTreatmentNotePayload,
  UpdateTreatmentNotePayload,
  AppPatient,
  AppTemplate,
  ClinikoError,
} from '@/services/cliniko';

// ============================================================================
// Query Keys
// ============================================================================

export const clinikoKeys = {
  all: ['cliniko'] as const,
  user: () => [...clinikoKeys.all, 'user'] as const,
  patients: () => [...clinikoKeys.all, 'patients'] as const,
  patientsList: (options?: ListPatientsOptions) => [...clinikoKeys.patients(), 'list', options] as const,
  patientDetail: (id: string) => [...clinikoKeys.patients(), 'detail', id] as const,
  templates: () => [...clinikoKeys.all, 'templates'] as const,
  templatesList: (options?: ListTemplatesOptions) => [...clinikoKeys.templates(), 'list', options] as const,
  templateDetail: (id: string) => [...clinikoKeys.templates(), 'detail', id] as const,
  appointments: () => [...clinikoKeys.all, 'appointments'] as const,
  appointmentsToday: () => [...clinikoKeys.appointments(), 'today'] as const,
  appointmentsPatient: (patientId: string) => [...clinikoKeys.appointments(), 'patient', patientId] as const,
  appointmentsCalendar: (daysBack: number, daysForward: number) => 
    [...clinikoKeys.appointments(), 'calendar', daysBack, daysForward] as const,
  appointmentTypes: () => [...clinikoKeys.all, 'appointmentTypes'] as const,
  appointmentTypeDetail: (id: string) => [...clinikoKeys.appointmentTypes(), 'detail', id] as const,
  notes: () => [...clinikoKeys.all, 'notes'] as const,
  patientNotes: (patientId: string) => [...clinikoKeys.notes(), 'patient', patientId] as const,
  noteDetail: (noteId: string) => [...clinikoKeys.notes(), 'detail', noteId] as const,
};

// ============================================================================
// User Hooks
// ============================================================================

/**
 * Fetch the currently authenticated Cliniko user
 */
export function useClinikoUser(options?: Omit<UseQueryOptions<ClinikoUser, ClinikoError>, 'queryKey' | 'queryFn'>) {
  return useQuery<ClinikoUser, ClinikoError>({
    queryKey: clinikoKeys.user(),
    queryFn: () => getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (previously cacheTime)
    retry: (failureCount, error) => {
      // Don't retry on 401 (invalid credentials)
      if (error.status === 401) return false;
      return failureCount < 2;
    },
    ...options,
  });
}

// ============================================================================
// Patient Hooks
// ============================================================================

/**
 * Fetch list of patients
 */
export function useClinikoPatients(
  options?: ListPatientsOptions,
  queryOptions?: Omit<UseQueryOptions<{ patients: AppPatient[]; totalEntries: number }, ClinikoError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<{ patients: AppPatient[]; totalEntries: number }, ClinikoError>({
    queryKey: clinikoKeys.patientsList(options),
    queryFn: () => listAppPatients(options),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      if (error.status === 401) return false;
      return failureCount < 2;
    },
    ...queryOptions,
  });
}

/**
 * Fetch a single patient by ID
 */
export function useClinikoPatient(
  patientId: string,
  queryOptions?: Omit<UseQueryOptions<ClinikoPatient, ClinikoError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ClinikoPatient, ClinikoError>({
    queryKey: clinikoKeys.patientDetail(patientId),
    queryFn: () => getPatient(patientId),
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...queryOptions,
  });
}

// ============================================================================
// Template Hooks
// ============================================================================

/**
 * Fetch list of treatment note templates (simplified for display)
 */
export function useClinikoTemplates(
  options?: ListTemplatesOptions,
  queryOptions?: Omit<UseQueryOptions<AppTemplate[], ClinikoError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<AppTemplate[], ClinikoError>({
    queryKey: clinikoKeys.templatesList(options),
    queryFn: () => listAppTemplates(options),
    staleTime: 5 * 60 * 1000, // 5 minutes - templates change less often
    gcTime: 30 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.status === 401) return false;
      return failureCount < 2;
    },
    ...queryOptions,
  });
}

/**
 * Fetch the full list of templates with all details
 */
export function useClinikoTemplatesFull(
  options?: ListTemplatesOptions,
  queryOptions?: Omit<UseQueryOptions<ClinikoTreatmentNoteTemplate[], ClinikoError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ClinikoTreatmentNoteTemplate[], ClinikoError>({
    queryKey: [...clinikoKeys.templatesList(options), 'full'],
    queryFn: async () => {
      const response = await listTreatmentNoteTemplates(options);
      return response.treatment_note_templates;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    ...queryOptions,
  });
}

/**
 * Fetch a single template by ID with full structure
 */
export function useClinikoTemplate(
  templateId: string | undefined,
  queryOptions?: Omit<UseQueryOptions<ClinikoTreatmentNoteTemplate, ClinikoError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ClinikoTreatmentNoteTemplate, ClinikoError>({
    queryKey: clinikoKeys.templateDetail(templateId ?? ''),
    queryFn: () => getTreatmentNoteTemplate(templateId!),
    enabled: !!templateId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    ...queryOptions,
  });
}

// ============================================================================
// Appointment Hooks
// ============================================================================

/**
 * Fetch today's appointments
 */
export function useTodayAppointments(
  queryOptions?: Omit<UseQueryOptions<ClinikoIndividualAppointment[], ClinikoError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ClinikoIndividualAppointment[], ClinikoError>({
    queryKey: clinikoKeys.appointmentsToday(),
    queryFn: () => getTodayAppointments(),
    staleTime: 1 * 60 * 1000, // 1 minute - appointments are time-sensitive
    gcTime: 5 * 60 * 1000,
    ...queryOptions,
  });
}

/**
 * Fetch appointments for a specific patient
 */
export function usePatientAppointments(
  patientId: string,
  queryOptions?: Omit<UseQueryOptions<ClinikoIndividualAppointment[], ClinikoError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ClinikoIndividualAppointment[], ClinikoError>({
    queryKey: clinikoKeys.appointmentsPatient(patientId),
    queryFn: () => getPatientAppointments(patientId),
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...queryOptions,
  });
}

/**
 * Fetch appointments within a date range for calendar view
 * Defaults to past 7 days through next 30 days
 */
export function usePractitionerAppointments(
  options: { daysBack?: number; daysForward?: number } = {},
  queryOptions?: Omit<UseQueryOptions<ClinikoIndividualAppointment[], ClinikoError>, 'queryKey' | 'queryFn'>
) {
  const { daysBack = 7, daysForward = 30 } = options;
  
  return useQuery<ClinikoIndividualAppointment[], ClinikoError>({
    queryKey: clinikoKeys.appointmentsCalendar(daysBack, daysForward),
    queryFn: () => getAppointmentsInRange({ daysBack, daysForward }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
    ...queryOptions,
  });
}

// ============================================================================
// Treatment Note Hooks
// ============================================================================

/**
 * Fetch treatment notes for a specific patient
 */
export function usePatientTreatmentNotes(
  patientId: string,
  queryOptions?: Omit<UseQueryOptions<ClinikoTreatmentNote[], ClinikoError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ClinikoTreatmentNote[], ClinikoError>({
    queryKey: clinikoKeys.patientNotes(patientId),
    queryFn: async () => {
      // Fetch ALL treatment notes (both drafts and finalized)
      const response = await listTreatmentNotes({ patientId });
      return response.treatment_notes;
    },
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...queryOptions,
  });
}

/**
 * Fetch a single treatment note by ID
 */
export function useTreatmentNote(
  noteId: string,
  queryOptions?: Omit<UseQueryOptions<ClinikoTreatmentNote, ClinikoError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ClinikoTreatmentNote, ClinikoError>({
    queryKey: clinikoKeys.noteDetail(noteId),
    queryFn: () => getTreatmentNote(noteId),
    enabled: !!noteId,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      // Don't retry on 401 (invalid credentials) or 404 (not found)
      if (error.status === 401 || error.status === 404) return false;
      return failureCount < 2;
    },
    ...queryOptions,
  });
}

// ============================================================================
// Appointment Type Hooks
// ============================================================================

/**
 * Fetch an appointment type by ID
 * Used to get the name of an appointment type (e.g., "First Appointment", "Standard Consultation")
 */
export function useClinikoAppointmentType(
  appointmentTypeId: string | undefined,
  queryOptions?: Omit<UseQueryOptions<ClinikoAppointmentType, ClinikoError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ClinikoAppointmentType, ClinikoError>({
    queryKey: clinikoKeys.appointmentTypeDetail(appointmentTypeId ?? ''),
    queryFn: () => getAppointmentType(appointmentTypeId!),
    enabled: !!appointmentTypeId,
    staleTime: 10 * 60 * 1000, // 10 minutes - appointment types rarely change
    gcTime: 30 * 60 * 1000,
    ...queryOptions,
  });
}

// ============================================================================
// Treatment Note Mutations
// ============================================================================

/**
 * Create a new treatment note
 */
export function useCreateTreatmentNote() {
  const queryClient = useQueryClient();

  return useMutation<ClinikoTreatmentNote, ClinikoError, CreateTreatmentNotePayload>({
    mutationFn: (payload) => createTreatmentNote(payload),
    onSuccess: () => {
      // Invalidate notes cache
      queryClient.invalidateQueries({ queryKey: clinikoKeys.notes() });
    },
  });
}

/**
 * Update an existing treatment note
 */
export function useUpdateTreatmentNote() {
  const queryClient = useQueryClient();

  return useMutation<
    ClinikoTreatmentNote,
    ClinikoError,
    { noteId: string; payload: UpdateTreatmentNotePayload }
  >({
    mutationFn: ({ noteId, payload }) => updateTreatmentNote(noteId, payload),
    onSuccess: (_, variables) => {
      // Invalidate notes list and the specific note detail
      queryClient.invalidateQueries({ queryKey: clinikoKeys.notes() });
      queryClient.invalidateQueries({ queryKey: clinikoKeys.noteDetail(variables.noteId) });
    },
  });
}

// ============================================================================
// Cache Management
// ============================================================================

/**
 * Hook to access the query client for cache management
 */
export function useClinikoCache() {
  const queryClient = useQueryClient();

  return {
    /**
     * Clear all Cliniko-related cache
     */
    clearAll: () => {
      queryClient.removeQueries({ queryKey: clinikoKeys.all });
    },

    /**
     * Invalidate all Cliniko queries (trigger refetch)
     */
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: clinikoKeys.all });
    },

    /**
     * Clear patients cache
     */
    clearPatients: () => {
      queryClient.removeQueries({ queryKey: clinikoKeys.patients() });
    },

    /**
     * Clear templates cache
     */
    clearTemplates: () => {
      queryClient.removeQueries({ queryKey: clinikoKeys.templates() });
    },

    /**
     * Prefetch a template
     */
    prefetchTemplate: (templateId: string) => {
      return queryClient.prefetchQuery({
        queryKey: clinikoKeys.templateDetail(templateId),
        queryFn: () => getTreatmentNoteTemplate(templateId),
        staleTime: 5 * 60 * 1000,
      });
    },
  };
}

// ============================================================================
// Error Helpers
// ============================================================================

/**
 * Check if an error is a Cliniko authentication error
 */
export function isClinikoAuthError(error: unknown): boolean {
  return error instanceof ClinikoError && error.status === 401;
}

/**
 * Check if an error is a Cliniko network/connectivity error
 */
export function isClinikoNetworkError(error: unknown): boolean {
  return error instanceof Error && 
    (error.message.includes('Network') || error.message.includes('fetch'));
}
