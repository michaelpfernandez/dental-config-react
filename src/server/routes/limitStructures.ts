import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { LimitStructure } from '../../models/LimitStructure';
import { serverLogger } from '../../utils/serverLogger';

const router = Router();

// GET /api/limit-structures
router.get('/', async (req, res) => {
  try {
    const limitStructures = await LimitStructure.find();
    res.json(limitStructures);
  } catch (error) {
    serverLogger.error('Error fetching limit structures:', error);
    res.status(500).json({ error: 'Failed to fetch limit structures' });
  }
});

// GET /api/limit-structures/:id
router.get('/:id', async (req, res) => {
  try {
    const limitStructure = await LimitStructure.findById(req.params.id);
    if (!limitStructure) {
      return res.status(404).json({ error: 'Limit structure not found' });
    }
    res.json(limitStructure);
  } catch (error) {
    serverLogger.error('Error fetching limit structure:', error);
    res.status(500).json({ error: 'Failed to fetch limit structure' });
  }
});

// POST /api/limit-structures
router.post('/', async (req: AuthRequest, res: Response) => {
  console.log('POST /api/limit-structures called');
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);

  try {
    if (!req.body) {
      console.error('No request body received');
      return res.status(400).json({ error: 'No request body provided' });
    }

    const { limitConfig } = req.body;
    if (!limitConfig) {
      console.error('No limitConfig in request body');
      return res.status(400).json({ error: 'limitConfig is required in request body' });
    }

    console.log('Creating new LimitStructure with config:', limitConfig);
    // For development purposes, use a temporary user ID if authentication fails
    const tempUserId = 'temp-admin-user';

    const limitStructure = new LimitStructure({
      ...limitConfig,
      createdBy: req.user?.id || tempUserId,
      createdAt: new Date(),
      lastModifiedBy: req.user?.id || tempUserId,
      lastModifiedAt: new Date(),
    });

    console.log('Validating limit structure...');
    try {
      await limitStructure.validate();
      console.log('Validation successful');
    } catch (validationError) {
      console.error('Validation failed:', validationError);
      return res.status(400).json({ error: 'Validation failed', details: validationError });
    }

    console.log('Saving limit structure to database...');
    const savedStructure = await limitStructure.save();
    console.log('Successfully saved limit structure:', savedStructure);

    res.status(201).json(savedStructure);
  } catch (error) {
    console.error('Unexpected error in POST /api/limit-structures:', error);
    serverLogger.error('Error creating limit structure:', error);
    res.status(500).json({ error: 'Failed to create limit structure', details: String(error) });
  }
});

// PUT /api/limit-structures/:id
router.put('/:id', async (req, res) => {
  try {
    const { limitConfig } = req.body;
    const limitStructure = await LimitStructure.findByIdAndUpdate(req.params.id, limitConfig, {
      new: true,
      runValidators: true,
    });
    if (!limitStructure) {
      return res.status(404).json({ error: 'Limit structure not found' });
    }
    res.json(limitStructure);
  } catch (error) {
    serverLogger.error('Error updating limit structure:', error);
    res.status(400).json({ error: 'Failed to update limit structure' });
  }
});

// DELETE /api/limit-structures/:id
router.delete('/:id', async (req, res) => {
  try {
    const limitStructure = await LimitStructure.findByIdAndDelete(req.params.id);
    if (!limitStructure) {
      return res.status(404).json({ error: 'Limit structure not found' });
    }
    res.status(204).send();
  } catch (error) {
    serverLogger.error('Error deleting limit structure:', error);
    res.status(500).json({ error: 'Failed to delete limit structure' });
  }
});

export default router;
