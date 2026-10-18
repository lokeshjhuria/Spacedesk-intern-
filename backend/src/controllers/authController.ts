import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User';
import { PlayerProfile } from '../models/PlayerProfile';
import { PlayerProgress } from '../models/PlayerProgress';
import { PlayerShip } from '../models/PlayerShip';
import { Wallet } from '../models/Wallet';
import { env } from '../config/env';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: parsed.error.issues
        });
        return;
      }

      const { username, email, password } = parsed.data;

      // Check existing user
      const existingUser = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { username }]
      });

      if (existingUser) {
        res.status(409).json({
          success: false,
          error: 'A pilot with this username or email already exists in the registry.'
        });
        return;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await User.create({
        username,
        email: email.toLowerCase(),
        passwordHash,
        role: 'player'
      });

      // Initialize player profile
      const profile = await PlayerProfile.create({
        userId: user._id,
        displayName: username,
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
        totalScore: 0
      });

      // Initialize player progress
      await PlayerProgress.create({
        userId: user._id,
        completedMissions: [],
        unlockedShips: ['ship_interceptor'],
        unlockedSectors: [1]
      });

      // Grant starter ship
      await PlayerShip.create({
        userId: user._id,
        shipId: 'ship_interceptor',
        isEquipped: true,
        upgradeLevels: { weapon: 1, shield: 1, speed: 1, special: 1 }
      });

      // Initialize wallet
      const wallet = await Wallet.create({
        userId: user._id,
        credits: 500,
        energyCores: 5,
        veloopCoins: 10, // Welcome gift
        xp: 0
      });

      // Generate JWT
      const token = jwt.sign(
        { id: user._id, role: user.role, username: user.username },
        env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'Pilot registration successful. Systems online.',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        profile,
        wallet
      });
    } catch (err: any) {
      console.error('[Auth Register Error]', err);
      res.status(500).json({ success: false, error: err.message || 'Internal server error during registration' });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: 'Invalid login credentials format' });
        return;
      }

      const { email, password } = parsed.data;

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        res.status(401).json({ success: false, error: 'Invalid email or password' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({ success: false, error: 'Invalid email or password' });
        return;
      }

      user.lastLogin = new Date();
      await user.save();

      const token = jwt.sign(
        { id: user._id, role: user.role, username: user.username },
        env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      const profile = await PlayerProfile.findOne({ userId: user._id });
      const wallet = await Wallet.findOne({ userId: user._id });

      res.json({
        success: true,
        message: 'Pilot authorization granted.',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        profile,
        wallet
      });
    } catch (err: any) {
      console.error('[Auth Login Error]', err);
      res.status(500).json({ success: false, error: err.message || 'Internal server error during login' });
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const profile = await PlayerProfile.findOne({ userId: user._id });
      const wallet = await Wallet.findOne({ userId: user._id });
      const progress = await PlayerProgress.findOne({ userId: user._id });

      res.json({
        success: true,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        profile,
        wallet,
        progress
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    res.json({ success: true, message: 'Logged out successfully' });
  }
}
