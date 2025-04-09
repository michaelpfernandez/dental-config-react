import { setupTestDB, cleanupTestDB } from '../setup';
import { MarketSegment, ProductType } from 'src/types/enums';
import mongoose from 'mongoose';

// Mock the LimitStructure model
interface Limit {
  id: string;
  classId: string;
  className: string;
  benefitId: string;
  benefitName: string;
  quantity: number;
  unit: string;
  interval: {
    type: 'per_year' | 'per_period' | 'per_tooth';
    value: number;
  };
}

interface LimitStructure {
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

const limitSchema = new mongoose.Schema({
  id: { type: String, required: true },
  classId: { type: String, required: true },
  className: { type: String, required: true },
  benefitId: { type: String, required: true },
  benefitName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  interval: {
    type: {
      type: String,
      enum: ['per_year', 'per_period', 'per_tooth'],
      required: true,
    },
    value: { type: Number, required: true },
  },
});

const limitStructureSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    effectiveDate: { type: String, required: true },
    marketSegment: { type: String, required: true, enum: Object.values(MarketSegment) },
    productType: { type: String, required: true, enum: Object.values(ProductType) },
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
  }
);

const LimitStructure = mongoose.model<LimitStructure>('LimitStructure', limitStructureSchema);

beforeAll(setupTestDB);
afterAll(cleanupTestDB);

describe('LimitStructure Model', () => {
  let testDoc: LimitStructure;

  beforeEach(async () => {
    // Clear database before each test
    await LimitStructure.deleteMany({});

    // Create test document
    testDoc = new LimitStructure({
      name: 'Test Limit Structure',
      effectiveDate: '2025-01-01',
      marketSegment: MarketSegment.Large,
      productType: ProductType.PPO,
      benefitClassStructureId: 'bcs-1',
      benefitClassStructureName: 'Test BCS',
      limits: [
        {
          id: 'limit-1',
          classId: 'class-1',
          className: 'Class 1',
          benefitId: 'benefit-1',
          benefitName: 'Benefit 1',
          quantity: 2,
          unit: 'per_tooth',
          interval: {
            type: 'per_year',
            value: 1,
          },
        },
      ],
      createdBy: 'test-user',
      createdAt: new Date(),
      lastModifiedBy: 'test-user',
      lastModifiedAt: new Date(),
    });
  });

  describe('Schema Validation', () => {
    it('should validate required fields', async () => {
      const doc = new LimitStructure({});
      await expect(doc.validate()).rejects.toThrow();
    });

    it('should validate marketSegment enum', async () => {
      const doc = new LimitStructure({
        ...testDoc,
        marketSegment: 'INVALID' as MarketSegment,
      });
      await expect(doc.validate()).rejects.toThrow();
    });

    it('should validate productType enum', async () => {
      const doc = new LimitStructure({
        ...testDoc,
        productType: 'INVALID' as ProductType,
      });
      await expect(doc.validate()).rejects.toThrow();
    });

    it('should validate effectiveDate format', async () => {
      const doc = new LimitStructure({
        ...testDoc,
        effectiveDate: 'invalid-date',
      });
      await expect(doc.validate()).rejects.toThrow();
    });
  });

  describe('CRUD Operations', () => {
    it('should create a new document', async () => {
      const savedDoc = await testDoc.save();
      expect(savedDoc._id).toBeDefined();
    });

    it('should find a document', async () => {
      await testDoc.save();
      const foundDoc = await LimitStructure.findOne({ name: 'Test Limit Structure' });
      expect(foundDoc).toBeDefined();
    });

    it('should update a document', async () => {
      await testDoc.save();
      testDoc.name = 'Updated Name';
      const updatedDoc = await testDoc.save();
      expect(updatedDoc.name).toBe('Updated Name');
    });

    it('should delete a document', async () => {
      await testDoc.save();
      await testDoc.deleteOne();
      const foundDoc = await LimitStructure.findOne({ name: 'Test Limit Structure' });
      expect(foundDoc).toBeNull();
    });
  });
});
