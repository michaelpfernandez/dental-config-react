import { MarketSegment, ProductType, LimitIntervalType, UnitType } from './enums';

// Core types
export interface Limit {
  id: string;
  classId: string;
  className: string;
  benefitId: string;
  benefitName: string;
  quantity: number;
  unit: UnitType;
  interval: LimitInterval;
}

export interface LimitInterval {
  type: LimitIntervalType;
  value: number;
}

// Main Limit Structure interface
export interface LimitStructure {
  _id?: string;
  name: string;
  effectiveDate: string;
  marketSegment: MarketSegment;
  productType: ProductType;
  benefitClassStructureId: string;
  benefitClassStructureName: string;
  limits: Limit[];
  createdBy: string;
  createdAt: Date;
  lastModifiedBy: string;
  lastModifiedAt: Date;
}

// Form types
export interface LimitFormData {
  name: string;
  effectiveDate: string;
  marketSegment: MarketSegment;
  productType: ProductType;
  benefitClassStructureId: string;
  benefitClassStructureName: string;
  limits: Limit[];
}

// State types
export interface LimitsState {
  items: LimitStructure[];
  loading: boolean;
  error: string | null;
  selectedLimit: LimitStructure | null;
}
