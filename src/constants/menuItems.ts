// Define menu item types for better type safety
export type MenuAction = 'create' | 'find';
export type EntityType = 'benefit-class' | 'limits' | 'plan';
export type MenuItem = `${MenuAction}-${EntityType}`;

// Constants for menu items to avoid duplication and typos
export const MENU_ITEMS = {
  CREATE_BENEFIT_CLASS: 'create-benefit-class' as MenuItem,
  CREATE_LIMITS: 'create-limits' as MenuItem,
  CREATE_PLAN: 'create-plan' as MenuItem,
  FIND_BENEFIT_CLASS: 'find-benefit-class' as MenuItem,
  FIND_LIMITS: 'find-limits' as MenuItem,
  FIND_PLAN: 'find-plan' as MenuItem,
};
