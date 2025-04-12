import { setupTestDB, cleanupTestDB } from '../setup';
import { BenefitClassStructure, IBenefitClassStructure } from '../../models/BenefitClassStructure';
import { MarketSegment, ProductType } from '../../models/DentalPlan';

beforeAll(setupTestDB);
afterAll(cleanupTestDB);

describe('BenefitClassStructure Model', () => {
  let testDoc: IBenefitClassStructure;

  beforeEach(async () => {
    // Clear database before each test
    await BenefitClassStructure.deleteMany({});

    // Create test document
    testDoc = new BenefitClassStructure({
      name: 'Test Structure',
      effectiveDate: new Date(),
      marketSegment: MarketSegment.Large,
      productType: ProductType.PPO,
      numberOfClasses: 4,
      classes: [
        {
          id: '1',
          name: 'Class 1',
          benefits: [{ id: 'B1', name: 'Benefit 1' }],
        },
        {
          id: '2',
          name: 'Class 2',
          benefits: [{ id: 'B2', name: 'Benefit 2' }],
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
      const doc = new BenefitClassStructure({});
      await expect(doc.validate()).rejects.toThrow('Path `name` is required.');
    });

    it('should validate marketSegment enum', async () => {
      const doc = new BenefitClassStructure({
        ...testDoc,
        marketSegment: 'INVALID' as MarketSegment,
      });
      await expect(doc.validate()).rejects.toThrow('marketSegment');
    });

    it('should validate productType enum', async () => {
      const doc = new BenefitClassStructure({
        ...testDoc,
        productType: 'INVALID' as ProductType,
      });
      await expect(doc.validate()).rejects.toThrow('productType');
    });

    it('should validate numberOfClasses range', async () => {
      const doc = new BenefitClassStructure({
        ...testDoc,
        numberOfClasses: 0,
      });
      await expect(doc.validate()).rejects.toThrow('numberOfClasses');
    });
  });

  describe('Custom Validations', () => {
    it('should validate unique class names', async () => {
      const doc = new BenefitClassStructure({
        ...testDoc,
        classes: [
          { id: '1', name: 'Duplicate', benefits: [] },
          { id: '2', name: 'Duplicate', benefits: [] },
        ],
      });
      await expect(doc.validate()).rejects.toThrow('Class names must be unique');
    });

    it('should validate unique benefit assignments', async () => {
      const doc = new BenefitClassStructure({
        name: 'Test Structure',
        effectiveDate: '2025-01-01',
        marketSegment: MarketSegment.Large,
        productType: ProductType.PPO,
        numberOfClasses: 2,
        classes: [
          { id: '1', name: 'Class 1', benefits: [{ id: 'B1', name: 'Benefit 1' }] },
          { id: '2', name: 'Class 2', benefits: [{ id: 'B2', name: 'Benefit 2' }] },
        ],
        createdBy: 'test-user',
        createdAt: new Date(),
        lastModifiedBy: 'test-user',
        lastModifiedAt: new Date(),
      });
      await expect(doc.validate()).resolves.not.toThrow();
    });
  });

  describe('CRUD Operations', () => {
    it('should create a new document', async () => {
      const doc = new BenefitClassStructure(testDoc);
      doc.effectiveDate = '2025-01-01'; // Ensure proper date format
      const savedDoc = await doc.save();
      expect(savedDoc._id).toBeDefined();
    });

    it('should find a document', async () => {
      const doc = new BenefitClassStructure(testDoc);
      doc.effectiveDate = '2025-01-01'; // Ensure proper date format
      await doc.save();
      const foundDoc = await BenefitClassStructure.findOne({ name: 'Test Structure' });
      expect(foundDoc).toBeDefined();
    });

    it('should update a document', async () => {
      const doc = new BenefitClassStructure(testDoc);
      doc.effectiveDate = '2025-01-01'; // Ensure proper date format
      await doc.save();
      doc.name = 'Updated Name';
      const updatedDoc = await doc.save();
      expect(updatedDoc.name).toBe('Updated Name');
    });

    it('should delete a document', async () => {
      const doc = new BenefitClassStructure(testDoc);
      doc.effectiveDate = '2025-01-01'; // Ensure proper date format
      await doc.save();
      await doc.deleteOne();
      const foundDoc = await BenefitClassStructure.findOne({ name: 'Test Structure' });
      expect(foundDoc).toBeNull();
    });
  });
});
