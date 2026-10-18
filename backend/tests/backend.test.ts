import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { connectDB, disconnectDB } from '../src/config/database';
import { runSeed } from '../src/seeds/seed';
import { User } from '../src/models/User';
import { Wallet } from '../src/models/Wallet';
import { WalletService } from '../src/services/walletService';
import { SessionService } from '../src/services/sessionService';
import { AntiCheatService } from '../src/services/antiCheatService';
import { RewardedAdsService } from '../src/services/rewardedAdsService';
import { Mission } from '../src/models/Mission';
import { MissionSession } from '../src/models/MissionSession';

describe('SPACE SHOOTER ODYSSEY - Backend Suite', () => {
  let playerToken: string;
  let playerId: string;
  let adminToken: string;

  beforeAll(async () => {
    await connectDB();
    await runSeed(false);
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('1. Health Check & API Docs', () => {
    it('should return 200 OK on /api/health', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('online');
      expect(res.body.title).toBe('SPACE SHOOTER ODYSSEY');
    });

    it('should serve Swagger UI at /api/docs', async () => {
      const res = await request(app).get('/api/docs/');
      expect([200, 301, 302]).toContain(res.status);
    });
  });

  describe('2. Authentication & Authorization', () => {
    it('should authenticate pre-seeded pilot user', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'pilot@veloop.io',
        password: 'Password123!'
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('player');

      playerToken = res.body.token;
      playerId = res.body.user.id;
    });

    it('should authenticate pre-seeded admin user', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'admin@veloop.io',
        password: 'AdminPass123!'
      });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('admin');
      adminToken = res.body.token;
    });

    it('should reject invalid password', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'pilot@veloop.io',
        password: 'WrongPassword'
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should register a new pilot with starter wallet and profile', async () => {
      const rand = Math.floor(Math.random() * 100000);
      const res = await request(app).post('/api/v1/auth/register').send({
        username: `Cadet_${rand}`,
        email: `cadet_${rand}@veloop.io`,
        password: 'SecurePassword123!'
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.wallet.credits).toBe(500);
      expect(res.body.wallet.energyCores).toBe(5);
    });

    it('should reject duplicate username or email', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        username: 'StarCommander',
        email: 'pilot@veloop.io',
        password: 'Password123!'
      });

      expect(res.status).toBe(409);
    });

    it('should reject unauthenticated access to protected route', async () => {
      const res = await request(app).get('/api/v1/player/profile');
      expect(res.status).toBe(401);
    });

    it('should allow pilot access to player profile with Bearer token', async () => {
      const res = await request(app)
        .get('/api/v1/player/profile')
        .set('Authorization', `Bearer ${playerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.profile.level).toBeGreaterThanOrEqual(1);
    });
  });

  describe('3. Economy & Atomic Wallet Operations', () => {
    it('should atomically deduct credits when sufficient balance', async () => {
      const initialWallet = await WalletService.getWallet(playerId);
      const initialCredits = initialWallet.credits;

      const result = await WalletService.adjustBalance({
        userId: playerId,
        currency: 'credits',
        amount: -100,
        type: 'upgrade_purchase',
        referenceId: 'test_upgrade_1',
        note: 'Unit test deduction'
      });

      expect(result.wallet.credits).toBe(initialCredits - 100);
    });

    it('should reject debit when insufficient balance', async () => {
      await expect(
        WalletService.adjustBalance({
          userId: playerId,
          currency: 'credits',
          amount: -9999999,
          type: 'ship_purchase',
          referenceId: 'test_overspend'
        })
      ).rejects.toThrow(/Insufficient credits balance/i);
    });

    it('should maintain transaction idempotency when key supplied', async () => {
      const idempKey = `test_idemp_${Date.now()}`;

      const first = await WalletService.adjustBalance({
        userId: playerId,
        currency: 'credits',
        amount: 250,
        type: 'mission_reward',
        referenceId: 'test_m1',
        idempotencyKey: idempKey
      });

      expect(first.alreadyProcessed).toBe(false);

      // Second identical call
      const second = await WalletService.adjustBalance({
        userId: playerId,
        currency: 'credits',
        amount: 250,
        type: 'mission_reward',
        referenceId: 'test_m1',
        idempotencyKey: idempKey
      });

      expect(second.alreadyProcessed).toBe(true);
      expect(second.wallet.credits).toBe(first.wallet.credits);
    });
  });

  describe('4. Missions & Server-Authoritative Anti-Cheat', () => {
    let missionSessionId: string;
    let missionSessionToken: string;

    it('should list all 50 missions with unlocks and stars', async () => {
      const res = await request(app)
        .get('/api/v1/missions')
        .set('Authorization', `Bearer ${playerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.missions.length).toBe(50);
      expect(res.body.missions[0].isUnlocked).toBe(true);
      expect(res.body.missions[0].missionId).toBe('M-01');
    });

    it('should start a session for Mission M-01 and return cryptographic session token', async () => {
      const res = await request(app)
        .post('/api/v1/missions/M-01/start')
        .set('Authorization', `Bearer ${playerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.sessionId).toBeDefined();
      expect(res.body.sessionToken).toBeDefined();
      expect(res.body.minFeasibleDurationSec).toBeGreaterThan(0);

      missionSessionId = res.body.sessionId;
      missionSessionToken = res.body.sessionToken;
    });

    it('should reject completion if elapsed time is unrealistically low (speed hack detection)', async () => {
      const res = await request(app)
        .post('/api/v1/missions/M-01/complete')
        .set('Authorization', `Bearer ${playerToken}`)
        .send({
          sessionId: missionSessionId,
          missionId: 'M-01',
          elapsedSeconds: 1, // 1 second is physically impossible for 5 waves
          score: 5000,
          enemiesDefeated: 20,
          accuracyPercent: 90,
          damageTaken: 10,
          powerupsCollected: 1,
          healthRemaining: 90,
          maxCombo: 10
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/too quickly/i);
    });

    it('should reject completion if score exceeds mathematical ceiling', async () => {
      // Start fresh session
      const startRes = await request(app)
        .post('/api/v1/missions/M-01/start')
        .set('Authorization', `Bearer ${playerToken}`);

      const newSessId = startRes.body.sessionId;

      const res = await request(app)
        .post('/api/v1/missions/M-01/complete')
        .set('Authorization', `Bearer ${playerToken}`)
        .send({
          sessionId: newSessId,
          missionId: 'M-01',
          elapsedSeconds: 30,
          score: 99999999, // Impossible exorbitant score
          enemiesDefeated: 20,
          accuracyPercent: 90,
          damageTaken: 10,
          powerupsCollected: 1,
          healthRemaining: 90,
          maxCombo: 10
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/exceeds mathematical ceiling/i);
    });

    it('should validate legitimate completion, calculate star rating server-side, and grant rewards atomically', async () => {
      // Start legitimate session
      const startRes = await request(app)
        .post('/api/v1/missions/M-01/start')
        .set('Authorization', `Bearer ${playerToken}`);

      const legitSessionId = startRes.body.sessionId;

      const res = await request(app)
        .post('/api/v1/missions/M-01/complete')
        .set('Authorization', `Bearer ${playerToken}`)
        .send({
          sessionId: legitSessionId,
          missionId: 'M-01',
          elapsedSeconds: 30,
          score: 4500,
          enemiesDefeated: 15,
          accuracyPercent: 88,
          damageTaken: 30,
          powerupsCollected: 2,
          healthRemaining: 70,
          maxCombo: 8
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stars).toBeGreaterThanOrEqual(1);
      expect(res.body.rewardsAwarded.credits).toBeGreaterThan(0);
      expect(res.body.currentWallet).toBeDefined();

      // Verify Replay Protection: Cannot submit same session again!
      const replayRes = await request(app)
        .post('/api/v1/missions/M-01/complete')
        .set('Authorization', `Bearer ${playerToken}`)
        .send({
          sessionId: legitSessionId,
          missionId: 'M-01',
          elapsedSeconds: 25,
          score: 4500,
          enemiesDefeated: 15,
          accuracyPercent: 88,
          damageTaken: 30,
          powerupsCollected: 2,
          healthRemaining: 70,
          maxCombo: 8
        });

      expect(replayRes.status).toBe(400);
      expect(replayRes.body.error).toMatch(/already completed|replay/i);
    });
  });

  describe('5. Ships & Upgrades System', () => {
    it('should list all 5 ship classes', async () => {
      const res = await request(app)
        .get('/api/v1/ships')
        .set('Authorization', `Bearer ${playerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.ships.length).toBe(5);

      const classes = res.body.ships.map((s: any) => s.class);
      expect(classes).toContain('interceptor');
      expect(classes).toContain('guardian');
      expect(classes).toContain('destroyer');
      expect(classes).toContain('phantom');
      expect(classes).toContain('nova');
    });

    it('should list upgrade systems and allow purchasing upgrade', async () => {
      // First grant player enough credits for test
      await WalletService.adjustBalance({
        userId: playerId,
        currency: 'credits',
        amount: 2000,
        type: 'admin_grant',
        referenceId: 'test_upgrade_funds'
      });
      await WalletService.adjustBalance({
        userId: playerId,
        currency: 'energyCores',
        amount: 20,
        type: 'admin_grant',
        referenceId: 'test_upgrade_cores'
      });

      const listRes = await request(app)
        .get('/api/v1/upgrades')
        .set('Authorization', `Bearer ${playerToken}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.upgrades.length).toBe(5);

      const purchaseRes = await request(app)
        .post('/api/v1/upgrades/purchase')
        .set('Authorization', `Bearer ${playerToken}`)
        .send({ category: 'weapon' });

      expect(purchaseRes.status).toBe(200);
      expect(purchaseRes.body.success).toBe(true);
      expect(purchaseRes.body.newLevel).toBe(2);
    });
  });

  describe('6. Rewarded Ads & Daily Rewards', () => {
    it('should return daily streak status and permit daily reward claim', async () => {
      const streakRes = await request(app)
        .get('/api/v1/wallet/streak')
        .set('Authorization', `Bearer ${playerToken}`);

      expect(streakRes.status).toBe(200);
      expect(streakRes.body.streak.currentStreak).toBeDefined();

      const claimRes = await request(app)
        .post('/api/v1/wallet/daily/claim')
        .set('Authorization', `Bearer ${playerToken}`);

      expect(claimRes.status).toBe(200);
      expect(claimRes.body.success).toBe(true);
      expect(claimRes.body.reward.credits).toBeGreaterThan(0);

      // Re-claiming same day must be rejected
      const duplicateClaim = await request(app)
        .post('/api/v1/wallet/daily/claim')
        .set('Authorization', `Bearer ${playerToken}`);

      expect(duplicateClaim.status).toBe(400);
    });

    it('should enforce cooldown and verify rewarded ad sessions', () => {
      const adSession = RewardedAdsService.startAdSession(playerId, 'supply_drop');
      expect(adSession.adSessionId).toBeDefined();

      // Immediate second request must trigger cooldown error
      expect(() => {
        RewardedAdsService.startAdSession(playerId, 'supply_drop');
      }).toThrow(/cooldown active/i);
    });
  });

  describe('7. Leaderboard & Admin Controls', () => {
    it('should return server-verified leaderboard rankings', async () => {
      const res = await request(app).get('/api/v1/leaderboard');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.leaderboard)).toBe(true);
    });

    it('should reject non-admin from admin audit log endpoint', async () => {
      const res = await request(app)
        .get('/api/v1/admin/audit-logs')
        .set('Authorization', `Bearer ${playerToken}`);

      expect(res.status).toBe(403);
    });

    it('should permit admin to inspect audit logs and system stats', async () => {
      const res = await request(app)
        .get('/api/v1/admin/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const statsRes = await request(app)
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(statsRes.status).toBe(200);
      expect(statsRes.body.stats.totalUsers).toBeGreaterThan(0);
    });
  });
});
