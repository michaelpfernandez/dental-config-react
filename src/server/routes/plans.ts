import { Router, Request, Response } from 'express';
import { hasRole, hasActionRight } from '../middleware/auth';
import { DentalPlan } from '../../models/DentalPlan';
import { serverLogger } from '../../utils/serverLogger';

const router = Router();

interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    roles: string[];
    actionRights: string[];
  };
}

// List dental plans (filtered by user role)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const isAdmin = req.user?.roles.includes('admin');
    const query = isAdmin ? {} : { 'permissions.roles': { $in: req.user?.roles || [] } };

    const plans = await DentalPlan.find(query)
      .select('header permissions')
      .sort('-header.createdAt');

    res.json(plans);
  } catch (error) {
    serverLogger.error('List plans error:', error);
    res.status(500).json({
      error: 'Failed to fetch dental plans',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Create new dental plan (admin only)
router.post(
  '/',
  hasRole(['admin']),
  hasActionRight(['create']),
  async (req: AuthRequest, res: Response) => {
    try {
      const plan = new DentalPlan({
        ...req.body,
        header: {
          ...req.body.header,
          createdBy: req.user?.id,
          createdAt: new Date(),
          lastModifiedBy: req.user?.id,
          lastModifiedAt: new Date(),
        },
        permissions: {
          roles: ['admin', 'dentist'],
          actionRights: {
            admin: ['view', 'edit', 'delete', 'approve'],
            dentist: ['view'],
          },
        },
      });

      await plan.save();
      res.status(201).json(plan);
    } catch (error) {
      serverLogger.error('Create plan error:', error);
      res.status(400).json({
        error: 'Failed to create dental plan',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

// Get single plan (with permission check)
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const plan = await DentalPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Check if user has permission to view this plan
    const userRoles = req.user?.roles || [];
    const hasPermission = userRoles.some((role) => plan.permissions.roles.includes(role));

    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
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

// Update plan (admin/authorized only)
router.put('/:id', hasActionRight(['edit']), async (req: AuthRequest, res: Response) => {
  try {
    const plan = await DentalPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Check if user has permission to edit this plan
    const userRoles = req.user?.roles || [];
    const hasPermission = userRoles.some((role) =>
      plan.permissions.actionRights[role]?.includes('edit')
    );

    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Update the plan with audit trail
    const updatedPlan = await DentalPlan.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        'header.lastModifiedBy': req.user?.id,
        'header.lastModifiedAt': new Date(),
      },
      { new: true }
    );

    res.json(updatedPlan);
  } catch (error) {
    serverLogger.error('Update plan error:', error);
    res.status(400).json({
      error: 'Failed to update dental plan',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Delete plan (admin only)
router.delete(
  '/:id',
  hasRole(['admin']),
  hasActionRight(['delete']),
  async (req: AuthRequest, res: Response) => {
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
  }
);

export default router;
