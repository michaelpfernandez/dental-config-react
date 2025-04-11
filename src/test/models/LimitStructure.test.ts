import { setupTestDB, cleanupTestDB } from '../setup';
import { MarketSegment, ProductType, LimitIntervalType } from '../../types/enums';
import { LimitStructure } from '../../models/LimitStructure';

beforeAll(setupTestDB);
afterAll(cleanupTestDB);

describe('LimitStructure Model', () => {
  let testDoc: any;

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
            type: LimitIntervalType.PerYear,
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
        ...testDoc.toObject(),
        marketSegment: 'INVALID',
      });
      await expect(doc.validate()).rejects.toThrow();
    });

    it('should validate productType enum', async () => {
      const doc = new LimitStructure({
        ...testDoc.toObject(),
        productType: 'INVALID',
      });
      await expect(doc.validate()).rejects.toThrow();
    });

    it('should validate effectiveDate format', async () => {
      const doc = new LimitStructure({
        ...testDoc.toObject(),
        effectiveDate: 'invalid-date',
      });
      await expect(doc.validate()).rejects.toThrow();
    });

    it('should validate limit interval type', async () => {
      const doc = new LimitStructure({
        ...testDoc.toObject(),
        limits: [
          {
            ...testDoc.limits[0],
            interval: {
              type: 'invalid_interval',
              value: 1,
            },
          },
        ],
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
