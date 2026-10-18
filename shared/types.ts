export type ShipClass = 'interceptor' | 'guardian' | 'destroyer' | 'phantom' | 'nova';

export type UserRole = 'player' | 'admin';

export type CurrencyType = 'credits' | 'energyCores' | 'veloopCoins' | 'xp';

export type TransactionType =
  | 'mission_reward'
  | 'upgrade_purchase'
  | 'ship_purchase'
  | 'daily_reward'
  | 'streak_reward'
  | 'achievement_reward'
  | 'event_reward'
  | 'ad_boost'
  | 'admin_grant';

export interface IUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface IPlayerProfile {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  equippedShipId: string;
  equippedUpgrades: Record<string, number>; // category -> level
  highestSector: number;
  totalMissionsCompleted: number;
  totalScore: number;
  stats: {
    enemiesKilled: number;
    bossesDefeated: number;
    deaths: number;
    powerupsCollected: number;
    playTimeSeconds: number;
  };
}

export interface ICompletedMission {
  missionId: string;
  stars: number;
  highestScore: number;
  completedAt: string;
}

export interface IPlayerProgress {
  userId: string;
  completedMissions: ICompletedMission[];
  unlockedShips: string[];
  unlockedSectors: number[];
}

export interface IShipStats {
  speed: number;        // 1 to 10
  fireRate: number;     // shots per second (e.g. 3 to 10)
  health: number;       // base hit points (e.g. 100 to 250)
  shield: number;       // shield points (e.g. 50 to 200)
  damage: number;       // damage per projectile (e.g. 15 to 40)
  criticalChance: number; // 0.05 to 0.35
}

export interface IShipSpecialAbility {
  name: string;
  description: string;
  cooldownSeconds: number;
  durationSeconds: number;
  icon: string;
}

export interface IShip {
  id: string;
  name: string;
  class: ShipClass;
  subtitle: string;
  description: string;
  lore: string;
  baseStats: IShipStats;
  specialAbility: IShipSpecialAbility;
  price: {
    credits: number;
    energyCores: number;
    veloopCoins?: number;
  };
  unlockRequirement: {
    minLevel: number;
    requiredMissionId?: string;
  };
  visualTheme: {
    primaryColor: string;
    accentColor: string;
    engineGlow: string;
  };
}

export type UpgradeCategory = 'weapon' | 'shield' | 'engine' | 'hull' | 'reactor';

export interface IUpgrade {
  id: string;
  category: UpgradeCategory;
  name: string;
  description: string;
  currentLevel: number;
  maxLevel: number;
  multiplierPerLevel: number;
  baseCost: {
    credits: number;
    energyCores: number;
  };
  costMultiplier: number;
}

export type PowerupType =
  | 'shield'
  | 'rapid_fire'
  | 'homing_missiles'
  | 'emp_blast'
  | 'healing'
  | 'damage_boost'
  | 'multi_shot'
  | 'invulnerability';

export interface IPowerupConfig {
  type: PowerupType;
  name: string;
  description: string;
  durationSeconds: number;
  color: string;
  icon: string;
}

export type DifficultyLevel = 'Recruit' | 'Veteran' | 'Elite' | 'Master' | 'Nightmare';

export type MissionObjectiveType = 'elimination' | 'survival' | 'boss' | 'escort' | 'score';

export interface IEnemyWave {
  waveNumber: number;
  spawnDelaySeconds: number;
  enemies: {
    type: 'scout' | 'interceptor_drone' | 'heavy_cruiser' | 'stealth_infiltrator' | 'swarm_bomber';
    count: number;
    speed: number;
    health: number;
    damage: number;
  }[];
}

export interface IBossConfig {
  bossType: 'aegis_dreadnought' | 'nebula_leviathan' | 'cyber_overlord' | 'solar_titan' | 'void_empress';
  name: string;
  title: string;
  health: number;
  shield: number;
  phases: number;
  specialAttacks: string[];
}

export interface IMission {
  id: string;
  numericId: number;
  title: string;
  sector: number;
  sectorName: string;
  description: string;
  loreBrief: string;
  difficulty: DifficultyLevel;
  recommendedShipClass: ShipClass;
  objective: {
    type: MissionObjectiveType;
    targetCount?: number;
    targetSeconds?: number;
    description: string;
  };
  waves: IEnemyWave[];
  bossConfig?: IBossConfig;
  rewards: {
    credits: number;
    energyCores: number;
    xp: number;
    veloopCoins: number;
  };
  unlockRequirement: {
    requiredMissionId?: string;
    minLevel: number;
  };
  starCriteria: {
    oneStar: string;
    twoStar: string;
    threeStar: string;
    scoreThresholds: [number, number, number];
  };
}

export interface IWallet {
  userId: string;
  credits: number;
  energyCores: number;
  veloopCoins: number;
  xp: number;
  updatedAt: string;
}

export interface IWalletTransaction {
  id: string;
  userId: string;
  currency: CurrencyType;
  amount: number;
  type: TransactionType;
  balanceAfter: number;
  referenceId: string;
  idempotencyKey?: string;
  note?: string;
  timestamp: string;
}

export interface IMissionSession {
  sessionId: string;
  userId: string;
  missionId: string;
  startedAt: string;
  expiresAt: string;
  status: 'active' | 'completed' | 'abandoned' | 'invalidated';
  sessionToken: string;
  minFeasibleDurationSec: number;
  maxFeasibleScore: number;
}

export interface IMissionSubmitPayload {
  sessionId: string;
  missionId: string;
  elapsedSeconds: number;
  score: number;
  enemiesDefeated: number;
  accuracyPercent: number;
  damageTaken: number;
  powerupsCollected: number;
  healthRemaining: number;
  maxCombo: number;
}

export interface IMissionValidationResult {
  success: boolean;
  valid: boolean;
  message: string;
  stars: number;
  rewardsAwarded: {
    credits: number;
    energyCores: number;
    xp: number;
    veloopCoins: number;
  };
  levelUp: boolean;
  newLevel: number;
  newHighestScore: number;
  nextMissionUnlocked?: string;
}

export interface ILeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl: string;
  score: number;
  missionId: string;
  missionTitle: string;
  shipClass: ShipClass;
  accuracy: number;
  completedAt: string;
}

export interface IAchievement {
  id: string;
  code: string;
  title: string;
  description: string;
  category: 'combat' | 'progression' | 'mastery' | 'economy';
  targetValue: number;
  reward: {
    credits: number;
    energyCores: number;
    xp: number;
    veloopCoins: number;
  };
}

export interface IPlayerAchievement {
  achievementId: string;
  currentValue: number;
  isCompleted: boolean;
  isClaimed: boolean;
  completedAt?: string;
  claimedAt?: string;
}

export interface IDailyMission {
  id: string;
  title: string;
  description: string;
  type: 'kills' | 'missions' | 'score' | 'powerups';
  target: number;
  current: number;
  isClaimed: boolean;
  reward: {
    credits: number;
    energyCores: number;
    xp: number;
    veloopCoins: number;
  };
}

export interface ILoginStreak {
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string;
  claimedToday: boolean;
  streakRewards: { day: number; credits: number; energyCores: number; veloopCoins: number }[];
}

export interface IGameEvent {
  id: string;
  title: string;
  description: string;
  bannerTag: string;
  rewardMultiplier: number;
  bonusCurrency: CurrencyType;
  startDate: string;
  endDate: string;
  isActive: boolean;
}
