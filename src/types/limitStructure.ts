// Core types
export interface Limit {
  id: string;
  benefitId: string;
  benefitName: string;
  quantity: number;
  interval: LimitInterval;
}

export interface LimitInterval {
  type: 'per_visit' | 'per_year' | 'per_lifetime';
  value: number;
}

// Main Limit Structure interface
export interface LimitStructure {
  _id: string;
  name: string;
  effectiveDate: string;
  marketSegment: string;
  productType: string;
  benefitClassStructureId: string;
  benefitClassStructureName: string;
  limits: Limit[];
  createdBy?: string;
  createdAt?: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
}

// Form types
export interface LimitFormData {
  name: string;
  effectiveDate: string;
  marketSegment: string;
  productType: string;
  benefitClassStructureId: string;
  benefitClassStructureName: string;
}

// State types
export interface LimitsState {
  items: LimitStructure[];
  loading: boolean;
  error: string | null;
  selectedLimit: LimitStructure | null;
}
