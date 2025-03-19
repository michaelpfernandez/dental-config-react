import { Response, Router } from 'express';
import { readFile } from 'fs/promises';
import path from 'path';
import * as benefitClasses from '../../config/benefitClasses.json';
import * as benefits from '../../config/benefits.json';
import * as planAttributes from '../../config/planAttributes.json';
import { serverLogger } from '../../utils/serverLogger';

const router = Router();

// Get benefit classes configuration
router.get('/benefitClasses', async (req, res: Response) => {
  try {
    res.json(benefitClasses);
  } catch (error) {
    serverLogger.error('Get benefit classes error:', error);
    res.status(500).json({
      error: 'Failed to fetch benefit classes',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Get benefits configuration
router.get('/benefits', async (req, res: Response) => {
  try {
    res.json(benefits);
  } catch (error) {
    serverLogger.error('Get benefits error:', error);
    res.status(500).json({
      error: 'Failed to fetch benefits',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Get plan attributes configuration
router.get('/planAttributes', async (req, res: Response) => {
  try {
    res.json(planAttributes);
  } catch (error) {
    serverLogger.error('Get plan attributes error:', error);
    res.status(500).json({
      error: 'Failed to fetch plan attributes',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Get benefit classes
router.get('/benefit-classes', async (req, res: Response) => {
  try {
    const data = await readFile(path.join(__dirname, '../../config/benefitClasses.json'), 'utf-8');
    const benefitClasses = JSON.parse(data);
    res.json(benefitClasses);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch benefit classes',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
