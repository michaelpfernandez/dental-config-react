import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import connectToDatabase from '../config/database';
import { serverLogger } from '../utils/serverLogger';
import plansRouter from './routes/plans';
import configRouter from './routes/config';
import benefitClassStructuresRouter from './routes/benefitClassStructures';
import limitStructuresRouter from './routes/limitStructures';
import debugRouter from './routes/debug';

// Initialize express app
const app = express();
const port = process.env.PORT || 3001;

// Connect to MongoDB and start server
async function startServer() {
  try {
    await connectToDatabase();
    serverLogger.info('Connected to MongoDB');

    if (process.env.NODE_ENV !== 'test') {
      app.listen(port, () => {
        serverLogger.info(`Server running on port ${port}`);
      });
    }
  } catch (error) {
    serverLogger.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies

// Health check endpoint (no auth required)
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy' });
});

// Register routes
app.use('/api/plans', plansRouter);
app.use('/api/config', configRouter);

// Apply authentication middleware to benefit class structure routes
// For development, we'll make this optional by using our fallback user ID in the routes
app.use('/api/benefit-class-structures', benefitClassStructuresRouter);

// Limit structure routes
app.use('/api/limit-structures', limitStructuresRouter);

// Debug routes (no auth required for development)
app.use('/api/debug', debugRouter);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // Log error securely (without sensitive data)
  serverLogger.error('API Error:', err.message);

  // Handle authentication errors
  if (err.message.includes('Authentication failed') || err.message.includes('Invalid token')) {
    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Please log in again',
    });
  }

  // Handle authorization errors
  if (err.message.includes('Not authorized') || err.message.includes('Permission denied')) {
    return res.status(403).json({
      error: 'Permission denied',
      message: 'You do not have permission to perform this action',
    });
  }

  // Send safe error response
  res.status(500).json({
    error: 'Internal server error',
    message:
      process.env.NODE_ENV === 'development'
        ? err.message.replace(/mongodb\+srv:\/\/[^@]+@/, 'mongodb+srv://[redacted]@')
        : undefined,
  });
});

// Start server
startServer();

export default app;
