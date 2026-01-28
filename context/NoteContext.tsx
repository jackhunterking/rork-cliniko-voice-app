import { useState, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import {
  ClinikoTreatmentNoteTemplate,
  ClinikoTreatmentNote,
  ClinikoIndividualAppointment,
  AppNoteField,
  flattenTemplateToFields,
  fieldsToNoteContent,
  isVoiceFillable,
  ClinikoNoteContent,
} from '@/services/cliniko';

// Legacy Patient type for backward compatibility
export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  lastAppointment: string | null;
}

// Legacy Appointment type for backward compatibility
export interface Appointment {
  id: string;
  patientId: string;
  datetime: string;
  label: string;
  type: string;
}

export interface NoteFieldValue {
  fieldId: string;
  label: string;
  value: string;
  sectionName: string;
  questionType: string;
  isVoiceFillable: boolean;
}

export interface NoteData {
  patient: Patient | null;
  template: ClinikoTreatmentNoteTemplate | null;
  appointment: Appointment | null;
  clinikoAppointment: ClinikoIndividualAppointment | null;
  appointmentTypeName: string | null;
  fieldValues: NoteFieldValue[];
  /** If set, we are editing an existing note rather than creating a new one */
  editingNoteId: string | null;
}

const initialNoteData: NoteData = {
  patient: null,
  template: null,
  appointment: null,
  clinikoAppointment: null,
  appointmentTypeName: null,
  fieldValues: [],
  editingNoteId: null,
};

export const [NoteProvider, useNote] = createContextHook(() => {
  const [noteData, setNoteData] = useState<NoteData>(initialNoteData);

  const setPatient = useCallback((patient: Patient) => {
    setNoteData(prev => ({ ...prev, patient }));
  }, []);

  /**
   * Set the Cliniko template and generate field values from its structure
   */
  const setTemplate = useCallback((template: ClinikoTreatmentNoteTemplate) => {
    // Flatten template structure to field values
    const appFields = flattenTemplateToFields(template);
    
    const fieldValues: NoteFieldValue[] = appFields.map(field => ({
      fieldId: field.id,
      label: field.questionName,
      value: '',
      sectionName: field.sectionName,
      questionType: field.questionType,
      isVoiceFillable: field.isVoiceFillable,
    }));

    setNoteData(prev => ({ ...prev, template, fieldValues }));
  }, []);

  /**
   * Load an existing treatment note for editing.
   * Pre-populates field values from the note's content.
   */
  const loadExistingNote = useCallback((
    note: ClinikoTreatmentNote,
    template: ClinikoTreatmentNoteTemplate,
    patient: Patient
  ) => {
    // Flatten template structure to get the field definitions
    const appFields = flattenTemplateToFields(template);
    
    // Create field values and populate them from the note's content
    const fieldValues: NoteFieldValue[] = appFields.map(field => {
      // Try to find the matching answer in the note's content
      let existingValue = '';
      
      const sections = note.content?.sections;
      if (sections && Array.isArray(sections)) {
        const section = sections[field.sectionIndex];
        if (section && section.questions && Array.isArray(section.questions)) {
          const question = section.questions[field.questionIndex];
          if (question && typeof question === 'object') {
            // Question can have 'answer' property
            existingValue = (question as { answer?: string }).answer || '';
          }
        }
      }

      return {
        fieldId: field.id,
        label: field.questionName,
        value: existingValue,
        sectionName: field.sectionName,
        questionType: field.questionType,
        isVoiceFillable: field.isVoiceFillable,
      };
    });

    setNoteData({
      patient,
      template,
      appointment: null,
      clinikoAppointment: null,
      appointmentTypeName: null,
      fieldValues,
      editingNoteId: note.id,
    });
  }, []);

  /**
   * Clear the editing state (return to create mode)
   */
  const clearEditingMode = useCallback(() => {
    setNoteData(prev => ({ ...prev, editingNoteId: null }));
  }, []);

  const setAppointment = useCallback((appointment: Appointment | null) => {
    setNoteData(prev => ({ ...prev, appointment }));
  }, []);

  const setClinikoAppointment = useCallback((appointment: ClinikoIndividualAppointment | null) => {
    setNoteData(prev => ({ ...prev, clinikoAppointment: appointment }));
  }, []);

  const setAppointmentTypeName = useCallback((name: string | null) => {
    setNoteData(prev => ({ ...prev, appointmentTypeName: name }));
  }, []);

  const updateFieldValue = useCallback((fieldId: string, value: string) => {
    setNoteData(prev => ({
      ...prev,
      fieldValues: prev.fieldValues.map(fv =>
        fv.fieldId === fieldId ? { ...fv, value } : fv
      ),
    }));
  }, []);

  const appendToField = useCallback((fieldId: string, text: string) => {
    setNoteData(prev => ({
      ...prev,
      fieldValues: prev.fieldValues.map(fv =>
        fv.fieldId === fieldId
          ? { ...fv, value: fv.value ? `${fv.value} ${text}` : text }
          : fv
      ),
    }));
  }, []);

  const replaceFieldValue = useCallback((fieldId: string, text: string) => {
    setNoteData(prev => ({
      ...prev,
      fieldValues: prev.fieldValues.map(fv =>
        fv.fieldId === fieldId ? { ...fv, value: text } : fv
      ),
    }));
  }, []);

  const resetNote = useCallback(() => {
    console.log('Resetting note data');
    setNoteData(initialNoteData);
  }, []);

  const isSetupComplete = useMemo(() => {
    return noteData.patient !== null && noteData.template !== null;
  }, [noteData.patient, noteData.template]);

  /**
   * Whether we are in edit mode (editing existing note) vs create mode
   */
  const isEditMode = useMemo(() => {
    return noteData.editingNoteId !== null;
  }, [noteData.editingNoteId]);

  const filledFieldsCount = useMemo(() => {
    return noteData.fieldValues.filter(fv => fv.value.trim()).length;
  }, [noteData.fieldValues]);

  /**
   * Get only voice-fillable fields
   */
  const voiceFillableFields = useMemo(() => {
    return noteData.fieldValues.filter(fv => fv.isVoiceFillable);
  }, [noteData.fieldValues]);

  /**
   * Get fields grouped by section
   */
  const fieldsBySection = useMemo(() => {
    const sections: { name: string; fields: NoteFieldValue[] }[] = [];
    
    for (const field of noteData.fieldValues) {
      const existingSection = sections.find(s => s.name === field.sectionName);
      if (existingSection) {
        existingSection.fields.push(field);
      } else {
        sections.push({ name: field.sectionName, fields: [field] });
      }
    }
    
    return sections;
  }, [noteData.fieldValues]);

  /**
   * Convert current field values to Cliniko note content structure
   */
  const toClinikoNoteContent = useCallback((): ClinikoNoteContent | null => {
    if (!noteData.template) return null;
    
    // Convert our flat field values back to the template structure
    const appFields: AppNoteField[] = noteData.fieldValues.map(fv => {
      // Parse the field ID to get section and question indices
      const [sectionIndex, questionIndex] = fv.fieldId.split('_').map(Number);
      return {
        id: fv.fieldId,
        sectionName: fv.sectionName,
        sectionIndex,
        questionName: fv.label,
        questionIndex,
        questionType: fv.questionType as any,
        isVoiceFillable: fv.isVoiceFillable,
        value: fv.value,
      };
    });
    
    return fieldsToNoteContent(noteData.template, appFields);
  }, [noteData.template, noteData.fieldValues]);

  /**
   * Get template summary info
   */
  const templateSummary = useMemo(() => {
    if (!noteData.template) return null;

    const totalQuestions = noteData.fieldValues.length;
    const voiceFillable = noteData.fieldValues.filter(f => f.isVoiceFillable).length;
    const nonVoiceFillable = totalQuestions - voiceFillable;

    const sections = noteData.template.content?.sections;
    const sectionCount = (sections && Array.isArray(sections)) ? sections.length : 0;

    return {
      name: noteData.template.name,
      sectionCount,
      totalQuestions,
      voiceFillable,
      nonVoiceFillable,
    };
  }, [noteData.template, noteData.fieldValues]);

  return {
    noteData,
    setPatient,
    setTemplate,
    loadExistingNote,
    clearEditingMode,
    setAppointment,
    setClinikoAppointment,
    setAppointmentTypeName,
    updateFieldValue,
    appendToField,
    replaceFieldValue,
    resetNote,
    isSetupComplete,
    isEditMode,
    filledFieldsCount,
    voiceFillableFields,
    fieldsBySection,
    toClinikoNoteContent,
    templateSummary,
  };
});
