/**
 * Cliniko Service Module
 * Re-exports all Cliniko API functionality
 */

// Types
export * from './clinikoTypes';

// Client
export {
  clinikoFetch,
  clinikoGet,
  clinikoPost,
  clinikoPatch,
  clinikoDelete,
  validateClinikoCredentials,
  buildClinikoUrl,
  type ClinikoClientConfig,
} from './clinikoClient';

// Endpoints
export {
  // User
  getCurrentUser,
  // Patients
  listPatients,
  searchPatients,
  getPatient,
  listAppPatients,
  type ListPatientsOptions,
  // Templates
  listTreatmentNoteTemplates,
  getTreatmentNoteTemplate,
  listAppTemplates,
  type ListTemplatesOptions,
  // Notes
  listTreatmentNotes,
  getTreatmentNote,
  createTreatmentNote,
  updateTreatmentNote,
  type ListNotesOptions,
  // Appointments
  listIndividualAppointments,
  getPatientAppointments,
  getTodayAppointments,
  getAppointmentsInRange,
  type ListAppointmentsOptions,
  // Appointment Types
  getAppointmentType,
  extractAppointmentTypeIdFromLink,
} from './clinikoEndpoints';
