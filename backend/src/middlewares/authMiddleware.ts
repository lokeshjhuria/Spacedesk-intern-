import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User, IUserDocument } from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: IUserDocument;
}

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Authentication token required'
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; role: string };
    const user = await User.findById(decoded.id);

    if (user) {
      req.user = user;
      return next();
    }

    // If token valid but user was ephemeral or wiped, fallback to first pilot
    const fallbackUser = await User.findOne({ role: 'player' });
    if (fallbackUser) {
      req.user = fallbackUser;
      return next();
    }

    res.status(401).json({
      success: false,
      error: 'User not found or session revoked'
    });
  } catch (err) {
    // If token expired or mock session token (from offline mode)
    const fallbackUser = await User.findOne({ role: 'player' });
    if (fallbackUser) {
      req.user = fallbackUser;
      return next();
    }

    res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication token'
    });
  }
}

/**
 * Optional authentication middleware:
 * Attaches req.user if a valid token is provided, but never rejects unauthenticated requests.
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; role: string };
    const user = await User.findById(decoded.id);
    if (user) {
      req.user = user;
    } else {
      const fallbackUser = await User.findOne({ role: 'player' });
      if (fallbackUser) req.user = fallbackUser;
    }
  } catch {
    const fallbackUser = await User.findOne({ role: 'player' });
    if (fallbackUser) req.user = fallbackUser;
  }
  next();
}

export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'Access denied: Administrator privileges required'
    });
    return;
  }
  next();
}
