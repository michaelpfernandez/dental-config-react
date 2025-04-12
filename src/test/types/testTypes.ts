import { MarketSegment, ProductType } from '../../models/DentalPlan';

export interface MockLimitStructure {
  name: string;
  effectiveDate: string;
  marketSegment: MarketSegment;
  productType: ProductType;
  benefitClassStructureId: string;
  benefitClassStructureName: string;
  limits: MockLimit[];
  createdBy: string;
  createdAt: Date;
  lastModifiedBy: string;
  lastModifiedAt: Date;
}

export interface MockLimit {
  id: string;
  classId: string;
  className: string;
  benefitId: string;
  benefitName: string;
  quantity: number;
  unit: 'per_tooth' | 'per_item' | 'n/a';
  interval: {
    type: 'per_visit' | 'per_year' | 'per_lifetime';
    value: number;
  };
}

export interface MockLimitFormData {
  name: string;
  effectiveDate: string;
  marketSegment: MarketSegment;
  productType: ProductType;
  benefitClassStructureId: string;
  benefitClassStructureName: string;
  limits: MockLimit[];
}
