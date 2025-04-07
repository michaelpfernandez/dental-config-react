import { Router, Response, Request } from 'express';
import { BenefitClassStructure } from '../../models/BenefitClassStructure';
import { serverLogger } from '../../utils/serverLogger';

const router = Router();

// Clear all benefit class structures
router.delete('/clear-benefit-class-structures', async (req: Request, res: Response) => {
  try {
    // Delete all documents from the BenefitClassStructure collection
    const result = await BenefitClassStructure.deleteMany({});

    serverLogger.info('Cleared benefit class structures:', result);

    res.status(200).json({
      message: 'All benefit class structures have been deleted',
      count: result.deletedCount,
    });
  } catch (error) {
    serverLogger.error('Error clearing benefit class structures:', error);
    res.status(500).json({
      error: 'Failed to clear benefit class structures',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
