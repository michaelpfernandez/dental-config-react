import mongoose, { Schema, Document } from 'mongoose';

// Enums for constrained fields
export enum MarketSegment {
  Small = 'Small',
  Individual = 'Individual',
  Large = 'Large',
}

export enum CustomizationLevel {
  Standard = 'Standard',
  Custom = 'Custom',
}

export enum ProductType {
  PPO = 'PPO',
  DHMO = 'DHMO',
}

export enum CoverageType {
  Adult = 'Adult',
  Pediatric = 'Pediatric',
  Both = 'Both',
}

// Benefit limit interface
interface ILimit {
  quantity: number;
  unit: string;
  period: string;
}

// Benefit interface
interface IBenefit extends Document {
  name: string;
  code: string;
  classId: string;
  costShare: number;
  limits: ILimit[];
}

// Benefit class interface
interface IBenefitClass extends Document {
  name: string;
  defaultCostShare: number;
  description?: string;
}

// Network tier interface
interface INetworkTier extends Document {
  tier: number;
  adult?: {
    benefitClasses: IBenefitClass[];
    benefits: IBenefit[];
  };
  pediatric?: {
    benefitClasses: IBenefitClass[];
    benefits: IBenefit[];
  };
}

// Action rights interface
export interface IActionRights {
  view?: boolean;
  edit?: boolean;
  delete?: boolean;
  approve?: boolean;
}

// Permissions interface
export interface IPermissions {
  roles: string[];
  actionRights: Record<string, string[]>;
}

// Main dental plan interface
export interface IDentalPlan extends Document {
  header: {
    effectiveDate: Date;
    marketSegment: MarketSegment;
    customizationLevel: CustomizationLevel;
    productType: ProductType;
    innTiers: number;
    oonCoverage: boolean;
    coverageType: CoverageType;
    createdBy: string;
    createdAt: Date;
    lastModifiedBy: string;
    lastModifiedAt: Date;
  };
  networks: {
    inn: INetworkTier[];
    oon?: {
      adult?: {
        benefitClasses: IBenefitClass[];
        benefits: IBenefit[];
      };
      pediatric?: {
        benefitClasses: IBenefitClass[];
        benefits: IBenefit[];
      };
    };
  };
  options: Record<string, any>; // Flexible structure for attribute configuration
  permissions: IPermissions;
  createdAt: Date;
  updatedAt: Date;
}

// Schema definitions
const LimitSchema = new Schema({
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  period: { type: String, required: true },
});

const BenefitSchema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  classId: { type: String, required: true },
  costShare: { type: Number, required: true },
  limits: [LimitSchema],
});

const BenefitClassSchema = new Schema({
  name: { type: String, required: true },
  defaultCostShare: { type: Number, required: true },
  description: String,
});

const NetworkTierSchema = new Schema({
  tier: { type: Number, required: true },
  adult: {
    benefitClasses: [BenefitClassSchema],
    benefits: [BenefitSchema],
  },
  pediatric: {
    benefitClasses: [BenefitClassSchema],
    benefits: [BenefitSchema],
  },
});

const DentalPlanSchema = new Schema(
  {
    header: {
      effectiveDate: { type: Date, required: true },
      marketSegment: {
        type: String,
        enum: Object.values(MarketSegment),
        required: true,
      },
      customizationLevel: {
        type: String,
        enum: Object.values(CustomizationLevel),
        required: true,
      },
      productType: {
        type: String,
        enum: Object.values(ProductType),
        required: true,
      },
      innTiers: {
        type: Number,
        min: 1,
        max: 3,
        required: true,
      },
      oonCoverage: {
        type: Boolean,
        required: true,
      },
      coverageType: {
        type: String,
        enum: Object.values(CoverageType),
        required: true,
      },
      createdBy: { type: String, required: true },
      createdAt: { type: Date, required: true },
      lastModifiedBy: { type: String, required: true },
      lastModifiedAt: { type: Date, required: true },
    },
    networks: {
      inn: [NetworkTierSchema],
      oon: {
        adult: {
          benefitClasses: [BenefitClassSchema],
          benefits: [BenefitSchema],
        },
        pediatric: {
          benefitClasses: [BenefitClassSchema],
          benefits: [BenefitSchema],
        },
      },
    },
    options: { type: Schema.Types.Mixed },
    permissions: {
      roles: [{ type: String }],
      actionRights: { type: Map, of: [String] },
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for efficient querying
DentalPlanSchema.index({ 'header.effectiveDate': 1 });
DentalPlanSchema.index({ 'header.marketSegment': 1 });
DentalPlanSchema.index({ 'header.productType': 1 });

export const DentalPlan = mongoose.model<IDentalPlan>('DentalPlan', DentalPlanSchema);
