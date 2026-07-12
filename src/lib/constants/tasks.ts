export const TASK_CATEGORIES = [
  'routine',
  'health',
  'work',
  'date',
  'shopping',
  'groceries',
  'errands',
  'education',
  'finance',
  'social',
  'travel',
  'home',
  'maintenance',
  'personal',
  'hobbies',
  'selfcare',
  'family',
  'pets',
  'bills',
  'appointments',
  'school'
] as const

export type TaskCategory = (typeof TASK_CATEGORIES)[number]

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  routine: 'Routine',
  health: 'Health',
  work: 'Work',
  date: 'Date',
  shopping: 'Shopping',
  groceries: 'Groceries',
  errands: 'Errands',
  education: 'Education',
  finance: 'Finance',
  social: 'Social',
  travel: 'Travel',
  home: 'Home',
  maintenance: 'Maintenance',
  personal: 'Personal',
  hobbies: 'Hobbies',
  selfcare: 'Self-care',
  family: 'Family',
  pets: 'Pets',
  bills: 'Bills',
  appointments: 'Appointments',
  school: 'School'
}