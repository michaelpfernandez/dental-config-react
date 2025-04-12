import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { BenefitClassStructure } from '../../models/BenefitClassStructure';
import { serverLogger } from '../../utils/serverLogger';

const router = Router();

// List benefit class structures
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const structures = await BenefitClassStructure.find({})
      .select('name effectiveDate marketSegment productType numberOfClasses')
      .sort('-createdAt');

    res.json(structures);
  } catch (error) {
    serverLogger.error('List benefit class structures error:', error);
    res.status(500).json({
      error: 'Failed to fetch benefit class structures',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Create new benefit class structure
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { classConfig } = (req.body as { classConfig?: any }) || {};

    // Early return if classConfig is undefined
    if (!classConfig) {
      return res.status(400).json({
        error: 'Validation failed',
        details: 'classConfig is required',
      });
    }

    // Log the full request body and classConfig for debugging
    serverLogger.info('Full request body:', JSON.stringify(req.body, null, 2));
    serverLogger.info('Class config:', JSON.stringify(req.body.classConfig, null, 2));

    // Log the effective date specifically if it exists
    if (req.body.classConfig?.effectiveDate) {
      serverLogger.info('Effective date from request:', req.body.classConfig.effectiveDate);
      serverLogger.info('Type of effective date:', typeof req.body.classConfig.effectiveDate);
    } else {
      serverLogger.warn('No effective date found in request!');
    }

    // Log the classes and benefits specifically
    if (classConfig.classes && Array.isArray(classConfig.classes)) {
      serverLogger.info(`Number of classes in payload: ${classConfig.classes.length}`);
      classConfig.classes.forEach((classItem: any, index: number) => {
        serverLogger.info(
          `Class ${index + 1}: ${classItem.name} (ID: ${classItem.id}, type: ${typeof classItem.id})`,
        );
        if (classItem.benefits && Array.isArray(classItem.benefits)) {
          serverLogger.info(`  Benefits count: ${classItem.benefits.length}`);
          classItem.benefits.forEach((benefit: any, bIndex: number) => {
            serverLogger.info(
              `  Benefit ${bIndex + 1}: ${benefit.name} (ID: ${benefit.id}, type: ${typeof benefit.id})`,
            );
          });
        } else {
          serverLogger.info(`  No benefits array found for class ${index + 1}`);
        }
      });
    } else {
      serverLogger.info('No classes array found in payload');
    }

    // Debug authentication information
    serverLogger.info('Auth header:', req.headers.authorization);
    serverLogger.info('User object:', req.user);
    serverLogger.info('User ID:', req.user?.id);

    // For development purposes, use a temporary user ID if authentication fails
    const tempUserId = 'temp-admin-user';

    // Log the effective date for debugging
    if (req.body.classConfig?.effectiveDate) {
      serverLogger.info('Received effective date:', req.body.classConfig.effectiveDate);
    } else {
      serverLogger.warn('No effective date found in request!');
    }

    const structure = new BenefitClassStructure({
      ...req.body.classConfig,
      createdBy: req.user?.id || tempUserId, // Use fallback if req.user?.id is undefined
      createdAt: new Date(),
      lastModifiedBy: req.user?.id || tempUserId, // Use fallback if req.user?.id is undefined
      lastModifiedAt: new Date(),
      permissions: {
        roles: ['Administrator'],
        actionRights: {
          Administrator: ['create_all', 'read_all', 'delete_all', 'admin_access'],
        },
      },
    });

    await structure.save();

    // Log the saved structure to verify what was actually stored
    serverLogger.info('Saved structure:', structure);
    serverLogger.info('Saved structure classes:', structure.classes);
    if (structure.classes && Array.isArray(structure.classes)) {
      structure.classes.forEach((classItem: any, index: number) => {
        serverLogger.info(`Saved class ${index + 1}: ${classItem.name}`);
        if (classItem.benefits && Array.isArray(classItem.benefits)) {
          serverLogger.info(`  Saved benefits count: ${classItem.benefits.length}`);
        } else {
          serverLogger.info(`  No benefits saved for class ${index + 1}`);
        }
      });
    }

    res.status(201).json(structure);
  } catch (error) {
    serverLogger.error('Create benefit class structure error:', error);
    res.status(400).json({
      error: 'Failed to create benefit class structure',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Get single benefit class structure
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const structure = await BenefitClassStructure.findById(req.params.id);

    if (!structure) {
      return res.status(404).json({ error: 'Benefit class structure not found' });
    }

    res.json(structure);
  } catch (error) {
    serverLogger.error('Get benefit class structure error:', error);
    res.status(500).json({
      error: 'Failed to fetch benefit class structure',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Update benefit class structure
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { classConfig } = (req.body as { classConfig?: any }) || {};

    // Early return if classConfig is undefined
    if (!classConfig) {
      return res.status(400).json({
        error: 'Validation failed',
        details: 'classConfig is required',
      });
    }

    // Log the full request body and classConfig for debugging
    serverLogger.info('Full request body:', JSON.stringify(req.body, null, 2));
    serverLogger.info('Class config:', JSON.stringify(req.body.classConfig, null, 2));

    // Log the effective date specifically if it exists
    if (req.body.classConfig?.effectiveDate) {
      serverLogger.info('Effective date from request:', req.body.classConfig.effectiveDate);
      serverLogger.info('Type of effective date:', typeof req.body.classConfig.effectiveDate);
    } else {
      serverLogger.warn('No effective date found in request!');
    }

    // Debug authentication information
    serverLogger.info('Update - Auth header:', req.headers.authorization);
    serverLogger.info('Update - User object:', req.user);
    serverLogger.info('Update - User ID:', req.user?.id);

    // For development purposes, use a temporary user ID if authentication fails
    const tempUserId = 'temp-admin-user';

    // Log the effective date for debugging
    if (req.body.classConfig?.effectiveDate) {
      serverLogger.info('Received effective date:', req.body.classConfig.effectiveDate);
    } else {
      serverLogger.warn('No effective date found in request!');
    }

    const structure = await BenefitClassStructure.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ...classConfig,
          lastModifiedBy: tempUserId,
          lastModifiedAt: new Date(),
        },
      },
      { new: true },
    );

    if (!structure) {
      return res.status(404).json({
        error: 'Not found',
        details: 'Benefit class structure not found',
      });
    }

    res.json(structure);
  } catch (error) {
    serverLogger.error('Update benefit class structure error:', error);
    res.status(500).json({
      error: 'Failed to update benefit class structure',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Delete benefit class structure
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const structure = await BenefitClassStructure.findByIdAndDelete(req.params.id);

    if (!structure) {
      return res.status(404).json({ error: 'Benefit class structure not found' });
    }

    res.status(204).send();
  } catch (error) {
    serverLogger.error('Delete benefit class structure error:', error);
    res.status(500).json({
      error: 'Failed to delete benefit class structure',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
