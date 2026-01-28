import { useState, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { Patient } from '@/mocks/patients';
import { Template } from '@/mocks/templates';
import { Appointment } from '@/mocks/appointments';

export interface NoteFieldValue {
  fieldId: string;
  label: string;
  value: string;
}

export interface NoteData {
  patient: Patient | null;
  template: Template | null;
  appointment: Appointment | null;
  copyPreviousNote: boolean;
  fieldValues: NoteFieldValue[];
}

const initialNoteData: NoteData = {
  patient: null,
  template: null,
  appointment: null,
  copyPreviousNote: false,
  fieldValues: [],
};

export const [NoteProvider, useNote] = createContextHook(() => {
  const [noteData, setNoteData] = useState<NoteData>(initialNoteData);

  const setPatient = useCallback((patient: Patient) => {
    console.log('Setting patient:', patient.name);
    setNoteData(prev => ({ ...prev, patient }));
  }, []);

  const setTemplate = useCallback((template: Template) => {
    console.log('Setting template:', template.name);
    const fieldValues = template.fields.map(field => ({
      fieldId: field.id,
      label: field.label,
      value: '',
    }));
    setNoteData(prev => ({ ...prev, template, fieldValues }));
  }, []);

  const setAppointment = useCallback((appointment: Appointment | null) => {
    console.log('Setting appointment:', appointment?.label ?? 'No appointment');
    setNoteData(prev => ({ ...prev, appointment }));
  }, []);

  const setCopyPreviousNote = useCallback((copy: boolean) => {
    console.log('Copy previous note:', copy);
    setNoteData(prev => ({ ...prev, copyPreviousNote: copy }));
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

  const filledFieldsCount = useMemo(() => {
    return noteData.fieldValues.filter(fv => fv.value.trim()).length;
  }, [noteData.fieldValues]);

  return {
    noteData,
    setPatient,
    setTemplate,
    setAppointment,
    setCopyPreviousNote,
    updateFieldValue,
    appendToField,
    replaceFieldValue,
    resetNote,
    isSetupComplete,
    filledFieldsCount,
  };
});
