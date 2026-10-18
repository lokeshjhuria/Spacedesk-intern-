export const SHIPS_SEED_DATA = [
  {
    shipId: 'ship_interceptor',
    name: 'Viper X-1',
    class: 'interceptor',
    subtitle: 'High-Velocity Strike Fighter',
    description: 'Engineered for extreme agility and lightning-fast surgical strikes. Features dual overclocked pulse lasers.',
    lore: 'Manufactured by the Sol Vanguard Coalition, the Viper X-1 remains the undisputed interceptor of choice for reconnaissance and rapid skirmishes.',
    baseStats: {
      speed: 9,
      fireRate: 8,
      health: 120,
      shield: 80,
      damage: 18,
      criticalChance: 0.2
    },
    specialAbility: {
      name: 'Hyper Overdrive',
      description: 'Overcharges engine injectors and weapons cooling, granting +80% flight speed and +120% fire rate for 6 seconds.',
      cooldownSeconds: 20,
      durationSeconds: 6,
      icon: 'Zap'
    },
    price: {
      credits: 0,
      energyCores: 0,
      veloopCoins: 0
    },
    unlockRequirement: {
      minLevel: 1
    },
    visualTheme: {
      primaryColor: '#00f6ff',
      accentColor: '#3b82f6',
      engineGlow: '#00e1ff'
    }
  },
  {
    shipId: 'ship_guardian',
    name: 'Aegis Bulwark',
    class: 'guardian',
    subtitle: 'Fortified Heavy Dreadnought',
    description: 'A heavily armored flying fortress with reinforced layered shields capable of withstanding asteroid impacts.',
    lore: 'Constructed to protect deep-space civilian convoys during the Great Fracture. Its kinetic barrier absorbs concentrated bombardment.',
    baseStats: {
      speed: 5,
      fireRate: 5,
      health: 260,
      shield: 220,
      damage: 24,
      criticalChance: 0.1
    },
    specialAbility: {
      name: 'Kinetic Barrier',
      description: 'Deploys an impenetrable 360-degree energy shield that absorbs all incoming damage and reflects projectiles for 7 seconds.',
      cooldownSeconds: 25,
      durationSeconds: 7,
      icon: 'ShieldAlert'
    },
    price: {
      credits: 2500,
      energyCores: 15,
      veloopCoins: 50
    },
    unlockRequirement: {
      minLevel: 5,
      requiredMissionId: 'M-05'
    },
    visualTheme: {
      primaryColor: '#3b82f6',
      accentColor: '#60a5fa',
      engineGlow: '#2563eb'
    }
  },
  {
    shipId: 'ship_destroyer',
    name: 'Oblivion Dread',
    class: 'destroyer',
    subtitle: 'Heavy Siege Artillery Platform',
    description: 'Sacrifices maneuverability for devastating raw firepower and heavy dual railguns.',
    lore: 'Banned in three outer systems due to its terrifying destruction radius, the Oblivion Dread obliterates capital hulls in single volleys.',
    baseStats: {
      speed: 4,
      fireRate: 4,
      health: 190,
      shield: 140,
      damage: 42,
      criticalChance: 0.25
    },
    specialAbility: {
      name: 'Plasma Barrage',
      description: 'Fires an omnidirectional salvo of heavy explosive plasma mortars, clearing entire enemy waves in seconds.',
      cooldownSeconds: 28,
      durationSeconds: 4,
      icon: 'Crosshair'
    },
    price: {
      credits: 6000,
      energyCores: 35,
      veloopCoins: 120
    },
    unlockRequirement: {
      minLevel: 10,
      requiredMissionId: 'M-15'
    },
    visualTheme: {
      primaryColor: '#ef4444',
      accentColor: '#f97316',
      engineGlow: '#dc2626'
    }
  },
  {
    shipId: 'ship_phantom',
    name: 'Spectre Voidwalker',
    class: 'phantom',
    subtitle: 'Evasive Stealth Infiltrator',
    description: 'Equipped with dark-matter cloaking cells that allow it to phase out of the optical and sensor spectrums.',
    lore: 'Developed in top-secret labs on Titan, the Spectre slips past perimeter defenses undetected to assassinate enemy flagships.',
    baseStats: {
      speed: 8,
      fireRate: 7,
      health: 110,
      shield: 90,
      damage: 28,
      criticalChance: 0.35
    },
    specialAbility: {
      name: 'Phase Shift',
      description: 'Shifts into hyperspace stealth for 5 seconds. Completely invulnerable to collisions and projectiles while active.',
      cooldownSeconds: 22,
      durationSeconds: 5,
      icon: 'Ghost'
    },
    price: {
      credits: 12000,
      energyCores: 60,
      veloopCoins: 200
    },
    unlockRequirement: {
      minLevel: 18,
      requiredMissionId: 'M-25'
    },
    visualTheme: {
      primaryColor: '#a855f7',
      accentColor: '#c084fc',
      engineGlow: '#9333ea'
    }
  },
  {
    shipId: 'ship_nova',
    name: 'Solaris Prime',
    class: 'nova',
    subtitle: 'Cosmic Stellar Harbinger',
    description: 'Harnesses stellar corona energy. Flawlessly balanced offensive and defensive capabilities with stellar AoE explosions.',
    lore: 'Crafted using crystalline metallurgy harvested from dying stars. Emits an ethereal radiant aura that illuminates the dark void.',
    baseStats: {
      speed: 7,
      fireRate: 7,
      health: 180,
      shield: 160,
      damage: 32,
      criticalChance: 0.22
    },
    specialAbility: {
      name: 'Supernova Burst',
      description: 'Charges and releases a colossal expanding thermonuclear shockwave, vaporizing all projectiles and dealing massive AoE damage.',
      cooldownSeconds: 30,
      durationSeconds: 3,
      icon: 'Sun'
    },
    price: {
      credits: 25000,
      energyCores: 100,
      veloopCoins: 400
    },
    unlockRequirement: {
      minLevel: 25,
      requiredMissionId: 'M-35'
    },
    visualTheme: {
      primaryColor: '#f59e0b',
      accentColor: '#fbbf24',
      engineGlow: '#d97706'
    }
  }
];
