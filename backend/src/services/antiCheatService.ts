import { MissionSession, IMissionSessionDocument } from '../models/MissionSession';
import { Mission, IMissionDocument } from '../models/Mission';
import { AuditLog } from '../models/AuditLog';
import { IMissionSubmitPayload, IMissionValidationResult } from '../types/shared';

export class AntiCheatService {
  /**
   * Validate gameplay session metrics against physics and statistical bounds
   */
  static async validateSession(
    session: IMissionSessionDocument,
    mission: IMissionDocument,
    payload: IMissionSubmitPayload
  ): Promise<{
    valid: boolean;
    stars: number;
    reason?: string;
    validationFlags: string[];
  }> {
    const flags: string[] = [];

    // 1. Session Status Check
    if (session.status !== 'active') {
      return {
        valid: false,
        stars: 0,
        reason: `Session is already ${session.status}. Replay attack prevented.`,
        validationFlags: ['REPLAY_ATTEMPT']
      };
    }

    // 2. Expiration Check
    if (new Date() > new Date(session.expiresAt)) {
      return {
        valid: false,
        stars: 0,
        reason: 'Mission session has expired.',
        validationFlags: ['SESSION_EXPIRED']
      };
    }

    // 3. Physical Duration Check
    // Prevent 0-second bot completions
    if (payload.elapsedSeconds < session.minFeasibleDurationSec) {
      flags.push('SUSPICIOUS_SPEED_HACK');
      await AuditLog.create({
        userId: session.userId,
        action: 'ANTI_CHEAT_VIOLATION',
        category: 'anti_cheat',
        severity: 'critical',
        details: {
          sessionId: session.sessionId,
          missionId: session.missionId,
          elapsedSeconds: payload.elapsedSeconds,
          minFeasibleDurationSec: session.minFeasibleDurationSec,
          score: payload.score
        }
      });

      return {
        valid: false,
        stars: 0,
        reason: `Mission completed too quickly (${payload.elapsedSeconds}s). Minimum feasible duration is ${session.minFeasibleDurationSec}s.`,
        validationFlags: flags
      };
    }

    // 4. Score Plausibility Check
    if (payload.score > session.maxFeasibleScore) {
      flags.push('EXORBITANT_SCORE');
      await AuditLog.create({
        userId: session.userId,
        action: 'ANTI_CHEAT_VIOLATION',
        category: 'anti_cheat',
        severity: 'critical',
        details: {
          sessionId: session.sessionId,
          missionId: session.missionId,
          score: payload.score,
          maxFeasibleScore: session.maxFeasibleScore
        }
      });

      return {
        valid: false,
        stars: 0,
        reason: `Submitted score (${payload.score}) exceeds mathematical ceiling (${session.maxFeasibleScore}) for this mission.`,
        validationFlags: flags
      };
    }

    // 5. Enemy Kill Count Sanity
    // With small allowance for enemy spawns / drones
    const maxKillsAllowed = Math.ceil(session.enemyCountExpected * 1.5) + 5;
    if (payload.enemiesDefeated > maxKillsAllowed) {
      flags.push('EXCESSIVE_KILL_COUNT');
      await AuditLog.create({
        userId: session.userId,
        action: 'SUSPICIOUS_METRICS',
        category: 'anti_cheat',
        severity: 'warn',
        details: {
          sessionId: session.sessionId,
          enemiesDefeated: payload.enemiesDefeated,
          maxKillsAllowed
        }
      });
    }

    // 6. Accuracy Sanity
    if (payload.accuracyPercent < 0 || payload.accuracyPercent > 100) {
      return {
        valid: false,
        stars: 0,
        reason: 'Invalid accuracy percentage.',
        validationFlags: ['INVALID_ACCURACY']
      };
    }

    // 7. Calculate Star Rating Server-Authoritatively
    // Thresholds: [oneStarScore, twoStarScore, threeStarScore]
    const [t1, t2, t3] = mission.starCriteria.scoreThresholds;
    let stars = 1; // 1 star for clearing the objective

    if (payload.score >= t3 && payload.healthRemaining >= 40) {
      stars = 3;
    } else if (payload.score >= t2) {
      stars = 2;
    }

    flags.push('VALID');

    return {
      valid: true,
      stars,
      validationFlags: flags
    };
  }
}

