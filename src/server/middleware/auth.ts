import { Request, Response, NextFunction } from 'express';
import { readFileSync } from 'fs';
import path from 'path';
import { serverLogger } from '../../utils/serverLogger';

// Types for our authentication system
export interface User {
  id: string;
  username: string;
  roles: string[];
  actionRights: string[];
}

export interface AuthRequest extends Request {
  user?: User;
}

// Read auth configuration
const getAuthConfig = () => {
  try {
    const authPath = path.join(process.cwd(), 'src', 'data', 'auth.json');
    return JSON.parse(readFileSync(authPath, 'utf-8'));
  } catch (error) {
    serverLogger.error('Error reading auth config:', error);
    return { users: [] };
  }
};

// Middleware to check if user is authenticated
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    serverLogger.info('Auth header:', authHeader);

    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    // Extract the token part after 'Bearer '
    const token = authHeader.split(' ')[1];
    serverLogger.info('Token:', token);

    // Try to parse the token as JSON (our current format)
    try {
      // Parse the JSON string token
      const userObject = JSON.parse(token);
      serverLogger.info('Parsed user object:', userObject);

      // Create a user object that matches our User interface
      const user: User = {
        id: userObject.id,
        username: userObject.username,
        roles: ['Administrator'], // Default role for now
        actionRights: ['create_all', 'read_all', 'update_all', 'delete_all'], // Default rights
      };

      req.user = user;
      serverLogger.info('User set on request:', req.user);
      next();
      return;
    } catch (jsonError) {
      serverLogger.error('Error parsing token as JSON:', jsonError);
      // If JSON parsing fails, try the original method
    }

    // Original token validation as fallback
    const authConfig = getAuthConfig();
    const user = authConfig.users.find((u: User) => u.id === token);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    serverLogger.error('Authentication error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

// Middleware to check if user has required role
export const hasRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const hasRequiredRole = req.user.roles.some((role) => roles.includes(role));
    if (!hasRequiredRole) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Middleware to check if user has required action rights
export const hasActionRight = (rights: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const hasRequiredRight = req.user.actionRights.some((right) => rights.includes(right));
    if (!hasRequiredRight) {
      return res.status(403).json({ error: 'Insufficient action rights' });
    }

    next();
  };
};
