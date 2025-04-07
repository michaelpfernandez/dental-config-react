export interface Benefit {
  id: string;
  name: string;
}

export interface ClassData {
  id: string;
  name: string;
  benefits: Benefit[];
}

export interface BenefitClassStructure {
  _id: string;
  name: string;
  effectiveDate: string;
  marketSegment: string;
  productType: string;
  numberOfClasses: number;
  classes: ClassData[];
  createdBy?: string;
  createdAt?: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
  permissions?: {
    roles: string[];
    actionRights: Record<string, string[]>;
  };
}

export interface AvailableBenefit {
  id: string;
  name: string;
  classId: string;
}
