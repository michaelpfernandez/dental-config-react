import mongoose from 'mongoose';
import { BenefitClassStructure, IBenefitClassStructure } from '../../models/BenefitClassStructure';
import { MarketSegment, ProductType } from '../../models/DentalPlan';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, {
    dbName: 'dental-plans-test',
  });
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('BenefitClassStructure Model', () => {
  let testDoc: IBenefitClassStructure;

  beforeEach(async () => {
    // Clear database before each test
    await BenefitClassStructure.deleteMany({});

    // Create test document
    testDoc = {
      name: 'Test Structure',
      effectiveDate: new Date(),
      marketSegment: MarketSegment.Large,
      productType: ProductType.PPO,
      numberOfClasses: 4,
      classes: [
        {
          id: '1',
          name: 'Class 1',
          benefits: [{ code: 'B1', name: 'Benefit 1' }],
        },
        {
          id: '2',
          name: 'Class 2',
          benefits: [{ code: 'B2', name: 'Benefit 2' }],
        },
      ],
      createdBy: 'test-user',
      createdAt: new Date(),
      lastModifiedBy: 'test-user',
      lastModifiedAt: new Date(),
      permissions: {
        roles: ['admin'],
        actionRights: { admin: ['view', 'edit', 'delete'] },
      },
    };
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
        ...testDoc,
        classes: [
          { id: '1', name: 'Class 1', benefits: [{ code: 'B1', name: 'Benefit 1' }] },
          { id: '2', name: 'Class 2', benefits: [{ code: 'B1', name: 'Benefit 1' }] },
        ],
      });
      await expect(doc.validate()).rejects.toThrow(
        'Benefits cannot be assigned to multiple classes'
      );
    });
  });

  describe('Permissions System', () => {
    it('should validate permissions structure', async () => {
      const doc = new BenefitClassStructure({
        ...testDoc,
        permissions: {
          roles: ['admin'],
          actionRights: { admin: ['view', 'edit', 'delete'] },
        },
      });
      await expect(doc.validate()).resolves.not.toThrow();
    });

    it('should reject invalid permissions structure', async () => {
      const doc = new BenefitClassStructure({
        ...testDoc,
        permissions: {
          roles: ['admin'],
          actionRights: { admin: 'invalid' }, // Invalid type
        },
      });
      await expect(doc.validate()).rejects.toThrow(
        'permissions.actionRights: Validator failed for path `permissions.actionRights`'
      );
    });
  });

  describe('CRUD Operations', () => {
    it('should create a new document', async () => {
      const doc = new BenefitClassStructure(testDoc);
      const savedDoc = await doc.save();
      expect(savedDoc._id).toBeDefined();
    });

    it('should find a document', async () => {
      const doc = new BenefitClassStructure(testDoc);
      await doc.save();
      const foundDoc = await BenefitClassStructure.findOne({ name: 'Test Structure' });
      expect(foundDoc).toBeDefined();
    });

    it('should update a document', async () => {
      const doc = new BenefitClassStructure(testDoc);
      await doc.save();
      doc.name = 'Updated Name';
      const updatedDoc = await doc.save();
      expect(updatedDoc.name).toBe('Updated Name');
    });

    it('should delete a document', async () => {
      const doc = new BenefitClassStructure(testDoc);
      await doc.save();
      await doc.deleteOne();
      const foundDoc = await BenefitClassStructure.findOne({ name: 'Test Structure' });
      expect(foundDoc).toBeNull();
    });
  });
});
