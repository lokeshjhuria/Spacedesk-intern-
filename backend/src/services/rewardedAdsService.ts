import crypto from 'crypto';
import { AuditLog } from '../models/AuditLog';
import { env } from '../config/env';

interface AdSessionRecord {
  adSessionId: string;
  userId: string;
  purpose: 'revive' | 'double_rewards' | 'supply_drop';
  createdAt: number;
  completed: boolean;
}

// In-memory session and cooldown tracking for rewarded ads
const adSessions = new Map<string, AdSessionRecord>();
const userLastAdStarted = new Map<string, number>();
const userLastAdCompleted = new Map<string, number>();
const userDailyAdCount = new Map<string, { count: number; date: string }>();

const AD_COOLDOWN_MS = 60 * 1000; // 1 minute cooldown in dev
const MAX_DAILY_ADS = 15;

export class RewardedAdsService {
  /**
   * Request an ad session before watching
   */
  static startAdSession(userId: string, purpose: 'revive' | 'double_rewards' | 'supply_drop'): {
    adSessionId: string;
    cooldownRemainingSec: number;
    dailyRemaining: number;
  } {
    const now = Date.now();
    const today = new Date().toISOString().slice(0, 10);

    // Check cooldown from last started or completed ad
    const lastStarted = userLastAdStarted.get(userId) || 0;
    const lastCompleted = userLastAdCompleted.get(userId) || 0;
    const lastTime = Math.max(lastStarted, lastCompleted);
    const elapsed = now - lastTime;
    if (elapsed < AD_COOLDOWN_MS) {
      const remaining = Math.ceil((AD_COOLDOWN_MS - elapsed) / 1000);
      throw new Error(`Rewarded ad cooldown active. Please wait ${remaining} seconds.`);
    }

    userLastAdStarted.set(userId, now);

    // Check daily cap
    const daily = userDailyAdCount.get(userId) || { count: 0, date: today };
    if (daily.date !== today) {
      daily.count = 0;
      daily.date = today;
    }

    if (daily.count >= MAX_DAILY_ADS) {
      throw new Error(`Daily rewarded ad limit reached (${MAX_DAILY_ADS}/${MAX_DAILY_ADS}).`);
    }

    const adSessionId = `ad_${crypto.randomBytes(12).toString('hex')}`;
    adSessions.set(adSessionId, {
      adSessionId,
      userId,
      purpose,
      createdAt: now,
      completed: false
    });

    return {
      adSessionId,
      cooldownRemainingSec: 0,
      dailyRemaining: MAX_DAILY_ADS - daily.count
    };
  }

  /**
   * Complete and verify ad session
   */
  static async completeAdSession(
    userId: string,
    adSessionId: string,
    simulatedProof?: string
  ): Promise<{
    verified: boolean;
    purpose: string;
    message: string;
  }> {
    const session = adSessions.get(adSessionId);
    if (!session) {
      throw new Error('Invalid or expired ad session');
    }

    if (session.userId !== userId) {
      throw new Error('Ad session does not belong to this user');
    }

    if (session.completed) {
      throw new Error('Ad reward has already been claimed for this session (replay attempt)');
    }

    // Minimum view time verification (at least 3 seconds)
    const elapsedMs = Date.now() - session.createdAt;
    if (elapsedMs < 2000) {
      throw new Error('Ad playback was terminated too quickly to verify completion');
    }

    session.completed = true;
    const now = Date.now();
    userLastAdCompleted.set(userId, now);

    const today = new Date().toISOString().slice(0, 10);
    const daily = userDailyAdCount.get(userId) || { count: 0, date: today };
    if (daily.date !== today) {
      daily.count = 1;
      daily.date = today;
    } else {
      daily.count += 1;
    }
    userDailyAdCount.set(userId, daily);

    await AuditLog.create({
      action: 'REWARDED_AD_COMPLETED',
      category: 'wallet',
      severity: 'info',
      details: {
        userId,
        adSessionId,
        purpose: session.purpose,
        simulatedProof
      }
    });

    return {
      verified: true,
      purpose: session.purpose,
      message: `Verified completion of ${session.purpose} rewarded ad (Dev simulated adapter).`
    };
  }
}
