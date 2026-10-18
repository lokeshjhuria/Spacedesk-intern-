import { Request, Response } from 'express';
import { LeaderboardEntry } from '../models/LeaderboardEntry';

export class LeaderboardController {
  static async getLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const missionId = req.query.missionId as string | undefined;
      const limit = Math.min(100, Number(req.query.limit) || 20);
      const page = Math.max(1, Number(req.query.page) || 1);
      const skip = (page - 1) * limit;

      const filter: Record<string, any> = { verified: true };
      if (missionId) {
        filter.missionId = missionId;
      }

      const entries = await LeaderboardEntry.find(filter)
        .sort({ score: -1 })
        .skip(skip)
        .limit(limit);

      const total = await LeaderboardEntry.countDocuments(filter);

      // Assign dynamic rank based on pagination
      const rankedEntries = entries.map((entry, idx) => ({
        rank: skip + idx + 1,
        id: entry._id,
        userId: entry.userId,
        displayName: entry.displayName,
        avatarUrl: entry.avatarUrl,
        score: entry.score,
        missionId: entry.missionId,
        missionTitle: entry.missionTitle,
        shipClass: entry.shipClass,
        accuracy: entry.accuracy,
        completedAt: entry.completedAt
      }));

      res.json({
        success: true,
        leaderboard: rankedEntries,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
