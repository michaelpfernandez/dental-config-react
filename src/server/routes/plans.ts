import { Router, Request, Response } from 'express';
import { DentalPlan } from '../../models/DentalPlan';
import { serverLogger } from '../../utils/serverLogger';

const router = Router();

// List dental plans
router.get('/', async (req: Request, res: Response) => {
  try {
    const plans = await DentalPlan.find({}).select('header permissions').sort('-header.createdAt');

    res.json(plans);
  } catch (error) {
    serverLogger.error('List plans error:', error);
    res.status(500).json({
      error: 'Failed to fetch dental plans',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Create new dental plan
router.post('/', async (req: Request, res: Response) => {
  try {
    const plan = new DentalPlan(req.body);
    await plan.save();
    res.status(201).json(plan);
  } catch (error) {
    serverLogger.error('Create plan error:', error);
    res.status(400).json({
      error: 'Failed to create dental plan',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Get single plan
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const plan = await DentalPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.json(plan);
  } catch (error) {
    serverLogger.error('Get plan error:', error);
    res.status(500).json({
      error: 'Failed to fetch dental plan',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Update plan
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const plan = await DentalPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.json(plan);
  } catch (error) {
    serverLogger.error('Update plan error:', error);
    res.status(400).json({
      error: 'Failed to update dental plan',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Delete plan
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const plan = await DentalPlan.findByIdAndDelete(req.params.id);

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.status(204).send();
  } catch (error) {
    serverLogger.error('Delete plan error:', error);
    res.status(500).json({
      error: 'Failed to delete dental plan',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
