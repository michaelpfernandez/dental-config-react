import mongoose, { Schema, Document } from 'mongoose';
import { MarketSegment, ProductType } from './DentalPlan';

interface IBenefit {
  code: string;
  name: string;
}

interface IClass {
  id: string;
  name: string;
  benefits: IBenefit[];
}

export interface IBenefitClassStructure extends Document {
  name: string;
  effectiveDate: Date;
  marketSegment: MarketSegment;
  productType: ProductType;
  numberOfClasses: number;
  classes: IClass[];
  createdBy: string;
  createdAt: Date;
  lastModifiedBy: string;
  lastModifiedAt: Date;
  permissions: {
    roles: string[];
    actionRights: Record<string, string[]>;
  };
}

const BenefitSchema = new Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
});

const ClassSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  benefits: [BenefitSchema],
});

const BenefitClassStructureSchema = new Schema(
  {
    name: { type: String, required: true },
    effectiveDate: { type: Date, required: true },
    marketSegment: {
      type: String,
      enum: Object.values(MarketSegment),
      required: true,
    },
    productType: {
      type: String,
      enum: Object.values(ProductType),
      required: true,
    },
    numberOfClasses: {
      type: Number,
      min: 1,
      max: 6,
      required: true,
    },
    classes: [ClassSchema],
    createdBy: { type: String, required: true },
    createdAt: { type: Date, required: true },
    lastModifiedBy: { type: String, required: true },
    lastModifiedAt: { type: Date, required: true },
    permissions: {
      roles: [{ type: String }],
      actionRights: {
        type: Schema.Types.Mixed,
        validate: function (this: any) {
          if (!this.permissions || !this.permissions.actionRights) {
            return true;
          }

          const actionRights = this.permissions.actionRights;

          // Check if all values are arrays
          for (const rights of Object.values(actionRights)) {
            if (!Array.isArray(rights)) {
              return false;
            }
          }

          return true;
        },
        message: 'Invalid permissions structure: actionRights must be an object with array values',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Add validation to ensure class names are unique
BenefitClassStructureSchema.path('classes').validate(function (classes: IClass[]) {
  const classNames = classes.map((c) => c.name);
  const uniqueClassNames = new Set(classNames);

  // Find duplicates
  const duplicates = classNames.filter((name, index) => classNames.indexOf(name) !== index);

  if (classNames.length !== uniqueClassNames.size) {
    const uniqueDuplicates = [...new Set(duplicates)]; // Get unique duplicates
    throw new Error(`Class names must be unique: ${uniqueDuplicates.join(', ')}`);
  }

  return true; // Validation passes
}, 'Class names must be unique');

// Add validation to ensure benefits are not assigned to multiple classes
BenefitClassStructureSchema.path('classes').validate(function (classes: IClass[]) {
  const benefitCodes = new Set<string>();

  for (const cls of classes) {
    for (const benefit of cls.benefits) {
      if (benefitCodes.has(benefit.code)) {
        return false;
      }
      benefitCodes.add(benefit.code);
    }
  }

  return true;
}, 'Benefits cannot be assigned to multiple classes');

export const BenefitClassStructure = mongoose.model<IBenefitClassStructure>(
  'BenefitClassStructure',
  BenefitClassStructureSchema
);
