export const UPGRADES_SEED_DATA = [
  {
    upgradeId: 'upg_weapon',
    category: 'weapon',
    name: 'Plasma Core Amplification',
    description: 'Enhances primary laser output energy, increasing projectile base damage and critical strike chance.',
    maxLevel: 10,
    multiplierPerLevel: 0.18,
    baseCost: {
      credits: 300,
      energyCores: 2
    },
    costMultiplier: 1.45
  },
  {
    upgradeId: 'upg_shield',
    category: 'shield',
    name: 'Harmonic Deflector Lattice',
    description: 'Reinforces magnetic flux lines around the hull, expanding shield capacity and regeneration rate.',
    maxLevel: 10,
    multiplierPerLevel: 0.20,
    baseCost: {
      credits: 250,
      energyCores: 2
    },
    costMultiplier: 1.4
  },
  {
    upgradeId: 'upg_engine',
    category: 'engine',
    name: 'Sub-Light Ion Thrusters',
    description: 'Upgrades propulsion manifolds for faster sub-light velocity and higher evasive responsiveness.',
    maxLevel: 10,
    multiplierPerLevel: 0.12,
    baseCost: {
      credits: 200,
      energyCores: 1
    },
    costMultiplier: 1.35
  },
  {
    upgradeId: 'upg_hull',
    category: 'hull',
    name: 'Nanite Regenerative Armor',
    description: 'Denses the layered titanium-carbide plating, granting significant increases to ship hull health points.',
    maxLevel: 10,
    multiplierPerLevel: 0.22,
    baseCost: {
      credits: 350,
      energyCores: 2
    },
    costMultiplier: 1.45
  },
  {
    upgradeId: 'upg_reactor',
    category: 'reactor',
    name: 'Dark Energy Siphon',
    description: 'Increases special ability cooldown recovery speed and boosts power-up active durations.',
    maxLevel: 10,
    multiplierPerLevel: 0.15,
    baseCost: {
      credits: 500,
      energyCores: 4
    },
    costMultiplier: 1.55
  }
];
