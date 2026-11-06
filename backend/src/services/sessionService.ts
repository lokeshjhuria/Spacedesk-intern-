import crypto from 'crypto';
import mongoose from 'mongoose';
import { Mission } from '../models/Mission';
import { MissionSession, IMissionSessionDocument } from '../models/MissionSession';
import { PlayerProgress } from '../models/PlayerProgress';
import { PlayerProfile } from '../models/PlayerProfile';
import { env } from '../config/env';

export class SessionService {
  /**
   * Create and register a secure mission session
   */
  static async startSession(
    userId: string | mongoose.Types.ObjectId,
    missionId: string
  ): Promise<{ session: IMissionSessionDocument; token: string }> {
    const mission = await Mission.findOne({ missionId });
    if (!mission) {
      throw new Error(`Mission ${missionId} not found`);
    }

    // In development or if sampling first mission of sector, allow flexible launch
    const isSectorLead = mission.numericId === 1 || (mission.numericId - 1) % 10 === 0;
    const isDev = env.NODE_ENV !== 'production';

    // Verify player level requirement (if not dev or sector lead)
    const profile = await PlayerProfile.findOne({ userId });
    const currentLevel = profile ? profile.level : 1;
    if (!isDev && !isSectorLead && mission.unlockRequirement.minLevel > currentLevel) {
      throw new Error(`Pilot level ${mission.unlockRequirement.minLevel} required to launch this mission`);
    }

    // Verify mission prerequisite
    if (!isDev && !isSectorLead && mission.unlockRequirement.requiredMissionId) {
      const progress = await PlayerProgress.findOne({ userId });
      const hasCompletedPrereq = progress?.completedMissions.some(
        (m) => m.missionId === mission.unlockRequirement.requiredMissionId
      );
      if (!hasCompletedPrereq) {
        throw new Error(`Must complete mission ${mission.unlockRequirement.requiredMissionId} first`);
      }
    }

    // Invalidate any existing active sessions for this user on this mission
    await MissionSession.updateMany(
      { userId, missionId, status: 'active' },
      { $set: { status: 'abandoned' } }
    );

    // Calculate total enemies and duration constraints
    let totalEnemies = 0;
    let waveSpawnTime = 0;
    for (const wave of mission.waves) {
      waveSpawnTime += wave.spawnDelaySeconds || 2;
      for (const enemy of wave.enemies) {
        totalEnemies += enemy.count;
      }
    }

    // Boss presence adds duration and score potential
    if (mission.bossConfig) {
      totalEnemies += 1;
      waveSpawnTime += 15; // Boss battle minimum time
    }

    // Mathematical constraints:
    // Min feasible duration: allow swift pilot clears while blocking bot speedhacks
    const minFeasibleDurationSec = Math.max(3, Math.floor(waveSpawnTime * 0.2));

    // Max feasible score: ample headroom for high combos and golden apple powerups
    const maxFeasibleScore = Math.ceil(
      totalEnemies * 4000 + (mission.bossConfig ? 30000 : 0) + 50000
    );

    const sessionId = `sess_${crypto.randomBytes(16).toString('hex')}`;
    const tokenPayload = `${sessionId}:${userId}:${missionId}:${Date.now()}`;
    const sessionToken = crypto
      .createHmac('sha256', env.JWT_SECRET)
      .update(tokenPayload)
      .digest('hex');

    const expiresAt = new Date(Date.now() + 20 * 60 * 1000); // 20 minutes validity

    const session = await MissionSession.create({
      sessionId,
      userId,
      missionId,
      startedAt: new Date(),
      expiresAt,
      status: 'active',
      sessionToken,
      minFeasibleDurationSec,
      maxFeasibleScore,
      enemyCountExpected: totalEnemies
    });

    return { session, token: sessionToken };
  }

  /**
   * Verify session token integrity
   */
  static verifySessionToken(token: string, session: IMissionSessionDocument): boolean {
    return token === session.sessionToken;
  }
}
