/**
 * Cliniko API Endpoints
 * Functions for interacting with specific Cliniko API resources
 */

import { clinikoGet, clinikoPost, clinikoPatch, ClinikoClientConfig } from './clinikoClient';
import {
  ClinikoUser,
  ClinikoPatient,
  ClinokoPatientsResponse,
  ClinikoTreatmentNoteTemplate,
  ClinikoTemplatesResponse,
  ClinikoTreatmentNote,
  ClinikoNotesResponse,
  ClinikoIndividualAppointment,
  ClinikoAppointmentsResponse,
  CreateTreatmentNotePayload,
  AppPatient,
  AppTemplate,
  clinikoPatientToAppPatient,
  clinikoTemplateToAppTemplate,
} from './clinikoTypes';

// ============================================================================
// User / Practitioner Endpoints
// ============================================================================

/**
 * Get the currently authenticated user
 */
export async function getCurrentUser(config?: ClinikoClientConfig): Promise<ClinikoUser> {
  return clinikoGet<ClinikoUser>('/user', config);
}

// ============================================================================
// Patient Endpoints
// ============================================================================

export interface ListPatientsOptions {
  page?: number;
  perPage?: number;
  query?: string;
  archived?: boolean;
}

/**
 * List patients with optional filtering
 */
export async function listPatients(
  options: ListPatientsOptions = {},
  config?: ClinikoClientConfig
): Promise<ClinokoPatientsResponse> {
  const params = new URLSearchParams();
  
  if (options.page) {
    params.append('page', String(options.page));
  }
  if (options.perPage) {
    params.append('per_page', String(options.perPage));
  }
  if (options.query) {
    // Cliniko search filter format
    params.append('q[]', `first_name:~${options.query}`);
    params.append('q[]', `last_name:~${options.query}`);
  }
  if (options.archived === false) {
    params.append('q[]', 'archived_at:=');
  }

  const queryString = params.toString();
  const endpoint = queryString ? `/patients?${queryString}` : '/patients';
  
  return clinikoGet<ClinokoPatientsResponse>(endpoint, config);
}

/**
 * Search patients by name (combined first + last name search)
 */
export async function searchPatients(
  searchTerm: string,
  config?: ClinikoClientConfig
): Promise<ClinokoPatientsResponse> {
  // Cliniko uses q[] filters for searching
  // We'll search in both first_name and last_name
  const encodedTerm = encodeURIComponent(searchTerm);
  const endpoint = `/patients?q[]=first_name:~${encodedTerm}&q[]=last_name:~${encodedTerm}`;
  
  return clinikoGet<ClinokoPatientsResponse>(endpoint, config);
}

/**
 * Get a single patient by ID
 */
export async function getPatient(
  patientId: string,
  config?: ClinikoClientConfig
): Promise<ClinikoPatient> {
  return clinikoGet<ClinikoPatient>(`/patients/${patientId}`, config);
}

/**
 * List patients and convert to app format
 */
export async function listAppPatients(
  options: ListPatientsOptions = {},
  config?: ClinikoClientConfig
): Promise<{ patients: AppPatient[]; totalEntries: number }> {
  const response = await listPatients(options, config);
  
  return {
    patients: response.patients.map(clinikoPatientToAppPatient),
    totalEntries: response.total_entries,
  };
}

// ============================================================================
// Treatment Note Template Endpoints
// ============================================================================

export interface ListTemplatesOptions {
  includeArchived?: boolean;
}

/**
 * List all treatment note templates
 */
export async function listTreatmentNoteTemplates(
  options: ListTemplatesOptions = {},
  config?: ClinikoClientConfig
): Promise<ClinikoTemplatesResponse> {
  let endpoint = '/treatment_note_templates';
  
  if (!options.includeArchived) {
    endpoint += '?q[]=archived_at:=';
  }
  
  return clinikoGet<ClinikoTemplatesResponse>(endpoint, config);
}

/**
 * Get a single treatment note template by ID
 */
export async function getTreatmentNoteTemplate(
  templateId: string,
  config?: ClinikoClientConfig
): Promise<ClinikoTreatmentNoteTemplate> {
  return clinikoGet<ClinikoTreatmentNoteTemplate>(`/treatment_note_templates/${templateId}`, config);
}

/**
 * List templates and convert to app format
 */
export async function listAppTemplates(
  options: ListTemplatesOptions = {},
  config?: ClinikoClientConfig
): Promise<AppTemplate[]> {
  const response = await listTreatmentNoteTemplates(options, config);
  return response.treatment_note_templates.map(clinikoTemplateToAppTemplate);
}

// ============================================================================
// Treatment Note Endpoints
// ============================================================================

export interface ListNotesOptions {
  patientId?: string;
  practitionerId?: string;
  draft?: boolean;
  page?: number;
  perPage?: number;
}

/**
 * List treatment notes with optional filtering
 */
export async function listTreatmentNotes(
  options: ListNotesOptions = {},
  config?: ClinikoClientConfig
): Promise<ClinikoNotesResponse> {
  const params = new URLSearchParams();
  
  if (options.patientId) {
    params.append('patient_id', options.patientId);
  }
  if (options.practitionerId) {
    params.append('practitioner_id', options.practitionerId);
  }
  if (options.draft !== undefined) {
    params.append('q[]', `draft:=${options.draft}`);
  }
  if (options.page) {
    params.append('page', String(options.page));
  }
  if (options.perPage) {
    params.append('per_page', String(options.perPage));
  }

  const queryString = params.toString();
  const endpoint = queryString ? `/treatment_notes?${queryString}` : '/treatment_notes';
  
  return clinikoGet<ClinikoNotesResponse>(endpoint, config);
}

/**
 * Get a single treatment note by ID
 */
export async function getTreatmentNote(
  noteId: string,
  config?: ClinikoClientConfig
): Promise<ClinikoTreatmentNote> {
  return clinikoGet<ClinikoTreatmentNote>(`/treatment_notes/${noteId}`, config);
}

/**
 * Create a new treatment note
 */
export async function createTreatmentNote(
  payload: CreateTreatmentNotePayload,
  config?: ClinikoClientConfig
): Promise<ClinikoTreatmentNote> {
  return clinikoPost<ClinikoTreatmentNote>('/treatment_notes', payload, config);
}

/**
 * Update an existing treatment note
 */
export async function updateTreatmentNote(
  noteId: string,
  payload: Partial<CreateTreatmentNotePayload>,
  config?: ClinikoClientConfig
): Promise<ClinikoTreatmentNote> {
  return clinikoPatch<ClinikoTreatmentNote>(`/treatment_notes/${noteId}`, payload, config);
}

// ============================================================================
// Appointment Endpoints
// ============================================================================

export interface ListAppointmentsOptions {
  patientId?: string;
  practitionerId?: string;
  startsAt?: { from?: string; to?: string };
  page?: number;
  perPage?: number;
}

/**
 * List individual appointments with optional filtering
 */
export async function listIndividualAppointments(
  options: ListAppointmentsOptions = {},
  config?: ClinikoClientConfig
): Promise<ClinikoAppointmentsResponse> {
  const params = new URLSearchParams();
  
  if (options.patientId) {
    params.append('patient_id', options.patientId);
  }
  if (options.practitionerId) {
    params.append('practitioner_id', options.practitionerId);
  }
  if (options.startsAt?.from) {
    params.append('q[]', `starts_at:>=${options.startsAt.from}`);
  }
  if (options.startsAt?.to) {
    params.append('q[]', `starts_at:<=${options.startsAt.to}`);
  }
  if (options.page) {
    params.append('page', String(options.page));
  }
  if (options.perPage) {
    params.append('per_page', String(options.perPage));
  }

  const queryString = params.toString();
  const endpoint = queryString ? `/individual_appointments?${queryString}` : '/individual_appointments';
  
  return clinikoGet<ClinikoAppointmentsResponse>(endpoint, config);
}

/**
 * Get appointments for a specific patient
 */
export async function getPatientAppointments(
  patientId: string,
  config?: ClinikoClientConfig
): Promise<ClinikoIndividualAppointment[]> {
  const response = await listIndividualAppointments({ patientId }, config);
  return response.individual_appointments;
}

/**
 * Get today's appointments
 */
export async function getTodayAppointments(
  config?: ClinikoClientConfig
): Promise<ClinikoIndividualAppointment[]> {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
  
  const response = await listIndividualAppointments({
    startsAt: { from: startOfDay, to: endOfDay },
  }, config);
  
  return response.individual_appointments;
}
