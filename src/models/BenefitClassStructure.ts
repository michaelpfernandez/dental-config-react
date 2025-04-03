import mongoose, { Schema, Document } from 'mongoose';
import { MarketSegment, ProductType } from './DentalPlan';

export interface IBenefit {
  code: string;
  name: string;
}

export interface IClass {
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
  },
  {
    timestamps: true,
  }
);

// Add validation to ensure class names are unique
BenefitClassStructureSchema.path('classes').validate(function (classes: IClass[]) {
  const classNames = classes.map((c: IClass) => c.name);
  const uniqueClassNames = new Set(classNames);

  // Find duplicates
  const duplicates = classNames.filter(
    (name: string, index: number) => classNames.indexOf(name) !== index
  );

  if (classNames.length !== uniqueClassNames.size) {
    const uniqueDuplicates = [...new Set(duplicates)]; // Get unique duplicates
    throw new Error(`Class names must be unique: ${uniqueDuplicates.join(', ')}`);
  }

  return true; // Validation passes
}, 'Class names must be unique');

// Add validation to ensure benefits are not assigned to multiple classes
BenefitClassStructureSchema.path('classes').validate(function (classes: IClass[]) {
  const benefitCodes = new Map<string, string>();

  for (const cls of classes) {
    for (const benefit of cls.benefits) {
      if (benefitCodes.has(benefit.code)) {
        throw new Error(
          `Benefit ${benefit.code} is already assigned to class ${benefitCodes.get(benefit.code)}`
        );
      }
      benefitCodes.set(benefit.code, cls.name);
    }
  }

  return true;
}, 'Benefits cannot be assigned to multiple classes');

export const BenefitClassStructure = mongoose.model<IBenefitClassStructure>(
  'BenefitClassStructure',
  BenefitClassStructureSchema
);
