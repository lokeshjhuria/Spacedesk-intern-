import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

interface RequestBucket {
  count: number;
  resetTime: number;
}

const ipBuckets = new Map<string, RequestBucket>();

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  let bucket = ipBuckets.get(ip);

  if (!bucket || now > bucket.resetTime) {
    bucket = {
      count: 1,
      resetTime: now + env.RATE_LIMIT_WINDOW_MS
    };
    ipBuckets.set(ip, bucket);
    next();
    return;
  }

  bucket.count += 1;
  if (bucket.count > env.RATE_LIMIT_MAX) {
    const retrySec = Math.ceil((bucket.resetTime - now) / 1000);
    res.status(429).json({
      success: false,
      error: 'Too many requests. Rate limit exceeded.',
      retryAfterSeconds: retrySec
    });
    return;
  }

  next();
}
