// Define menu item types for better type safety
export type MenuAction = 'create' | 'find';
export type EntityType = 'patient' | 'appointment' | 'treatment';
export type MenuItem = `${MenuAction}-${EntityType}`;

// Constants for menu items to avoid duplication and typos
export const MENU_ITEMS = {
  CREATE_PATIENT: 'create-patient' as MenuItem,
  CREATE_APPOINTMENT: 'create-appointment' as MenuItem,
  CREATE_TREATMENT: 'create-treatment' as MenuItem,
  FIND_PATIENT: 'find-patient' as MenuItem,
  FIND_APPOINTMENT: 'find-appointment' as MenuItem,
  FIND_TREATMENT: 'find-treatment' as MenuItem,
};
