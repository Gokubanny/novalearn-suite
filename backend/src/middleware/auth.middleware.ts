import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, JwtPayload, UserRole } from '../types';

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Not authorized. No token provided.',
      });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      // Misconfigured server — don't leak the reason to clients
      console.error('FATAL: JWT_SECRET environment variable is not set.');
      res.status(500).json({ success: false, message: 'Server configuration error.' });
      return;
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;

    req.user = {
      id:     decoded.id,
      role:   decoded.role,
      school: decoded.school,
      email:  decoded.email,
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: 'Not authorized. Token invalid or expired.',
    });
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized.' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not permitted to perform this action.`,
      });
      return;
    }
    next();
  };
};

export const sameSchool = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const schoolId = req.params.schoolId || req.body.school;
  if (
    req.user?.role !== UserRole.SUPER_ADMIN &&
    req.user?.school !== schoolId
  ) {
    res.status(403).json({
      success: false,
      message: 'Access denied. You do not belong to this institution.',
    });
    return;
  }
  next();
};