import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/database';
import { Ship } from '../models/Ship';
import { Upgrade } from '../models/Upgrade';
import { Mission } from '../models/Mission';
import { Achievement } from '../models/Achievement';
import { Event } from '../models/Event';
import { User } from '../models/User';
import { PlayerProfile } from '../models/PlayerProfile';
import { PlayerProgress } from '../models/PlayerProgress';
import { PlayerShip } from '../models/PlayerShip';
import { Wallet } from '../models/Wallet';
import { SHIPS_SEED_DATA } from './shipsData';
import { UPGRADES_SEED_DATA } from './upgradesData';
import { MISSIONS_SEED_DATA } from './missionsData';
import { ACHIEVEMENTS_SEED_DATA } from './achievementsData';
import { EVENTS_SEED_DATA } from './eventsData';

export async function runSeed(closeConnectionOnFinish = false): Promise<void> {
  console.log('[Seed] Starting database seed...');
  await connectDB();

  // 1. Seed Ships (Upsert)
  for (const shipData of SHIPS_SEED_DATA) {
    await Ship.findOneAndUpdate({ shipId: shipData.shipId }, shipData, { upsert: true, new: true });
  }
  console.log(`[Seed] Seeded ${SHIPS_SEED_DATA.length} ship classes.`);

  // 2. Seed Upgrades (Upsert)
  for (const upgData of UPGRADES_SEED_DATA) {
    await Upgrade.findOneAndUpdate({ upgradeId: upgData.upgradeId }, upgData, { upsert: true, new: true });
  }
  console.log(`[Seed] Seeded ${UPGRADES_SEED_DATA.length} upgrades.`);

  // 3. Seed Missions (50 playable missions)
  for (const missionData of MISSIONS_SEED_DATA) {
    await Mission.findOneAndUpdate({ missionId: missionData.missionId }, missionData, {
      upsert: true,
      new: true
    });
  }
  console.log(`[Seed] Seeded ${MISSIONS_SEED_DATA.length} missions across 5 sectors.`);

  // 4. Seed Achievements
  for (const achData of ACHIEVEMENTS_SEED_DATA) {
    await Achievement.findOneAndUpdate({ achievementId: achData.achievementId }, achData, {
      upsert: true,
      new: true
    });
  }
  console.log(`[Seed] Seeded ${ACHIEVEMENTS_SEED_DATA.length} achievements.`);

  // 5. Seed Events
  for (const evtData of EVENTS_SEED_DATA) {
    await Event.findOneAndUpdate({ eventId: evtData.eventId }, evtData, { upsert: true, new: true });
  }
  console.log(`[Seed] Seeded ${EVENTS_SEED_DATA.length} events.`);

  // 6. Seed Default Accounts
  const salt = await bcrypt.genSalt(10);
  const defaultPassword = await bcrypt.hash('Password123!', salt);
  const adminPassword = await bcrypt.hash('AdminPass123!', salt);

  // Pilot User
  let pilotUser = await User.findOne({ email: 'pilot@veloop.io' });
  if (!pilotUser) {
    pilotUser = await User.create({
      username: 'StarCommander',
      email: 'pilot@veloop.io',
      passwordHash: defaultPassword,
      role: 'player'
    });

    await PlayerProfile.create({
      userId: pilotUser._id,
      displayName: 'Commander Nova',
      avatarUrl: '/avatars/pilot_default.png',
      level: 1,
      xp: 0,
      equippedShipId: 'ship_interceptor',
      equippedUpgrades: {
        weapon: 1,
        shield: 1,
        engine: 1,
        hull: 1,
        reactor: 1
      },
      highestSector: 1,
      totalMissionsCompleted: 0,
      totalScore: 0,
      stats: {
        enemiesKilled: 0,
        bossesDefeated: 0,
        deaths: 0,
        powerupsCollected: 0,
        playTimeSeconds: 0
      }
    });

    await PlayerProgress.create({
      userId: pilotUser._id,
      completedMissions: [],
      unlockedShips: ['ship_interceptor'],
      unlockedSectors: [1]
    });

    await PlayerShip.create({
      userId: pilotUser._id,
      shipId: 'ship_interceptor',
      isEquipped: true,
      upgradeLevels: { weapon: 1, shield: 1, speed: 1, special: 1 }
    });

    await Wallet.create({
      userId: pilotUser._id,
      credits: 1000,
      energyCores: 10,
      veloopCoins: 25,
      xp: 0
    });

    console.log('[Seed] Created default pilot account: pilot@veloop.io (Password: Password123!)');
  }

  // Admin User
  let adminUser = await User.findOne({ email: 'admin@veloop.io' });
  if (!adminUser) {
    adminUser = await User.create({
      username: 'CosmicAdmin',
      email: 'admin@veloop.io',
      passwordHash: adminPassword,
      role: 'admin'
    });

    await PlayerProfile.create({
      userId: adminUser._id,
      displayName: 'Fleet Admiral Admin',
      avatarUrl: '/avatars/admin_default.png',
      level: 50,
      xp: 99999,
      equippedShipId: 'ship_nova',
      equippedUpgrades: {
        weapon: 10,
        shield: 10,
        engine: 10,
        hull: 10,
        reactor: 10
      },
      highestSector: 5,
      totalMissionsCompleted: 50,
      totalScore: 999999
    });

    await PlayerProgress.create({
      userId: adminUser._id,
      completedMissions: [],
      unlockedShips: ['ship_interceptor', 'ship_guardian', 'ship_destroyer', 'ship_phantom', 'ship_nova'],
      unlockedSectors: [1, 2, 3, 4, 5]
    });

    await Wallet.create({
      userId: adminUser._id,
      credits: 999999,
      energyCores: 9999,
      veloopCoins: 9999,
      xp: 99999
    });

    console.log('[Seed] Created default admin account: admin@veloop.io (Password: AdminPass123!)');
  }

  console.log('[Seed] Database seed completed successfully!');

  if (closeConnectionOnFinish) {
    await disconnectDB();
  }
}

// Allow standalone CLI execution: ts-node-dev src/seeds/seed.ts
if (require.main === module) {
  runSeed(true)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed Error]', err);
      process.exit(1);
    });
}
