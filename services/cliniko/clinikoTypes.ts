/**
 * Cliniko API TypeScript Interfaces
 * Based on Cliniko OpenAPI documentation
 */

// ============================================================================
// Shard Configuration
// ============================================================================

export type ClinikoShard = 'au1' | 'au2' | 'au3' | 'uk1' | 'ca1' | 'us1';

export interface ClinikoShardConfig {
  id: ClinikoShard;
  label: string;
  region: string;
  baseUrl: string;
}

export const CLINIKO_SHARDS: ClinikoShardConfig[] = [
  { id: 'au1', label: 'Australia (AU1)', region: 'Australia', baseUrl: 'https://api.au1.cliniko.com/v1' },
  { id: 'au2', label: 'Australia (AU2)', region: 'Australia', baseUrl: 'https://api.au2.cliniko.com/v1' },
  { id: 'au3', label: 'Australia (AU3)', region: 'Australia', baseUrl: 'https://api.au3.cliniko.com/v1' },
  { id: 'uk1', label: 'United Kingdom (UK1)', region: 'United Kingdom', baseUrl: 'https://api.uk1.cliniko.com/v1' },
  { id: 'ca1', label: 'Canada (CA1)', region: 'Canada', baseUrl: 'https://api.ca1.cliniko.com/v1' },
  { id: 'us1', label: 'United States (US1)', region: 'United States', baseUrl: 'https://api.us1.cliniko.com/v1' },
];

export function getShardBaseUrl(shard: ClinikoShard): string {
  const config = CLINIKO_SHARDS.find(s => s.id === shard);
  return config?.baseUrl ?? CLINIKO_SHARDS[0].baseUrl;
}

// ============================================================================
// Common Types
// ============================================================================

export interface ClinikoLinks {
  self: string;
}

export interface ClinokoPaginationLinks {
  self: string;
  next?: string;
  previous?: string;
}

export interface ClinikoListResponse<T> {
  links: ClinokoPaginationLinks;
  total_entries: number;
  [key: string]: T[] | ClinokoPaginationLinks | number;
}

// ============================================================================
// User / Practitioner Types
// ============================================================================

export interface ClinikoUser {
  id: string;
  created_at: string;
  updated_at: string;
  email: string;
  first_name: string;
  last_name: string;
  time_zone: string;
  links: ClinikoLinks;
}

export interface ClinokoPractitioner {
  id: string;
  created_at: string;
  updated_at: string;
  active: boolean;
  designation: string | null;
  first_name: string;
  last_name: string;
  show_in_online_bookings: boolean;
  title: string | null;
  user?: {
    links: ClinikoLinks;
  };
  links: ClinikoLinks;
}

// ============================================================================
// Patient Types
// ============================================================================

export interface ClinikoPatient {
  id: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  date_of_birth: string | null;
  email: string | null;
  first_name: string;
  last_name: string;
  title: string | null;
  gender: string | null;
  address_1: string | null;
  address_2: string | null;
  address_3: string | null;
  city: string | null;
  country: string | null;
  post_code: string | null;
  state: string | null;
  phone_numbers: ClinikoPhoneNumber[];
  medicare: string | null;
  patient_phone_numbers?: {
    links: ClinikoLinks;
  };
  links: ClinikoLinks;
}

export interface ClinikoPhoneNumber {
  number: string;
  phone_type: 'Mobile' | 'Home' | 'Work' | 'Fax' | 'Other';
}

export interface ClinokoPatientsResponse extends ClinikoListResponse<ClinikoPatient> {
  patients: ClinikoPatient[];
}

// ============================================================================
// Treatment Note Template Types
// ============================================================================

export type ClinikoQuestionType =
  | 'text'
  | 'paragraph'
  | 'checkboxes'
  | 'radiobuttons'
  | 'date'
  | 'body_chart'
  | 'signature'
  | 'title'
  | 'divider';

/**
 * Voice-fillable question types are those that can accept text input from voice transcription
 */
export const VOICE_FILLABLE_TYPES: ClinikoQuestionType[] = ['text', 'paragraph'];

export function isVoiceFillable(type: ClinikoQuestionType): boolean {
  return VOICE_FILLABLE_TYPES.includes(type);
}

export interface ClinikoTemplateQuestion {
  name: string;
  type: ClinikoQuestionType;
  // Additional properties based on type
  answers?: ClinikoTemplateAnswer[]; // For checkboxes/radiobuttons
  other?: boolean; // For checkboxes/radiobuttons - allows "other" option
}

export interface ClinikoTemplateAnswer {
  value: string;
}

export interface ClinikoTemplateSection {
  name: string;
  description?: string;
  questions: ClinikoTemplateQuestion[];
}

export interface ClinikoTemplateContent {
  sections: ClinikoTemplateSection[];
}

export interface ClinikoTemplatePrintSettings {
  include_patient_address?: boolean;
  include_patient_dob?: boolean;
  include_patient_medicare?: boolean;
  include_patient_occupation?: boolean;
  include_patient_reference_number?: boolean;
  title?: string;
}

export interface ClinikoTreatmentNoteTemplate {
  id: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  deleted_at: string | null;
  name: string;
  content: ClinikoTemplateContent;
  print_settings?: ClinikoTemplatePrintSettings;
  links: ClinikoLinks;
}

export interface ClinikoTemplatesResponse extends ClinikoListResponse<ClinikoTreatmentNoteTemplate> {
  treatment_note_templates: ClinikoTreatmentNoteTemplate[];
}

// ============================================================================
// Treatment Note Types
// ============================================================================

/**
 * Question format for CREATE/UPDATE treatment notes via API.
 * 
 * Based on Cliniko OpenAPI documentation curl example:
 * {
 *   "answer": "string",
 *   "name": "string", 
 *   "type": "text"
 * }
 * 
 * IMPORTANT: 
 * - 'answer' must NOT be empty - only include questions with actual content
 * - 'type' should be "text" regardless of template's original type
 */
export interface ClinikoNoteQuestion {
  answer: string;
  name: string;
  type: 'text';  // Always "text" per API docs example
}

export interface ClinikoNoteSection {
  name?: string;
  description?: string;
  questions: ClinikoNoteQuestion[];
}

export interface ClinikoNoteContent {
  sections: ClinikoNoteSection[];
}

export interface ClinikoTreatmentNote {
  id: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  deleted_at: string | null;
  draft: boolean;
  content: ClinikoNoteContent;
  patient?: {
    links: ClinikoLinks;
  };
  treatment_note_template?: {
    links: ClinikoLinks;
  };
  attendee?: {
    links: ClinikoLinks;
  };
  booking?: {
    links: ClinikoLinks;
  };
  practitioner?: {
    links: ClinikoLinks;
  };
  links: ClinikoLinks;
}

export interface CreateTreatmentNotePayload {
  attendee_id?: string;
  booking_id?: string;
  content: ClinikoNoteContent;
  draft?: boolean;
  patient_id: string;
  treatment_note_template_id: string;
}

/**
 * Payload for updating an existing treatment note via PATCH.
 * All fields are optional - only specified fields will be updated.
 */
export interface UpdateTreatmentNotePayload {
  content?: ClinikoNoteContent;
  draft?: boolean;
  title?: string;
  author_name?: string | null;
}

export interface ClinikoNotesResponse extends ClinikoListResponse<ClinikoTreatmentNote> {
  treatment_notes: ClinikoTreatmentNote[];
}

// ============================================================================
// Appointment Types
// ============================================================================

export interface ClinikoIndividualAppointment {
  id: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  cancelled_at: string | null;
  booking_ip_address: string | null;
  cancellation_note: string | null;
  cancellation_reason: number | null;
  did_not_arrive: boolean;
  email_reminder_sent: boolean;
  ends_at: string;
  invoice_status: number | null;
  notes: string | null;
  online_booking_policy_accepted: boolean;
  patient_arrived: boolean;
  repeat_rule: string | null;
  sms_reminder_sent: boolean;
  starts_at: string;
  treatment_note_status: number | null;
  appointment_type?: {
    links: ClinikoLinks;
  };
  attendee?: {
    links: ClinikoLinks;
  };
  business?: {
    links: ClinikoLinks;
  };
  patient?: {
    links: ClinikoLinks;
  };
  practitioner?: {
    links: ClinikoLinks;
  };
  links: ClinikoLinks;
}

export interface ClinikoAppointmentsResponse extends ClinikoListResponse<ClinikoIndividualAppointment> {
  individual_appointments: ClinikoIndividualAppointment[];
}

// ============================================================================
// Appointment Type Types
// ============================================================================

export interface ClinikoAppointmentType {
  id: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  category: string | null;
  color: string | null;
  default_billable_item_id: string | null;
  description: string | null;
  duration_in_minutes: number;
  max_attendees: number;
  name: string;
  show_in_online_bookings: boolean;
  treatment_note_template?: {
    links: ClinikoLinks;
  };
  links: ClinikoLinks;
}

export interface ClinikoAppointmentTypesResponse extends ClinikoListResponse<ClinikoAppointmentType> {
  appointment_types: ClinikoAppointmentType[];
}

// ============================================================================
// Error Types
// ============================================================================

export interface ClinikoApiError {
  status: number;
  message: string;
  // Cliniko can return errors as either strings or string arrays
  errors?: Record<string, string | string[]>;
}

export class ClinikoError extends Error {
  status: number;
  errors?: Record<string, string | string[]>;

  constructor(error: ClinikoApiError) {
    super(error.message);
    this.name = 'ClinikoError';
    this.status = error.status;
    this.errors = error.errors;
  }
}

// ============================================================================
// App-Level Types (for internal use)
// ============================================================================

/**
 * Simplified patient type for app use
 */
export interface AppPatient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  lastAppointment: string | null;
}

/**
 * Simplified template for list display
 */
export interface AppTemplate {
  id: string;
  name: string;
  sectionCount: number;
  questionCount: number;
  voiceFillableCount: number;
}

/**
 * Flattened field for note editing UI
 */
export interface AppNoteField {
  id: string; // Generated: sectionIndex_questionIndex
  sectionName: string;
  sectionIndex: number;
  questionName: string;
  questionIndex: number;
  questionType: ClinikoQuestionType;
  isVoiceFillable: boolean;
  value: string;
}

// ============================================================================
// Conversion Helpers
// ============================================================================

export function clinikoPatientToAppPatient(patient: ClinikoPatient): AppPatient {
  const mobilePhone = patient.phone_numbers?.find(p => p.phone_type === 'Mobile');
  const anyPhone = patient.phone_numbers?.[0];

  return {
    id: patient.id,
    name: `${patient.first_name} ${patient.last_name}`.trim(),
    email: patient.email,
    phone: mobilePhone?.number ?? anyPhone?.number ?? null,
    dateOfBirth: patient.date_of_birth,
    lastAppointment: null, // Will be populated separately if needed
  };
}

export function clinikoTemplateToAppTemplate(template: ClinikoTreatmentNoteTemplate): AppTemplate {
  let questionCount = 0;
  let voiceFillableCount = 0;

  const sections = template.content?.sections;
  if (sections && Array.isArray(sections)) {
    for (const section of sections) {
      const questions = section?.questions;
      if (questions && Array.isArray(questions)) {
        for (const question of questions) {
          questionCount++;
          if (question?.type && isVoiceFillable(question.type)) {
            voiceFillableCount++;
          }
        }
      }
    }
  }

  return {
    id: template.id,
    name: template.name,
    sectionCount: sections?.length ?? 0,
    questionCount,
    voiceFillableCount,
  };
}

export function flattenTemplateToFields(template: ClinikoTreatmentNoteTemplate): AppNoteField[] {
  const fields: AppNoteField[] = [];
  
  const sections = template.content?.sections;
  if (!sections || !Array.isArray(sections)) return fields;

  sections.forEach((section, sectionIndex) => {
    const questions = section?.questions;
    if (!questions || !Array.isArray(questions)) return;
    
    questions.forEach((question, questionIndex) => {
      if (!question) return;
      
      fields.push({
        id: `${sectionIndex}_${questionIndex}`,
        sectionName: section.name ?? '',
        sectionIndex,
        questionName: question.name ?? '',
        questionIndex,
        questionType: question.type,
        isVoiceFillable: isVoiceFillable(question.type),
        value: '',
      });
    });
  });

  return fields;
}

/**
 * Converts app field values to Cliniko note content format.
 * 
 * Based on Cliniko OpenAPI documentation curl example:
 * {
 *   "content": {
 *     "sections": [
 *       {
 *         "name": "string",
 *         "description": "string",
 *         "questions": [
 *           {
 *             "answer": "string",
 *             "name": "string",
 *             "type": "text"
 *           }
 *         ]
 *       }
 *     ]
 *   }
 * }
 * 
 * IMPORTANT:
 * - Questions must be objects with {answer, name, type: "text"}
 * - 'answer' must NOT be empty - only include questions with actual content
 * - We filter out questions without answers since API rejects empty answers
 */
export function fieldsToNoteContent(
  template: ClinikoTreatmentNoteTemplate,
  fields: AppNoteField[]
): ClinikoNoteContent {
  const templateSections = template.content?.sections;
  if (!templateSections || !Array.isArray(templateSections)) {
    return { sections: [] };
  }
  
  const sections: ClinikoNoteSection[] = templateSections.map((section, sectionIndex) => {
    const templateQuestions = section?.questions;
    
    // Convert each question to object format, filtering out empty answers
    const questions: ClinikoNoteQuestion[] = (templateQuestions && Array.isArray(templateQuestions))
      ? templateQuestions
          .map((question, questionIndex) => {
            const field = fields.find(f => f.sectionIndex === sectionIndex && f.questionIndex === questionIndex);
            const answerValue = field?.value?.trim() ?? '';
            
            // Only include questions with actual answers
            if (!answerValue) {
              return null;
            }
            
            return {
              answer: answerValue,
              name: question?.name ?? '',
              type: 'text' as const,  // API requires type: "text"
            };
          })
          .filter((q): q is ClinikoNoteQuestion => q !== null)
      : [];

    return {
      name: section?.name,
      description: section?.description,
      questions,
    };
  });

  return { sections };
}
