import mongoose, { Schema, Document } from 'mongoose';
import { MarketSegment, ProductType, CoverageType } from './DentalPlan';

export interface IDefaultLimit extends Document {
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  period: string;
  headerCriteria: {
    marketSegments: MarketSegment[];
    productTypes: ProductType[];
    coverageTypes: CoverageType[];
  };
  benefitCodes: string[]; // The benefit codes this limit applies to
  createdAt: Date;
  updatedAt: Date;
}

const DefaultLimitSchema = new Schema(
  {
    name: { type: String, required: true },
    description: String,
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    period: { type: String, required: true },
    headerCriteria: {
      marketSegments: [
        {
          type: String,
          enum: Object.values(MarketSegment),
        },
      ],
      productTypes: [
        {
          type: String,
          enum: Object.values(ProductType),
        },
      ],
      coverageTypes: [
        {
          type: String,
          enum: Object.values(CoverageType),
        },
      ],
    },
    benefitCodes: [String],
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient matching
DefaultLimitSchema.index({ 'headerCriteria.marketSegments': 1 });
DefaultLimitSchema.index({ 'headerCriteria.productTypes': 1 });
DefaultLimitSchema.index({ 'headerCriteria.coverageTypes': 1 });
DefaultLimitSchema.index({ benefitCodes: 1 });

export const DefaultLimit = mongoose.model<IDefaultLimit>('DefaultLimit', DefaultLimitSchema);
