export interface TemplateField {
  id: string;
  label: string;
  placeholder: string;
}

export interface Template {
  id: string;
  name: string;
  fields: TemplateField[];
}

export const templates: Template[] = [
  {
    id: '1',
    name: 'Standard Treatment Note',
    fields: [
      { id: 'f1', label: 'Presenting Complaint', placeholder: 'Describe the patient\'s main complaint...' },
      { id: 'f2', label: 'Complaint History', placeholder: 'How and when did symptoms begin...' },
      { id: 'f3', label: 'Medical History', placeholder: 'Relevant medical history...' },
      { id: 'f4', label: 'Medication', placeholder: 'Current medications...' },
      { id: 'f5', label: 'Assessment', placeholder: 'Clinical findings and observations...' },
      { id: 'f6', label: 'Treatment', placeholder: 'Treatment provided today...' },
      { id: 'f7', label: 'Treatment Plan', placeholder: 'Recommended follow-up and plan...' },
    ],
  },
  {
    id: '2',
    name: 'Initial Consultation',
    fields: [
      { id: 'f1', label: 'Reason for Visit', placeholder: 'Why is the patient here today...' },
      { id: 'f2', label: 'Medical History', placeholder: 'Full medical history...' },
      { id: 'f3', label: 'Surgical History', placeholder: 'Previous surgeries...' },
      { id: 'f4', label: 'Family History', placeholder: 'Relevant family medical history...' },
      { id: 'f5', label: 'Social History', placeholder: 'Lifestyle factors...' },
      { id: 'f6', label: 'Current Medications', placeholder: 'All current medications and supplements...' },
      { id: 'f7', label: 'Allergies', placeholder: 'Known allergies...' },
      { id: 'f8', label: 'Physical Examination', placeholder: 'Examination findings...' },
      { id: 'f9', label: 'Assessment', placeholder: 'Clinical assessment...' },
      { id: 'f10', label: 'Plan', placeholder: 'Management plan...' },
    ],
  },
  {
    id: '3',
    name: 'Follow-up Note',
    fields: [
      { id: 'f1', label: 'Progress Since Last Visit', placeholder: 'Changes since last appointment...' },
      { id: 'f2', label: 'Current Symptoms', placeholder: 'Current symptom status...' },
      { id: 'f3', label: 'Assessment', placeholder: 'Today\'s findings...' },
      { id: 'f4', label: 'Treatment', placeholder: 'Treatment provided...' },
      { id: 'f5', label: 'Plan', placeholder: 'Next steps...' },
    ],
  },
  {
    id: '4',
    name: 'SOAP Note',
    fields: [
      { id: 'f1', label: 'Subjective', placeholder: 'Patient\'s symptoms and complaints...' },
      { id: 'f2', label: 'Objective', placeholder: 'Observable and measurable findings...' },
      { id: 'f3', label: 'Assessment', placeholder: 'Diagnosis or clinical impression...' },
      { id: 'f4', label: 'Plan', placeholder: 'Treatment and follow-up plan...' },
    ],
  },
];
