import mongoose, { Schema, Document } from 'mongoose';
import { DifficultyLevel, MissionObjectiveType, ShipClass } from '../types/shared';

export interface IMissionDocument extends Document {
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
      type: string;
      count: number;
      speed: number;
      health: number;
      damage: number;
    }[];
  }[];
  bossConfig?: {
    bossType: string;
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

const MissionSchema = new Schema<IMissionDocument>(
  {
    missionId: { type: String, required: true, unique: true, index: true },
    numericId: { type: Number, required: true, unique: true, index: true },
    title: { type: String, required: true },
    sector: { type: Number, required: true, index: true },
    sectorName: { type: String, required: true },
    description: { type: String, required: true },
    loreBrief: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['Recruit', 'Veteran', 'Elite', 'Master', 'Nightmare'],
      required: true
    },
    recommendedShipClass: {
      type: String,
      enum: ['interceptor', 'guardian', 'destroyer', 'phantom', 'nova'],
      required: true
    },
    objective: {
      type: {
        type: String,
        enum: ['elimination', 'survival', 'boss', 'escort', 'score'],
        required: true
      },
      targetCount: { type: Number },
      targetSeconds: { type: Number },
      description: { type: String, required: true }
    },
    waves: [
      {
        waveNumber: { type: Number, required: true },
        spawnDelaySeconds: { type: Number, default: 2 },
        enemies: [
          {
            type: { type: String, required: true },
            count: { type: Number, required: true },
            speed: { type: Number, required: true },
            health: { type: Number, required: true },
            damage: { type: Number, required: true }
          }
        ]
      }
    ],
    bossConfig: {
      bossType: { type: String },
      name: { type: String },
      title: { type: String },
      health: { type: Number },
      shield: { type: Number },
      phases: { type: Number, default: 1 },
      specialAttacks: [{ type: String }]
    },
    rewards: {
      credits: { type: Number, required: true, min: 0 },
      energyCores: { type: Number, required: true, min: 0 },
      xp: { type: Number, required: true, min: 0 },
      veloopCoins: { type: Number, required: true, min: 0 }
    },
    unlockRequirement: {
      requiredMissionId: { type: String },
      minLevel: { type: Number, default: 1 }
    },
    starCriteria: {
      oneStar: { type: String, required: true },
      twoStar: { type: String, required: true },
      threeStar: { type: String, required: true },
      scoreThresholds: {
        type: [Number],
        validate: [(val: number[]) => val.length === 3, 'Must have exactly 3 score thresholds']
      }
    }
  },
  {
    timestamps: true
  }
);

export const Mission = mongoose.model<IMissionDocument>('Mission', MissionSchema);

