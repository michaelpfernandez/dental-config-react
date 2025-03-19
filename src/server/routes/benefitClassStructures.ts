import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { BenefitClassStructure } from '../../models/BenefitClassStructure';
import { serverLogger } from '../../utils/serverLogger';

const router = Router();

// List benefit class structures
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const structures = await BenefitClassStructure.find({})
      .select('name effectiveDate marketSegment productType numberOfClasses permissions')
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
    const structure = new BenefitClassStructure({
      ...req.body,
      createdBy: req.user?.id,
      createdAt: new Date(),
      lastModifiedBy: req.user?.id,
      lastModifiedAt: new Date(),
      permissions: {
        roles: ['Administrator'],
        actionRights: {
          Administrator: ['create_all', 'read_all', 'delete_all', 'admin_access'],
        },
      },
    });

    await structure.save();
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
    const structure = await BenefitClassStructure.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        lastModifiedBy: req.user?.id,
        lastModifiedAt: new Date(),
      },
      { new: true }
    );

    if (!structure) {
      return res.status(404).json({ error: 'Benefit class structure not found' });
    }

    res.json(structure);
  } catch (error) {
    serverLogger.error('Update benefit class structure error:', error);
    res.status(400).json({
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
