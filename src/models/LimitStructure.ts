import mongoose, { Document, Schema } from 'mongoose';
import { MarketSegment, ProductType, LimitIntervalType } from '../types/enums';

export interface ILimitInterval {
  type: LimitIntervalType;
  value: number;
}

export interface ILimit {
  id: string;
  classId: string;
  className: string;
  benefitId: string;
  benefitName: string;
  quantity: number;
  unit: string;
  interval: {
    type: LimitIntervalType;
    value: number;
  };
}

export interface ILimitStructure extends Document {
  name: string;
  effectiveDate: string;
  marketSegment: MarketSegment;
  productType: ProductType;
  benefitClassStructureId: string;
  benefitClassStructureName: string;
  limits: ILimit[];
  createdBy: string;
  createdAt: Date;
  lastModifiedBy: string;
  lastModifiedAt: Date;
}

// Define the schemas
const limitIntervalSchema = new Schema({
  type: {
    type: String,
    enum: Object.values(LimitIntervalType),
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
});

const limitSchema = new Schema({
  id: { type: String, required: true },
  classId: { type: String, required: true },
  className: { type: String, required: true },
  benefitId: { type: String, required: true },
  benefitName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  interval: { type: limitIntervalSchema, required: true },
});

const limitStructureSchema = new Schema(
  {
    name: { type: String, required: true },
    effectiveDate: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return /^\d{4}-\d{2}-\d{2}$/.test(v);
        },
        message: 'Effective date must be in YYYY-MM-DD format',
      },
    },
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
    benefitClassStructureId: { type: String, required: true },
    benefitClassStructureName: { type: String, required: true },
    limits: [limitSchema],
    createdBy: { type: String, required: true },
    createdAt: { type: Date, required: true },
    lastModifiedBy: { type: String, required: true },
    lastModifiedAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  },
);

// Create and export the model
export const LimitStructure = mongoose.model<ILimitStructure>(
  'LimitStructure',
  limitStructureSchema,
);
