export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  lastAppointment: string | null;
}

export const patients: Patient[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+61 412 345 678',
    dateOfBirth: '1985-03-15',
    lastAppointment: '2026-01-25',
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'mchen@email.com',
    phone: '+61 423 456 789',
    dateOfBirth: '1978-07-22',
    lastAppointment: '2026-01-24',
  },
  {
    id: '3',
    name: 'Emma Williams',
    email: 'emma.w@email.com',
    phone: '+61 434 567 890',
    dateOfBirth: '1992-11-08',
    lastAppointment: '2026-01-20',
  },
  {
    id: '4',
    name: 'James Taylor',
    email: 'jtaylor@email.com',
    phone: '+61 445 678 901',
    dateOfBirth: '1965-05-30',
    lastAppointment: '2026-01-18',
  },
  {
    id: '5',
    name: 'Olivia Brown',
    email: 'olivia.b@email.com',
    phone: '+61 456 789 012',
    dateOfBirth: '1999-01-12',
    lastAppointment: null,
  },
  {
    id: '6',
    name: 'William Davis',
    email: 'wdavis@email.com',
    phone: '+61 467 890 123',
    dateOfBirth: '1982-09-03',
    lastAppointment: '2026-01-15',
  },
  {
    id: '7',
    name: 'Sophie Martinez',
    email: 'sophie.m@email.com',
    phone: '+61 478 901 234',
    dateOfBirth: '1995-12-20',
    lastAppointment: '2026-01-10',
  },
];

export function formatDate(dateString: string | null): string {
  if (!dateString) return 'No appointments';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
