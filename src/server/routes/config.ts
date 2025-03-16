import express, { Response } from 'express';
import { AuthRequest, hasRole, hasActionRight } from '../middleware/auth';
import * as benefitClasses from '../../config/benefitClasses.json';
import * as benefits from '../../config/benefits.json';
import * as planAttributes from '../../config/planAttributes.json';
import { serverLogger } from '../../utils/serverLogger';

const router = express.Router();

// Get benefit classes configuration
router.get(
  '/benefitClasses',
  hasRole(['Administrator']),
  hasActionRight(['read_all']),
  async (req: AuthRequest, res: Response) => {
    try {
      res.json(benefitClasses);
    } catch (error) {
      serverLogger.error('Error fetching benefit classes:', error);
      res.status(500).json({ error: 'Failed to fetch benefit classes' });
    }
  }
);

// Get benefits configuration
router.get(
  '/benefits',
  hasRole(['Administrator']),
  hasActionRight(['read_all']),
  async (req: AuthRequest, res: Response) => {
    try {
      res.json(benefits);
    } catch (error) {
      serverLogger.error('Error fetching benefits:', error);
      res.status(500).json({ error: 'Failed to fetch benefits' });
    }
  }
);

// Get plan attributes configuration
router.get(
  '/planAttributes',
  hasRole(['Administrator']),
  hasActionRight(['read_all']),
  async (req: AuthRequest, res: Response) => {
    try {
      res.json(planAttributes);
    } catch (error) {
      serverLogger.error('Error fetching plan attributes:', error);
      res.status(500).json({ error: 'Failed to fetch plan attributes' });
    }
  }
);

export default router;
