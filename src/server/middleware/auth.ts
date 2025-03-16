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
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  // For development, we'll use a simple token-based auth
  // In production, you'd want to use proper JWT validation
  const token = authHeader.split(' ')[1];
  const authConfig = getAuthConfig();

  // Find user by token (in production, this would be JWT verification)
  const user = authConfig.users.find((u: User) => u.id === token);

  if (!user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.user = user;
  next();
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
