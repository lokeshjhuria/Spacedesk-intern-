export const ACHIEVEMENTS_SEED_DATA = [
  {
    achievementId: 'ach_first_blood',
    code: 'FIRST_BLOOD',
    title: 'First Contact',
    description: 'Destroy your first hostile enemy vessel in combat.',
    category: 'combat',
    targetValue: 1,
    reward: { credits: 200, energyCores: 2, xp: 100, veloopCoins: 5 }
  },
  {
    achievementId: 'ach_kill_100',
    code: 'HUNTER_100',
    title: 'Void Enforcer',
    description: 'Destroy 100 enemy combatants across all sectors.',
    category: 'combat',
    targetValue: 100,
    reward: { credits: 1500, energyCores: 10, xp: 500, veloopCoins: 25 }
  },
  {
    achievementId: 'ach_kill_500',
    code: 'WARLORD_500',
    title: 'Apex Annihilator',
    description: 'Obliterate 500 hostile ships across the cosmos.',
    category: 'combat',
    targetValue: 500,
    reward: { credits: 5000, energyCores: 30, xp: 2000, veloopCoins: 100 }
  },
  {
    achievementId: 'ach_boss_1',
    code: 'DREADNOUGHT_FALL',
    title: 'Dreadnought Buster',
    description: 'Defeat the Aegis Dreadnought in Sector 1 (Mission 10).',
    category: 'mastery',
    targetValue: 1,
    reward: { credits: 2500, energyCores: 15, xp: 1000, veloopCoins: 50 }
  },
  {
    achievementId: 'ach_boss_all',
    code: 'SECTOR_SOVEREIGN',
    title: 'Sovereign of the Stars',
    description: 'Defeat all 5 Sector Flagship Bosses.',
    category: 'mastery',
    targetValue: 5,
    reward: { credits: 20000, energyCores: 100, xp: 10000, veloopCoins: 500 }
  },
  {
    achievementId: 'ach_level_10',
    code: 'VETERAN_RANK',
    title: 'Ace Pilot',
    description: 'Reach Pilot Rank 10.',
    category: 'progression',
    targetValue: 10,
    reward: { credits: 2000, energyCores: 12, xp: 800, veloopCoins: 40 }
  },
  {
    achievementId: 'ach_missions_25',
    code: 'HALFWAY_THERE',
    title: 'Odyssey Pioneer',
    description: 'Successfully complete 25 distinct missions.',
    category: 'progression',
    targetValue: 25,
    reward: { credits: 6000, energyCores: 40, xp: 3000, veloopCoins: 150 }
  },
  {
    achievementId: 'ach_ships_3',
    code: 'FLEET_ADMIRAL',
    title: 'Fleet Commander',
    description: 'Unlock at least 3 distinct ship classes in your hangar.',
    category: 'economy',
    targetValue: 3,
    reward: { credits: 5000, energyCores: 25, xp: 2500, veloopCoins: 120 }
  },
  {
    achievementId: 'ach_three_stars_10',
    code: 'PERFECTIONIST_10',
    title: 'Stellar Perfectionist',
    description: 'Attain a 3-star rating on at least 10 missions.',
    category: 'mastery',
    targetValue: 10,
    reward: { credits: 4000, energyCores: 20, xp: 2000, veloopCoins: 80 }
  },
  {
    achievementId: 'ach_powerups_50',
    code: 'SCAVENGER_50',
    title: 'Overcharged Collector',
    description: 'Collect 50 power-up canisters during live flight.',
    category: 'combat',
    targetValue: 50,
    reward: { credits: 1800, energyCores: 8, xp: 600, veloopCoins: 30 }
  },
  {
    achievementId: 'ach_credits_10k',
    code: 'CREDIT_TYCOON',
    title: 'Orbital Tycoon',
    description: 'Accumulate a total of 10,000 Credits.',
    category: 'economy',
    targetValue: 10000,
    reward: { credits: 2500, energyCores: 15, xp: 1200, veloopCoins: 50 }
  },
  {
    achievementId: 'ach_veloop_100',
    code: 'VELOOP_ELITE',
    title: 'VELoop Ambassador',
    description: 'Earn 100 verified VELoop Reward Coins.',
    category: 'economy',
    targetValue: 100,
    reward: { credits: 8000, energyCores: 50, xp: 4000, veloopCoins: 100 }
  }
];
