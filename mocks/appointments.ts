export interface Appointment {
  id: string;
  patientId: string;
  datetime: string;
  label: string;
  type: string;
}

export const appointments: Appointment[] = [
  {
    id: 'a1',
    patientId: '1',
    datetime: '2026-01-28T09:00:00',
    label: 'Today, 9:00 AM',
    type: 'Follow-up',
  },
  {
    id: 'a2',
    patientId: '1',
    datetime: '2026-01-25T14:30:00',
    label: '25 Jan, 2:30 PM',
    type: 'Treatment',
  },
  {
    id: 'a3',
    patientId: '2',
    datetime: '2026-01-28T10:30:00',
    label: 'Today, 10:30 AM',
    type: 'Initial Consultation',
  },
  {
    id: 'a4',
    patientId: '3',
    datetime: '2026-01-28T11:00:00',
    label: 'Today, 11:00 AM',
    type: 'Follow-up',
  },
  {
    id: 'a5',
    patientId: '4',
    datetime: '2026-01-29T09:00:00',
    label: 'Tomorrow, 9:00 AM',
    type: 'Treatment',
  },
];

export function getAppointmentsForPatient(patientId: string): Appointment[] {
  return appointments.filter(a => a.patientId === patientId);
}

export function formatAppointmentDateTime(datetime: string): string {
  const date = new Date(datetime);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const timeStr = date.toLocaleTimeString('en-AU', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (isToday) return `Today, ${timeStr}`;
  if (isTomorrow) return `Tomorrow, ${timeStr}`;

  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
  }) + `, ${timeStr}`;
}
