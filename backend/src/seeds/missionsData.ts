import { DifficultyLevel, MissionObjectiveType, ShipClass } from '../types/shared';

interface MissionSeedItem {
  missionId: string;
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
  waves: {
    waveNumber: number;
    spawnDelaySeconds: number;
    enemies: {
      type: 'scout' | 'interceptor_drone' | 'heavy_cruiser' | 'stealth_infiltrator' | 'swarm_bomber';
      count: number;
      speed: number;
      health: number;
      damage: number;
    }[];
  }[];
  bossConfig?: {
    bossType: 'aegis_dreadnought' | 'nebula_leviathan' | 'cyber_overlord' | 'solar_titan' | 'void_empress';
    name: string;
    title: string;
    health: number;
    shield: number;
    phases: number;
    specialAttacks: string[];
  };
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

const sectorMeta = [
  { sector: 1, name: 'Asteroid Frontier', baseShip: 'interceptor' as ShipClass, difficulty: 'Recruit' as DifficultyLevel },
  { sector: 2, name: 'Nebula Expanse', baseShip: 'guardian' as ShipClass, difficulty: 'Veteran' as DifficultyLevel },
  { sector: 3, name: 'Cybernetic Outpost', baseShip: 'destroyer' as ShipClass, difficulty: 'Elite' as DifficultyLevel },
  { sector: 4, name: 'Solar Flare Zone', baseShip: 'phantom' as ShipClass, difficulty: 'Master' as DifficultyLevel },
  { sector: 5, name: 'Void Core', baseShip: 'nova' as ShipClass, difficulty: 'Nightmare' as DifficultyLevel }
];

const missionTitles = [
  // Sector 1 (1 - 10)
  "First Contact Patrol", "Scrap Yard Skirmish", "Asteroid Ambush", "Mineral Convoy Escort",
  "Pirate Perimeter Sweep", "Deep Crater Infiltration", "Stellar Beacon Defense", "Raider Outpost Siege",
  "Belt Gate Lockdown", "Showdown: Aegis Dreadnought",
  // Sector 2 (11 - 20)
  "Into the Violet Mist", "Ion Storm Navigation", "Luminescent Swarm", "Gaseous Trench Run",
  "Plasma Well Disruption", "Derelict Ghost Hauler", "Sensor Array Sabotage", "Nebula Hive Assault",
  "Echoes in the Vapor", "Wrath: Nebula Leviathan",
  // Sector 3 (21 - 30)
  "Silicon Bastion Breach", "Firewall Penetration", "Automaton Fleet Clash", "Relay Tower Overload",
  "Sub-Routine Intercept", "Cyber Hive Vanguard", "Glitch Matrix Defense", "Quantum Core Extraction",
  "Mainframe Incursion", "Siege: Cyber Overlord Core",
  // Sector 4 (31 - 40)
  "Solar Corona Descent", "Coronal Mass Ejection", "Solar Flare Dogfight", "Helios Thermal Trap",
  "Radiant Perimeter Sweep", "Sunspot Raider Blitz", "Magnetic Storm Gauntlet", "Prominence Defense",
  "Inferno Fleet Vanguard", "Clash: Solar Titan",
  // Sector 5 (41 - 50)
  "Abyssal Horizon", "Dark Matter Rifts", "Void Singularity Run", "Shadow Drone Swarm",
  "Event Horizon Incursion", "Cosmic Rift Defense", "Void Gate Assault", "Oblivion Vanguard",
  "The Final Threshold", "Ascension: Void Empress Omen"
];

const bossConfigs: Record<number, MissionSeedItem['bossConfig']> = {
  10: {
    bossType: 'aegis_dreadnought',
    name: 'Aegis Dreadnought Mark IV',
    title: 'Pirate Fleet Super-Flagship',
    health: 1200,
    shield: 600,
    phases: 2,
    specialAttacks: ['Rotary Plasma Cannons', 'Kinetic Shrapnel Salvo']
  },
  20: {
    bossType: 'nebula_leviathan',
    name: 'Goliath Bio-Beast',
    title: 'Sentient Nebula Apex Predator',
    health: 2200,
    shield: 1000,
    phases: 3,
    specialAttacks: ['Luminescent Spore Swarm', 'Bio-Electric Tail Sweep', 'Corrosive Acid Spray']
  },
  30: {
    bossType: 'cyber_overlord',
    name: 'Overlord Neural Nexus',
    title: 'Automated Cybernetic Hivemind',
    health: 3500,
    shield: 1500,
    phases: 3,
    specialAttacks: ['Orbital Laser Grid', 'Micro-Drone Swarm Surge', 'EMP EMP Stun Pulse']
  },
  40: {
    bossType: 'solar_titan',
    name: 'Solaris Juggernaut',
    title: 'Solar Forge War Titan',
    health: 5000,
    shield: 2500,
    phases: 4,
    specialAttacks: ['Coronal Flame Eruption', 'Solar Beam Lance', 'Molten Flare Nova']
  },
  50: {
    bossType: 'void_empress',
    name: 'Void Empress Omen',
    title: 'Trans-Dimensional Entity of Entropy',
    health: 8000,
    shield: 4000,
    phases: 4,
    specialAttacks: ['Dark Matter Singularity', 'Dimensional Rift Teleport', 'Radial Bullet Hell Spiral']
  }
};

export const MISSIONS_SEED_DATA: MissionSeedItem[] = Array.from({ length: 50 }, (_, i) => {
  const numericId = i + 1;
  const missionId = `M-${numericId < 10 ? '0' + numericId : numericId}`;
  const sectorIndex = Math.floor(i / 10);
  const sec = sectorMeta[sectorIndex];
  const sectorPosition = (i % 10) + 1;
  const isBossMission = sectorPosition === 10;

  const shipClasses: ShipClass[] = ['interceptor', 'guardian', 'destroyer', 'phantom', 'nova'];
  const recommendedShip = shipClasses[sectorIndex % shipClasses.length];

  let objType: MissionObjectiveType = 'elimination';
  let targetCount = 15 + sectorIndex * 8 + sectorPosition * 3;
  let targetSeconds: number | undefined;

  if (isBossMission) {
    objType = 'boss';
  } else if (sectorPosition === 4 || sectorPosition === 8) {
    objType = 'survival';
    targetSeconds = 45 + sectorIndex * 15;
  } else if (sectorPosition === 6) {
    objType = 'score';
  }

  // Wave builder
  const waveCount = isBossMission ? 3 : Math.min(5, 2 + Math.floor(sectorPosition / 3));
  const waves = [];

  for (let w = 1; w <= waveCount; w++) {
    const enemies = [];
    // Scouts are in every wave
    enemies.push({
      type: 'scout' as const,
      count: 4 + sectorIndex * 2 + w,
      speed: 120 + sectorIndex * 20,
      health: 30 + sectorIndex * 25,
      damage: 10 + sectorIndex * 5
    });

    if (sectorIndex >= 1 || w >= 2) {
      enemies.push({
        type: 'interceptor_drone' as const,
        count: 2 + sectorIndex + w,
        speed: 160 + sectorIndex * 20,
        health: 45 + sectorIndex * 30,
        damage: 14 + sectorIndex * 6
      });
    }

    if (sectorIndex >= 2 || w >= 3) {
      enemies.push({
        type: 'heavy_cruiser' as const,
        count: 1 + Math.floor(sectorIndex / 2),
        speed: 60 + sectorIndex * 10,
        health: 120 + sectorIndex * 80,
        damage: 25 + sectorIndex * 10
      });
    }

    if (sectorIndex >= 3 && w >= 2) {
      enemies.push({
        type: 'stealth_infiltrator' as const,
        count: 2 + sectorIndex,
        speed: 140 + sectorIndex * 15,
        health: 60 + sectorIndex * 40,
        damage: 20 + sectorIndex * 8
      });
    }

    if (sectorIndex >= 4) {
      enemies.push({
        type: 'swarm_bomber' as const,
        count: 2 + w,
        speed: 90 + sectorIndex * 10,
        health: 90 + sectorIndex * 50,
        damage: 30 + sectorIndex * 10
      });
    }

    waves.push({
      waveNumber: w,
      spawnDelaySeconds: 2 + w * 2,
      enemies
    });
  }

  // Calculate rewards scaled by sector and position
  const baseCredits = 250 + sectorIndex * 400 + sectorPosition * 80;
  const baseEnergy = 2 + sectorIndex * 3 + (isBossMission ? 8 : 1);
  const baseXP = 150 + sectorIndex * 250 + sectorPosition * 40;
  const baseVeloop = (sectorPosition % 3 === 0 || isBossMission) ? (sectorIndex + 1) * 5 + (isBossMission ? 15 : 0) : (sectorIndex + 1) * 2;

  const minLevelReq = Math.max(1, Math.floor(numericId * 0.6));
  const prevMissionId = numericId > 1 ? `M-${(numericId - 1) < 10 ? '0' + (numericId - 1) : (numericId - 1)}` : undefined;

  const baseThreshold = 2000 + sectorIndex * 4000 + sectorPosition * 800;
  const thresholds: [number, number, number] = [
    baseThreshold,
    Math.round(baseThreshold * 1.5),
    Math.round(baseThreshold * 2.3)
  ];

  return {
    missionId,
    numericId,
    title: missionTitles[i] || `Sector ${sec.sector} Skirmish ${sectorPosition}`,
    sector: sec.sector,
    sectorName: sec.name,
    description: `Tactical operation in the ${sec.name}. Eliminate hostile hostiles and secure orbital beacons for VELoop command.`,
    loreBrief: `Transmissions intercepted from Sector ${sec.sector} reveal heavy insurgent mobilization. High Command has assigned your callsign to cleanse the flight corridor.`,
    difficulty: isBossMission ? (sectorIndex === 4 ? 'Nightmare' : 'Master') : sec.difficulty,
    recommendedShipClass: recommendedShip,
    objective: {
      type: objType,
      targetCount: objType === 'elimination' ? targetCount : undefined,
      targetSeconds: objType === 'survival' ? targetSeconds : undefined,
      description: isBossMission
        ? `Engage and neutralize the flagship: ${bossConfigs[numericId]?.name}`
        : objType === 'survival'
        ? `Survive for ${targetSeconds} seconds against incoming assault waves`
        : `Eliminate all ${targetCount} hostile vessels in the sector corridor`
    },
    waves,
    bossConfig: bossConfigs[numericId],
    rewards: {
      credits: baseCredits,
      energyCores: baseEnergy,
      xp: baseXP,
      veloopCoins: baseVeloop
    },
    unlockRequirement: {
      requiredMissionId: prevMissionId,
      minLevel: minLevelReq
    },
    starCriteria: {
      oneStar: 'Clear primary mission objective',
      twoStar: `Score at least ${thresholds[1].toLocaleString()} points`,
      threeStar: `Score ${thresholds[2].toLocaleString()} points with >=40% hull remaining`,
      scoreThresholds: thresholds
    }
  };
});

