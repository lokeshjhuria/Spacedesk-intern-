import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { Mission } from '../models/Mission';
import { MissionSession } from '../models/MissionSession';
import { MissionResult } from '../models/MissionResult';
import { PlayerProgress } from '../models/PlayerProgress';
import { PlayerProfile } from '../models/PlayerProfile';
import { LeaderboardEntry } from '../models/LeaderboardEntry';
import { Event } from '../models/Event';
import { SessionService } from '../services/sessionService';
import { AntiCheatService } from '../services/antiCheatService';
import { WalletService } from '../services/walletService';
import { DailyMission } from '../models/DailyMission';
import { PlayerAchievement } from '../models/PlayerAchievement';
import { Achievement } from '../models/Achievement';
import { IMissionSubmitPayload, ShipClass } from '../types/shared';

export class MissionController {
  /**
   * List all missions with player progression overlay
   */
  static async listMissions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      const missions = await Mission.find().sort({ numericId: 1 });
      const progress = await PlayerProgress.findOne({ userId });
      const profile = await PlayerProfile.findOne({ userId });

      const playerLevel = profile ? profile.level : 1;
      const completedMap = new Map<string, { stars: number; highestScore: number }>();

      if (progress && progress.completedMissions) {
        for (const cm of progress.completedMissions) {
          completedMap.set(cm.missionId, { stars: cm.stars, highestScore: cm.highestScore });
        }
      }

      const missionsWithStatus = missions.map((m) => {
        const completedInfo = completedMap.get(m.missionId);
        const isCompleted = !!completedInfo;

        // Check if unlocked
        let isUnlocked = false;
        if (m.numericId === 1) {
          isUnlocked = true;
        } else {
          const reqId = m.unlockRequirement.requiredMissionId;
          const meetsLevel = playerLevel >= m.unlockRequirement.minLevel;
          const meetsPrereq = !reqId || completedMap.has(reqId);
          isUnlocked = meetsLevel && meetsPrereq;
        }

        return {
          ...m.toObject(),
          isUnlocked,
          isCompleted,
          stars: completedInfo?.stars || 0,
          highestScore: completedInfo?.highestScore || 0
        };
      });

      res.json({
        success: true,
        missions: missionsWithStatus,
        totalCompleted: completedMap.size,
        totalMissions: missions.length
      });
    } catch (err: any) {
      console.error('[Mission List Error]', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Get mission details by ID
   */
  static async getMissionById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const mission = await Mission.findOne({ missionId: id });
      if (!mission) {
        res.status(404).json({ success: false, error: `Mission ${id} not found` });
        return;
      }
      res.json({ success: true, mission });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Start a mission session
   */
  static async startMission(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      const { id } = req.params;

      const { session, token } = await SessionService.startSession(userId, id);

      res.json({
        success: true,
        message: `Mission ${id} launch sequence authorized.`,
        sessionId: session.sessionId,
        sessionToken: token,
        minFeasibleDurationSec: session.minFeasibleDurationSec,
        expiresAt: session.expiresAt
      });
    } catch (err: any) {
      console.error('[Mission Start Error]', err);
      res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * Complete mission and claim rewards with server validation
   */
  static async completeMission(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      const { id } = req.params;
      const payload: IMissionSubmitPayload = req.body;

      if (!payload.sessionId) {
        res.status(400).json({ success: false, error: 'Session ID is required' });
        return;
      }

      // 1. Fetch Session and Mission
      const session = await MissionSession.findOne({ sessionId: payload.sessionId, userId });
      if (!session) {
        res.status(404).json({ success: false, error: 'Mission session not found or does not belong to you' });
        return;
      }

      const mission = await Mission.findOne({ missionId: id });
      if (!mission) {
        res.status(404).json({ success: false, error: 'Mission definition not found' });
        return;
      }

      // 2. Validate Session Anti-Cheat Integrity
      const validation = await AntiCheatService.validateSession(session, mission, payload);
      if (!validation.valid) {
        // Mark session invalidated
        session.status = 'invalidated';
        await session.save();

        res.status(400).json({
          success: false,
          error: validation.reason || 'Mission completion validation failed',
          validationFlags: validation.validationFlags
        });
        return;
      }

      // 3. Mark session COMPLETED atomically to prevent double claims
      session.status = 'completed';
      await session.save();

      // 4. Calculate Final Rewards (checking active limited-time events)
      const now = new Date();
      const activeEvent = await Event.findOne({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now }
      });

      const eventMultiplier = activeEvent ? activeEvent.rewardMultiplier : 1.0;
      const rewardsToAward = {
        credits: Math.round(mission.rewards.credits * (activeEvent?.bonusCurrency === 'credits' ? eventMultiplier : 1.0)),
        energyCores: Math.round(mission.rewards.energyCores * (activeEvent?.bonusCurrency === 'energyCores' ? eventMultiplier : 1.0)),
        xp: Math.round(mission.rewards.xp * eventMultiplier),
        veloopCoins: Math.round(mission.rewards.veloopCoins * (activeEvent?.bonusCurrency === 'veloopCoins' ? eventMultiplier : 1.0))
      };

      // 5. Grant rewards atomically to player wallet
      const idempotencyKey = `mission_reward_${session.sessionId}`;
      const updatedWallet = await WalletService.grantMissionRewards(
        userId,
        rewardsToAward,
        mission.missionId,
        idempotencyKey
      );

      // 6. Record Mission Result
      await MissionResult.create({
        sessionId: session.sessionId,
        userId,
        missionId: mission.missionId,
        elapsedSeconds: payload.elapsedSeconds,
        score: payload.score,
        starsAwarded: validation.stars,
        accuracyPercent: payload.accuracyPercent,
        damageTaken: payload.damageTaken,
        powerupsCollected: payload.powerupsCollected,
        enemiesDefeated: payload.enemiesDefeated,
        rewardsGranted: rewardsToAward,
        validationFlags: validation.validationFlags
      });

      // 7. Update Player Progress & Mission Unlocks
      let progress = await PlayerProgress.findOne({ userId });
      if (!progress) {
        progress = await PlayerProgress.create({ userId, completedMissions: [], unlockedShips: ['ship_interceptor'], unlockedSectors: [1] });
      }

      const existingCompleted = progress.completedMissions.find((m) => m.missionId === mission.missionId);
      let newHighestScore = payload.score;

      if (existingCompleted) {
        existingCompleted.stars = Math.max(existingCompleted.stars, validation.stars);
        existingCompleted.highestScore = Math.max(existingCompleted.highestScore, payload.score);
        existingCompleted.completedAt = new Date();
        newHighestScore = existingCompleted.highestScore;
      } else {
        progress.completedMissions.push({
          missionId: mission.missionId,
          stars: validation.stars,
          highestScore: payload.score,
          completedAt: new Date()
        });
      }

      // Check if boss mission cleared, unlock next sector
      if (mission.bossConfig && mission.numericId % 10 === 0) {
        const nextSector = Math.floor(mission.numericId / 10) + 1;
        if (nextSector <= 5 && !progress.unlockedSectors.includes(nextSector)) {
          progress.unlockedSectors.push(nextSector);
        }
      }

      await progress.save();

      // 8. Update Player Profile Level and Stats
      const profile = await PlayerProfile.findOne({ userId });
      let levelUp = false;
      let newLevel = profile ? profile.level : 1;

      if (profile) {
        profile.xp += rewardsToAward.xp;
        profile.totalMissionsCompleted += 1;
        profile.totalScore += payload.score;
        profile.stats.enemiesKilled += payload.enemiesDefeated || 0;
        profile.stats.powerupsCollected += payload.powerupsCollected || 0;
        profile.stats.playTimeSeconds += payload.elapsedSeconds || 0;
        if (mission.bossConfig) {
          profile.stats.bossesDefeated += 1;
        }

        // Level formula: level = floor(sqrt(xp / 100)) + 1
        const calculatedLevel = Math.max(1, Math.floor(Math.sqrt(profile.xp / 100)) + 1);
        if (calculatedLevel > profile.level) {
          levelUp = true;
          profile.level = calculatedLevel;
          newLevel = calculatedLevel;
        }

        await profile.save();
      }

      // 9. Update Leaderboard Entry
      const playerShipClass = (profile?.equippedShipId.replace('ship_', '') || 'interceptor') as ShipClass;
      await LeaderboardEntry.findOneAndUpdate(
        { userId, missionId: mission.missionId },
        {
          $max: { score: payload.score },
          $set: {
            displayName: profile?.displayName || req.user!.username,
            avatarUrl: profile?.avatarUrl || '/avatars/pilot_default.png',
            missionTitle: mission.title,
            shipClass: playerShipClass,
            accuracy: payload.accuracyPercent,
            completedAt: new Date(),
            verified: true
          }
        },
        { upsert: true, new: true }
      );

      // 10. Update Daily Missions Progress
      await DailyMission.updateMany(
        { userId, type: 'missions', isClaimed: false },
        { $inc: { current: 1 } }
      );
      if (payload.enemiesDefeated > 0) {
        await DailyMission.updateMany(
          { userId, type: 'kills', isClaimed: false },
          { $inc: { current: payload.enemiesDefeated } }
        );
      }
      if (payload.powerupsCollected > 0) {
        await DailyMission.updateMany(
          { userId, type: 'powerups', isClaimed: false },
          { $inc: { current: payload.powerupsCollected } }
        );
      }

      // 11. Check next unlocked mission
      const nextNumericId = mission.numericId + 1;
      const nextMission = nextNumericId <= 50 ? await Mission.findOne({ numericId: nextNumericId }) : null;

      res.json({
        success: true,
        message: `Mission ${mission.missionId} successfully completed!`,
        stars: validation.stars,
        rewardsAwarded: rewardsToAward,
        newScore: payload.score,
        highestScore: newHighestScore,
        levelUp,
        newLevel,
        currentWallet: updatedWallet,
        nextMissionUnlocked: nextMission ? nextMission.missionId : undefined
      });
    } catch (err: any) {
      console.error('[Mission Complete Error]', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

