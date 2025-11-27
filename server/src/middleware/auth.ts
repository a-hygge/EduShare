import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: 'teacher' | 'student' | 'admin';
  user?: {
    id: string;
    email: string;
    role: 'teacher' | 'student' | 'admin';
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, secret) as {
      userId: string;
      email: string;
      role: 'teacher' | 'student' | 'admin';
    };

    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const secret = process.env.JWT_SECRET;
      if (secret) {
        const decoded = jwt.verify(token, secret) as {
          userId: string;
          email: string;
          role: 'teacher' | 'student' | 'admin';
        };

        req.userId = decoded.userId;
        req.userRole = decoded.role;
        req.user = {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role
        };
      }
    }

    next();
  } catch (error) {
    // If token is invalid, continue without auth
    next();
  }
};
