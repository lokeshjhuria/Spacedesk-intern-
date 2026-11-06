import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { SoundFX } from './SoundFX';

interface GameCanvasProps {
  missionId: string;
  sessionId: string;
  missionConfig: any;
  shipStats: any;
  onVictory: (payload: any) => void;
  onDefeat: () => void;
  onPause: () => void;
}

// ─── Texture Generator Helper ────────────────────────────────────────────────
function generateAllGameTextures(scene: Phaser.Scene) {
  const { textures } = scene;

  // 1. Player Interceptor (Cyan Jet)
  if (!textures.exists('tex_player_interceptor')) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    // Thrusters
    g.fillStyle(0x00f6ff, 0.9);
    g.fillEllipse(24, 56, 8, 18);
    g.fillEllipse(40, 56, 8, 18);
    // Outer Wings
    g.fillStyle(0x0284c7, 1);
    g.fillTriangle(32, 6, 4, 46, 26, 48);
    g.fillTriangle(32, 6, 60, 46, 38, 48);
    // Inner Wings & Cannons
    g.fillStyle(0x00f6ff, 1);
    g.fillRect(10, 24, 3, 24);
    g.fillRect(51, 24, 3, 24);
    // Main Hull
    g.fillStyle(0x0f172a, 1);
    g.fillTriangle(32, 4, 18, 52, 46, 52);
    // Cockpit
    g.fillStyle(0x67e8f9, 0.95);
    g.fillTriangle(32, 14, 26, 32, 38, 32);
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(32, 22, 3);
    // Neon Trim
    g.lineStyle(2, 0x00f6ff, 1);
    g.strokeTriangle(32, 4, 18, 52, 46, 52);
    g.generateTexture('tex_player_interceptor', 64, 64);
    g.destroy();
  }

  // 2. Player Guardian (Blue Dreadnought)
  if (!textures.exists('tex_player_guardian')) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    // Engines
    g.fillStyle(0x38bdf8, 0.9);
    g.fillEllipse(26, 62, 8, 16);
    g.fillEllipse(46, 62, 8, 16);
    // Heavy Armor Wings
    g.fillStyle(0x1e3a8a, 1);
    g.fillTriangle(36, 8, 6, 42, 24, 58);
    g.fillTriangle(36, 8, 66, 42, 48, 58);
    // Shield Pylons
    g.fillStyle(0x3b82f6, 1);
    g.fillRect(8, 38, 6, 20);
    g.fillRect(58, 38, 6, 20);
    // Prow & Hull
    g.fillStyle(0x172554, 1);
    g.fillTriangle(36, 6, 20, 58, 52, 58);
    // Aegis Energy Core
    g.fillStyle(0x60a5fa, 1);
    g.fillCircle(36, 34, 9);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(36, 34, 4);
    g.lineStyle(2, 0x93c5fd, 1);
    g.strokeTriangle(36, 6, 20, 58, 52, 58);
    g.generateTexture('tex_player_guardian', 72, 72);
    g.destroy();
  }

  // 3. Player Destroyer (Crimson Railgun Warship)
  if (!textures.exists('tex_player_destroyer')) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    // Engines
    g.fillStyle(0xf97316, 1);
    g.fillEllipse(24, 62, 8, 18);
    g.fillEllipse(48, 62, 8, 18);
    // Long Railgun Barrels
    g.fillStyle(0x374151, 1);
    g.fillRect(18, 4, 4, 42);
    g.fillRect(50, 4, 4, 42);
    g.fillStyle(0xfacc15, 1);
    g.fillCircle(20, 6, 3);
    g.fillCircle(52, 6, 3);
    // Aggressive Wings
    g.fillStyle(0x991b1b, 1);
    g.fillTriangle(36, 12, 6, 48, 26, 56);
    g.fillTriangle(36, 12, 66, 48, 46, 56);
    // Armored Fuselage
    g.fillStyle(0x18181b, 1);
    g.fillTriangle(36, 10, 22, 58, 50, 58);
    // Antimatter Reactor
    g.fillStyle(0xef4444, 1);
    g.fillTriangle(36, 28, 28, 44, 44, 44);
    g.lineStyle(2, 0xf87171, 1);
    g.strokeTriangle(36, 10, 22, 58, 50, 58);
    g.generateTexture('tex_player_destroyer', 72, 72);
    g.destroy();
  }

  // 4. Player Phantom (Purple Stealth Corvette)
  if (!textures.exists('tex_player_phantom')) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    // Phase Thruster
    g.fillStyle(0xc084fc, 0.9);
    g.fillEllipse(32, 56, 12, 16);
    // Stealth Diamond Wings
    g.fillStyle(0x581c87, 1);
    g.fillTriangle(32, 4, 4, 42, 32, 54);
    g.fillTriangle(32, 4, 60, 42, 32, 54);
    // Inner Prism Plating
    g.fillStyle(0x2e1065, 1);
    g.fillTriangle(32, 12, 16, 40, 48, 40);
    // Phase Needle
    g.fillStyle(0xe879f9, 1);
    g.fillTriangle(32, 8, 28, 48, 36, 48);
    g.lineStyle(2, 0xd8b4fe, 1);
    g.strokeTriangle(32, 4, 4, 42, 32, 54);
    g.strokeTriangle(32, 4, 60, 42, 32, 54);
    g.generateTexture('tex_player_phantom', 64, 64);
    g.destroy();
  }

  // 5. Player Nova (Golden Flagship)
  if (!textures.exists('tex_player_nova')) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    // Solar Plumes
    g.fillStyle(0xfb923c, 0.9);
    g.fillEllipse(26, 64, 7, 18);
    g.fillEllipse(50, 64, 7, 18);
    g.fillEllipse(38, 66, 10, 20);
    // Expansive Wings
    g.fillStyle(0xd97706, 1);
    g.fillTriangle(38, 8, 6, 42, 28, 58);
    g.fillTriangle(38, 8, 70, 42, 48, 58);
    // Solar Wing Sails
    g.fillStyle(0xfde047, 1);
    g.fillTriangle(38, 14, 18, 46, 32, 52);
    g.fillTriangle(38, 14, 58, 46, 44, 52);
    // High-Command Spine
    g.fillStyle(0x451a03, 1);
    g.fillTriangle(38, 6, 26, 60, 50, 60);
    // Nova Core
    g.fillStyle(0xffffff, 1);
    g.fillCircle(38, 32, 8);
    g.fillStyle(0xf59e0b, 0.8);
    g.fillCircle(38, 32, 12);
    g.lineStyle(2, 0xfef08a, 1);
    g.strokeTriangle(38, 6, 26, 60, 50, 60);
    g.generateTexture('tex_player_nova', 76, 76);
    g.destroy();
  }

  // ─── Enemy Textures ──────────────────────────────────────────────────────────
  // Scout Enemy (Orange Dart)
  if (!textures.exists('tex_enemy_scout')) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xff6600, 1);
    g.fillTriangle(20, 36, 4, 6, 36, 6);
    g.fillStyle(0xffcc00, 1);
    g.fillCircle(20, 18, 4);
    g.lineStyle(2, 0xffaa00, 1);
    g.strokeTriangle(20, 36, 4, 6, 36, 6);
    g.generateTexture('tex_enemy_scout', 40, 40);
    g.destroy();
  }

  // Interceptor Drone (Red Winged Drone)
  if (!textures.exists('tex_enemy_drone')) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xdc2626, 1);
    g.fillRect(10, 10, 24, 24);
    g.fillTriangle(22, 38, 4, 16, 40, 16);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(22, 22, 6);
    g.fillStyle(0xff0000, 1);
    g.fillCircle(22, 22, 3);
    g.generateTexture('tex_enemy_drone', 44, 44);
    g.destroy();
  }

  // Heavy Cruiser (Iron Armored Battleship)
  if (!textures.exists('tex_enemy_cruiser')) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x3f3f46, 1);
    g.fillRect(14, 8, 36, 44);
    g.fillStyle(0xef4444, 1);
    g.fillRect(8, 20, 8, 24);
    g.fillRect(48, 20, 8, 24);
    g.fillTriangle(32, 58, 14, 42, 50, 42);
    g.fillStyle(0x71717a, 1);
    g.fillCircle(32, 26, 8);
    g.lineStyle(2, 0xd4d4d8, 0.8);
    g.strokeRect(14, 8, 36, 44);
    g.generateTexture('tex_enemy_cruiser', 64, 64);
    g.destroy();
  }

  // Stealth Infiltrator (Purple Triangle)
  if (!textures.exists('tex_enemy_infiltrator')) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x9333ea, 0.85);
    g.fillTriangle(22, 40, 4, 8, 40, 8);
    g.fillStyle(0xc084fc, 1);
    g.fillTriangle(22, 30, 12, 12, 32, 12);
    g.generateTexture('tex_enemy_infiltrator', 44, 44);
    g.destroy();
  }

  // Swarm Bomber (Lime Bio-Mechanical Cluster)
  if (!textures.exists('tex_enemy_bomber')) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x15803d, 1);
    g.fillCircle(24, 24, 16);
    g.fillStyle(0xa3e635, 1);
    g.fillCircle(24, 24, 9);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(24, 24, 4);
    g.generateTexture('tex_enemy_bomber', 48, 48);
    g.destroy();
  }

  // ─── Worm / Space Serpent Boss & Segments ────────────────────────────────────
  if (!textures.exists('tex_worm_head')) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x7e22ce, 1);
    g.fillCircle(24, 24, 18);
    // Mandibles
    g.fillStyle(0xa855f7, 1);
    g.fillTriangle(24, 44, 10, 28, 16, 20);
    g.fillTriangle(24, 44, 38, 28, 32, 20);
    // Glowing Eyes
    g.fillStyle(0xfacc15, 1);
    g.fillCircle(16, 20, 4);
    g.fillCircle(32, 20, 4);
    g.fillStyle(0xff0000, 1);
    g.fillCircle(16, 20, 2);
    g.fillCircle(32, 20, 2);
    g.generateTexture('tex_worm_head', 48, 48);
    g.destroy();
  }

  if (!textures.exists('tex_worm_segment')) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x6b21a8, 0.9);
    g.fillCircle(18, 18, 14);
    g.fillStyle(0xc084fc, 0.8);
    g.fillCircle(18, 18, 7);
    g.generateTexture('tex_worm_segment', 36, 36);
    g.destroy();
  }

  // ─── Space Apple / Energy Fruit Core ─────────────────────────────────────────
  if (!textures.exists('tex_space_apple')) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    // Halo Glow
    g.fillStyle(0x22c55e, 0.25);
    g.fillCircle(20, 20, 18);
    // Apple Body
    g.fillStyle(0xef4444, 0.95);
    g.fillCircle(15, 20, 10);
    g.fillCircle(25, 20, 10);
    g.fillCircle(20, 24, 9);
    // Core highlight
    g.fillStyle(0xfde047, 0.8);
    g.fillCircle(18, 18, 4);
    // Green Leaf & Stem
    g.fillStyle(0x84cc16, 1);
    g.fillEllipse(23, 10, 5, 2);
    g.fillStyle(0x78350f, 1);
    g.fillRect(19, 8, 3, 5);
    g.generateTexture('tex_space_apple', 40, 40);
    g.destroy();
  }

  // ─── Space Obstacles (Asteroids) ─────────────────────────────────────────────
  if (!textures.exists('tex_asteroid')) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x475569, 1);
    g.fillCircle(24, 24, 18);
    g.fillStyle(0x334155, 1);
    g.fillCircle(18, 18, 6);
    g.fillCircle(30, 28, 5);
    g.fillCircle(22, 32, 4);
    g.lineStyle(2, 0x64748b, 0.8);
    g.strokeCircle(24, 24, 18);
    g.generateTexture('tex_asteroid', 48, 48);
    g.destroy();
  }

  // ─── Orbital Defense Platform ────────────────────────────────────────────────
  if (!textures.exists('tex_platform')) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    // Solar Panel Wings
    g.fillStyle(0x0284c7, 0.6);
    g.fillRect(8, 18, 36, 16);
    g.fillRect(66, 18, 36, 16);
    g.lineStyle(1, 0x38bdf8, 0.8);
    g.strokeRect(8, 18, 36, 16);
    g.strokeRect(66, 18, 36, 16);
    // Central Hub
    g.fillStyle(0x1e293b, 0.9);
    g.fillCircle(55, 26, 14);
    g.fillStyle(0x10b981, 1);
    g.fillCircle(55, 26, 4);
    g.generateTexture('tex_platform', 110, 52);
    g.destroy();
  }

  // ─── Laser Bullets ───────────────────────────────────────────────────────────
  if (!textures.exists('tex_bullet_player')) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x00f6ff, 1);
    g.fillRect(2, 0, 4, 18);
    g.fillStyle(0xffffff, 0.9);
    g.fillRect(3, 2, 2, 14);
    g.generateTexture('tex_bullet_player', 8, 20);
    g.destroy();
  }

  if (!textures.exists('tex_bullet_enemy')) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xef4444, 0.9);
    g.fillCircle(6, 6, 6);
    g.fillStyle(0xffedd5, 1);
    g.fillCircle(6, 6, 2.5);
    g.generateTexture('tex_bullet_enemy', 12, 12);
    g.destroy();
  }
}

// ─── Phaser Game Scene ─────────────────────────────────────────────────────────
class SpaceShooterScene extends Phaser.Scene {
  // Player
  private player!: Phaser.Physics.Arcade.Sprite;
  private playerShieldGfx!: Phaser.GameObjects.Graphics;
  private playerBullets!: Phaser.Physics.Arcade.Group;

  // Enemies & Obstacles
  private enemies!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;
  private apples!: Phaser.Physics.Arcade.Group;
  private obstacles!: Phaser.Physics.Arcade.Group;

  // Space Wyrm Boss Segments
  private wormHead: Phaser.Physics.Arcade.Sprite | null = null;
  private wormSegments: Phaser.Physics.Arcade.Sprite[] = [];
  private wormHealth = 1500;
  private wormMaxHealth = 1500;

  // Capital Boss
  private boss: Phaser.Physics.Arcade.Sprite | null = null;
  private bossHealth = 0;
  private bossMaxHealth = 0;

  // HUD
  private scoreText!: Phaser.GameObjects.Text;
  private hullText!: Phaser.GameObjects.Text;
  private shieldText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private bossHealthBar!: Phaser.GameObjects.Graphics;

  // Background Parallax
  private bgPlatforms: Phaser.GameObjects.Image[] = [];

  // State
  private health = 150;
  private maxHealth = 150;
  private shield = 100;
  private maxShield = 100;
  private score = 0;
  private damage = 24;
  private fireRate = 180;
  private lastFired = 0;
  private currentWave = 0;
  private wavesConfig: any[] = [];
  private bossConfig: any = null;
  private allWavesCleared = false;
  private bossSpawned = false;
  private enemiesKilled = 0;
  private shotsTotal = 0;
  private shotsHit = 0;
  private applesCollected = 0;
  private currentCombo = 0;
  private maxCombo = 0;
  private comboTimer = 0;
  private startTime = 0;
  private isGameOver = false;
  private isPaused = false;
  private shipClass = 'interceptor';
  private invulnerableUntil = 0;
  private speed = 280;

  // Callbacks
  private onVictory!: (p: any) => void;
  private onDefeat!: () => void;
  private onPauseCallback!: () => void;
  private missionId = '';
  private sessionId = '';

  // Controls
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private qKey!: Phaser.Input.Keyboard.Key;
  private escKey!: Phaser.Input.Keyboard.Key;

  // Touch pointer tracking
  private pointerDown = false;
  private touchTargetX = 0;
  private touchTargetY = 0;

  constructor() {
    super({ key: 'SpaceShooterScene' });
  }

  init(data: any) {
    this.missionId = data.missionId || 'M-001';
    this.sessionId = data.sessionId || 'session_' + Date.now();
    this.wavesConfig = data.missionConfig?.waves || [];
    this.bossConfig = data.missionConfig?.bossConfig;
    this.onVictory = data.onVictory || (() => {});
    this.onDefeat = data.onDefeat || (() => {});
    this.onPauseCallback = data.onPause || (() => {});

    const ship = data.shipStats || {};
    this.shipClass = (ship.class || 'interceptor').toLowerCase();

    const baseHealth = ship.baseStats?.health || (this.shipClass === 'guardian' ? 220 : this.shipClass === 'destroyer' ? 180 : 140);
    const baseShield = ship.baseStats?.shield || (this.shipClass === 'guardian' ? 160 : 100);
    const baseDamage = ship.baseStats?.damage || (this.shipClass === 'destroyer' ? 36 : 24);
    const baseSpeed = (ship.baseStats?.speed || 8) * 35;

    this.maxHealth = baseHealth;
    this.health = this.maxHealth;
    this.maxShield = baseShield;
    this.shield = this.maxShield;
    this.damage = baseDamage;
    this.speed = Math.max(240, baseSpeed);
  }

  preload() {
    generateAllGameTextures(this);
  }

  create() {
    const { width, height } = this.scale;
    this.startTime = Date.now();
    this.score = 0;
    this.isGameOver = false;

    // Camera & Background
    this.cameras.main.setBackgroundColor('#020617');
    this.createParallaxStars(width, height);

    // Floating Background Space Station Platforms
    for (let i = 0; i < 2; i++) {
      const plat = this.add.image(
        Phaser.Math.Between(80, width - 80),
        Phaser.Math.Between(100, height - 100),
        'tex_platform'
      ).setDepth(-5).setAlpha(0.35);
      this.bgPlatforms.push(plat);
    }

    // Groups
    this.playerBullets = this.physics.add.group({ maxSize: 60, runChildUpdate: true });
    this.enemies = this.physics.add.group({ runChildUpdate: true });
    this.enemyBullets = this.physics.add.group({ maxSize: 80, runChildUpdate: true });
    this.apples = this.physics.add.group({ runChildUpdate: true });
    this.obstacles = this.physics.add.group({ runChildUpdate: true });

    // Player Ship Sprite
    const playerTexKey = `tex_player_${this.shipClass}`;
    const initialKey = this.textures.exists(playerTexKey) ? playerTexKey : 'tex_player_interceptor';
    this.player = this.physics.add.sprite(width / 2, height - 90, initialKey).setDepth(10);
    this.player.setCollideWorldBounds(true);
    this.player.setSize(38, 48);

    // Player Shield Ring
    this.playerShieldGfx = this.add.graphics().setDepth(11);

    // Controls
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
      };
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.qKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
      this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    }

    // Pointer (Mouse / Touch Drag)
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.pointerDown = true;
      this.touchTargetX = pointer.x;
      this.touchTargetY = pointer.y;
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.pointerDown) {
        this.touchTargetX = pointer.x;
        this.touchTargetY = pointer.y;
      }
    });

    this.input.on('pointerup', () => {
      this.pointerDown = false;
    });

    // HUD Display
    this.setupHUD(width, height);

    // Start waves
    if (this.wavesConfig.length > 0) {
      this.spawnWave(0);
    } else {
      // Default auto-wave generator if mission data was empty
      this.spawnFallbackWave();
    }

    // Periodic Cosmic Apples (Health & XP cores) drop
    this.time.addEvent({
      delay: 7000,
      callback: () => this.spawnSpaceApple(),
      loop: true
    });

    // Periodic Asteroid Obstacles
    this.time.addEvent({
      delay: 5000,
      callback: () => this.spawnObstacle(),
      loop: true
    });
  }

  private createParallaxStars(w: number, h: number) {
    const starGfx = this.add.graphics().setDepth(-10);
    for (let i = 0; i < 180; i++) {
      const x = Phaser.Math.Between(0, w);
      const y = Phaser.Math.Between(0, h);
      const size = Math.random() < 0.85 ? 1 : 2;
      const alpha = 0.2 + Math.random() * 0.8;
      starGfx.fillStyle(0xffffff, alpha);
      starGfx.fillRect(x, y, size, size);
    }
  }

  private setupHUD(w: number, h: number) {
    const font = { fontFamily: 'Orbitron, sans-serif', fontSize: '12px', color: '#00f6ff' };
    this.scoreText = this.add.text(14, 12, 'SCORE: 0', { ...font, fontSize: '14px', fontStyle: 'bold' }).setDepth(20);
    this.hullText = this.add.text(14, 32, 'HULL: 100%', { ...font, color: '#10b981' }).setDepth(20);
    this.shieldText = this.add.text(14, 50, 'SHIELD: 100%', { ...font, color: '#38bdf8' }).setDepth(20);
    this.waveText = this.add.text(w / 2, 14, 'WAVE 1', { ...font, fontSize: '13px', fontStyle: 'bold' }).setOrigin(0.5, 0).setDepth(20);
    this.comboText = this.add.text(w - 14, 12, '', { ...font, color: '#fbbf24', fontSize: '14px' }).setOrigin(1, 0).setDepth(20);

    this.bossHealthBar = this.add.graphics().setDepth(22);
  }

  private spawnSpaceApple() {
    if (this.isGameOver || this.isPaused) return;
    const { width } = this.scale;
    const x = Phaser.Math.Between(30, width - 30);
    const apple = this.apples.create(x, -20, 'tex_space_apple') as Phaser.Physics.Arcade.Sprite;
    if (apple) {
      apple.setVelocityY(90);
      apple.setDepth(8);
      // Gentle floating sway
      this.tweens.add({
        targets: apple,
        x: x + Phaser.Math.Between(-25, 25),
        duration: 1800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private spawnObstacle() {
    if (this.isGameOver || this.isPaused) return;
    const { width } = this.scale;
    const x = Phaser.Math.Between(40, width - 40);
    const ast = this.obstacles.create(x, -30, 'tex_asteroid') as Phaser.Physics.Arcade.Sprite;
    if (ast) {
      ast.setVelocityY(Phaser.Math.Between(60, 120));
      ast.setAngularVelocity(Phaser.Math.Between(-60, 60));
      ast.setDepth(7);
      ast.setData('health', 45);
    }
  }

  private spawnWave(index: number) {
    if (this.isGameOver) return;
    if (index >= this.wavesConfig.length) {
      if (this.bossConfig && !this.bossSpawned) {
        this.time.delayedCall(1200, () => this.spawnCapitalBoss());
      } else {
        // Spawn cosmic serpent worm for ultimate sector showdown
        this.time.delayedCall(1500, () => this.spawnSpaceWorm());
      }
      return;
    }

    this.currentWave = index;
    const wave = this.wavesConfig[index];
    const { width } = this.scale;
    let delay = 0;

    for (const group of wave.enemies || []) {
      for (let i = 0; i < (group.count || 3); i++) {
        this.time.delayedCall(delay, () => {
          if (this.isGameOver) return;
          const x = Phaser.Math.Between(40, width - 40);
          const type = group.type || 'scout';
          const texKey = `tex_enemy_${type === 'interceptor_drone' ? 'drone' : type === 'heavy_cruiser' ? 'cruiser' : type === 'stealth_infiltrator' ? 'infiltrator' : type === 'swarm_bomber' ? 'bomber' : 'scout'}`;
          const enemy = this.enemies.create(x, -30, texKey) as Phaser.Physics.Arcade.Sprite;
          if (enemy) {
            enemy.setVelocity(Phaser.Math.Between(-30, 30), group.speed || 90);
            enemy.setDepth(8);
            enemy.setData('health', group.health || 35);
            enemy.setData('damage', group.damage || 12);
            enemy.setData('lastShot', Date.now() + Math.random() * 1500);
            enemy.setData('fireRate', 1800 + Math.random() * 1600);
          }
        });
        delay += 250;
      }
    }

    this.time.delayedCall(delay + (wave.spawnDelaySeconds || 4) * 1000, () => {
      this.spawnWave(index + 1);
    });
  }

  private spawnFallbackWave() {
    const { width } = this.scale;
    for (let i = 0; i < 6; i++) {
      this.time.delayedCall(i * 350, () => {
        const x = Phaser.Math.Between(40, width - 40);
        const enemy = this.enemies.create(x, -30, 'tex_enemy_scout') as Phaser.Physics.Arcade.Sprite;
        if (enemy) {
          enemy.setVelocity(Phaser.Math.Between(-25, 25), 85);
          enemy.setDepth(8);
          enemy.setData('health', 30);
          enemy.setData('damage', 10);
          enemy.setData('lastShot', Date.now());
          enemy.setData('fireRate', 2000);
        }
      });
    }
  }

  // ─── Cosmic Worm / Space Serpent Boss ────────────────────────────────────────
  private spawnSpaceWorm() {
    if (this.wormHead || this.bossSpawned) return;
    this.bossSpawned = true;
    const { width } = this.scale;

    SoundFX.playAbility();
    this.cameras.main.flash(400, 168, 85, 247);

    // Worm Head
    this.wormHead = this.physics.add.sprite(width / 2, -40, 'tex_worm_head').setDepth(15);
    this.wormHead.setVelocityY(70);

    // Segments
    this.wormSegments = [];
    for (let i = 0; i < 7; i++) {
      const seg = this.physics.add.sprite(width / 2, -40 - (i + 1) * 22, 'tex_worm_segment').setDepth(14 - i);
      this.wormSegments.push(seg);
    }

    // Serpent S-curve tween
    this.tweens.add({
      targets: this.wormHead,
      x: { from: 80, to: width - 80 },
      yoyo: true,
      repeat: -1,
      duration: 2200,
      ease: 'Sine.easeInOut'
    });
  }

  // ─── Capital Boss Encounter ──────────────────────────────────────────────────
  private spawnCapitalBoss() {
    if (this.boss || this.bossSpawned) return;
    this.bossSpawned = true;
    const { width } = this.scale;

    SoundFX.playAbility();
    this.cameras.main.shake(400, 0.015);

    this.boss = this.physics.add.sprite(width / 2, -60, 'tex_enemy_cruiser').setDepth(16).setScale(1.8);
    this.boss.setVelocityY(40);
    this.bossMaxHealth = this.bossConfig?.health || 1200;
    this.bossHealth = this.bossMaxHealth;

    this.time.delayedCall(2000, () => {
      if (this.boss && this.boss.active) {
        this.boss.setVelocityY(0);
        this.tweens.add({
          targets: this.boss,
          x: { from: 100, to: width - 100 },
          yoyo: true,
          repeat: -1,
          duration: 3200,
          ease: 'Sine.easeInOut'
        });
      }
    });
  }

  private firePlayerBullet() {
    const now = Date.now();
    if (now - this.lastFired < this.fireRate) return;
    this.lastFired = now;

    const b = this.playerBullets.create(this.player.x, this.player.y - 24, 'tex_bullet_player') as Phaser.Physics.Arcade.Sprite;
    if (b) {
      b.setVelocityY(-650);
      b.setDepth(9);
      this.shotsTotal++;
      SoundFX.playLaser();
    }
  }

  private triggerSpecialAbility() {
    SoundFX.playAbility();
    this.cameras.main.flash(250, 0, 246, 255);

    // Burst radial fire
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const b = this.playerBullets.create(this.player.x, this.player.y, 'tex_bullet_player') as Phaser.Physics.Arcade.Sprite;
      if (b) {
        b.setVelocity(Math.cos(angle) * 550, Math.sin(angle) * 550);
      }
    }
  }

  update() {
    if (this.isPaused || this.isGameOver) return;

    const { width, height } = this.scale;
    const now = Date.now();

    // 1. Controls (Keyboard)
    let vx = 0;
    let vy = 0;

    if (this.cursors.left?.isDown || this.wasd?.A?.isDown) vx = -this.speed;
    else if (this.cursors.right?.isDown || this.wasd?.D?.isDown) vx = this.speed;

    if (this.cursors.up?.isDown || this.wasd?.W?.isDown) vy = -this.speed;
    else if (this.cursors.down?.isDown || this.wasd?.S?.isDown) vy = this.speed;

    // Pointer Follow (Touch / Mouse drag)
    if (this.pointerDown) {
      const dx = this.touchTargetX - this.player.x;
      const dy = this.touchTargetY - this.player.y;
      if (Math.abs(dx) > 6) vx = Math.sign(dx) * this.speed;
      if (Math.abs(dy) > 6) vy = Math.sign(dy) * this.speed;
      // Continuous fire on touch
      this.firePlayerBullet();
    }

    this.player.setVelocity(vx, vy);

    // Auto-fire or spacebar
    if (this.spaceKey?.isDown || this.cursors?.space?.isDown) {
      this.firePlayerBullet();
    }

    // Special Ability (Q)
    if (Phaser.Input.Keyboard.JustDown(this.qKey)) {
      this.triggerSpecialAbility();
    }

    // Pause (ESC)
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.onPauseCallback();
    }

    // 2. Shield Gfx Update
    this.playerShieldGfx.clear();
    if (this.shield > 0) {
      this.playerShieldGfx.lineStyle(2, 0x00f6ff, 0.4 + (this.shield / this.maxShield) * 0.4);
      this.playerShieldGfx.strokeCircle(this.player.x, this.player.y, 34);
    }

    // 3. Worm Segments follow head in snake trail
    if (this.wormHead && this.wormHead.active) {
      let prevX = this.wormHead.x;
      let prevY = this.wormHead.y;
      for (const seg of this.wormSegments) {
        if (seg.active) {
          const targetX = prevX;
          const targetY = prevY - 20;
          seg.x += (targetX - seg.x) * 0.25;
          seg.y += (targetY - seg.y) * 0.25;
          prevX = seg.x;
          prevY = seg.y;
        }
      }
    }

    // 4. Parallax Background drifting platforms
    for (const plat of this.bgPlatforms) {
      plat.y += 0.3;
      if (plat.y > height + 60) {
        plat.y = -60;
        plat.x = Phaser.Math.Between(80, width - 80);
      }
    }

    // 5. Collisions: Player Bullets vs Enemies
    this.physics.overlap(this.playerBullets, this.enemies, (bObj, eObj) => {
      const bullet = bObj as Phaser.Physics.Arcade.Sprite;
      const enemy = eObj as Phaser.Physics.Arcade.Sprite;
      bullet.destroy();
      this.shotsHit++;

      let hp = (enemy.getData('health') || 30) - this.damage;
      enemy.setData('health', hp);

      // Flash on hit
      enemy.setTint(0xffffff);
      this.time.delayedCall(60, () => enemy.clearTint());

      if (hp <= 0) {
        enemy.destroy();
        this.enemiesKilled++;
        this.currentCombo++;
        this.maxCombo = Math.max(this.maxCombo, this.currentCombo);
        this.comboTimer = now + 2500;
        this.score += 150 * Math.min(this.currentCombo, 6);
        SoundFX.playExplosion(false);
      }
    });

    // 6. Collisions: Player Bullets vs Worm
    if (this.wormHead && this.wormHead.active) {
      this.physics.overlap(this.playerBullets, this.wormHead, (bObj) => {
        (bObj as Phaser.Physics.Arcade.Sprite).destroy();
        this.wormHealth -= this.damage;
        this.wormHead!.setTint(0xffffff);
        this.time.delayedCall(60, () => this.wormHead?.clearTint());
        this.score += 80;

        if (this.wormHealth <= 0) {
          SoundFX.playExplosion(true);
          this.wormHead!.destroy();
          this.wormHead = null;
          this.wormSegments.forEach(s => s.destroy());
          this.wormSegments = [];
          this.score += 5000;
          this.time.delayedCall(800, () => this.finishVictory());
        }
      });
    }

    // 7. Collisions: Player Bullets vs Boss
    if (this.boss && this.boss.active) {
      this.physics.overlap(this.playerBullets, this.boss, (bObj) => {
        (bObj as Phaser.Physics.Arcade.Sprite).destroy();
        this.bossHealth -= this.damage;
        this.boss!.setTint(0xffffff);
        this.time.delayedCall(60, () => this.boss?.clearTint());
        this.score += 60;

        if (this.bossHealth <= 0) {
          SoundFX.playExplosion(true);
          this.boss!.destroy();
          this.boss = null;
          this.score += 6000;
          this.time.delayedCall(800, () => this.finishVictory());
        }
      });
    }

    // 8. Collisions: Player collects Space Apples! (Health + Cores + Chime)
    this.physics.overlap(this.player, this.apples, (_, aObj) => {
      const apple = aObj as Phaser.Physics.Arcade.Sprite;
      apple.destroy();
      this.applesCollected++;
      this.score += 500;
      this.health = Math.min(this.maxHealth, this.health + Math.round(this.maxHealth * 0.35));
      this.shield = Math.min(this.maxShield, this.shield + 40);
      SoundFX.playPowerup();

      // Sparkle burst
      const emitter = this.add.particles(apple.x, apple.y, 'tex_bullet_player', {
        speed: { min: -100, max: 100 },
        scale: { start: 0.6, end: 0 },
        lifespan: 300,
        quantity: 8
      });
      this.time.delayedCall(300, () => emitter.destroy());
    });

    // 9. Collisions: Player vs Asteroids / Enemies
    this.physics.overlap(this.player, this.enemies, (_, eObj) => {
      (eObj as Phaser.Physics.Arcade.Sprite).destroy();
      this.takeDamage(25);
    });

    this.physics.overlap(this.player, this.obstacles, (_, oObj) => {
      (oObj as Phaser.Physics.Arcade.Sprite).destroy();
      this.takeDamage(20);
    });

    // 10. Update HUD & Combo
    if (now > this.comboTimer) this.currentCombo = 0;

    this.scoreText.setText(`SCORE: ${this.score.toLocaleString()}`);
    this.hullText.setText(`HULL: ${Math.round((this.health / this.maxHealth) * 100)}%`);
    this.shieldText.setText(`SHIELD: ${Math.round((this.shield / this.maxShield) * 100)}%`);
    this.comboText.setText(this.currentCombo > 1 ? `${this.currentCombo}x COMBO!` : '');

    // Boss bar render
    this.bossHealthBar.clear();
    if ((this.boss && this.bossMaxHealth > 0) || (this.wormHead && this.wormMaxHealth > 0)) {
      const hp = this.boss ? this.bossHealth : this.wormHealth;
      const maxHp = this.boss ? this.bossMaxHealth : this.wormMaxHealth;
      const pct = Math.max(0, hp / maxHp);
      this.bossHealthBar.fillStyle(0x1e1b4b, 0.8);
      this.bossHealthBar.fillRect(width / 2 - 120, 36, 240, 10);
      this.bossHealthBar.fillStyle(0xef4444, 1);
      this.bossHealthBar.fillRect(width / 2 - 120, 36, 240 * pct, 10);
      this.bossHealthBar.lineStyle(1, 0xffffff, 0.6);
      this.bossHealthBar.strokeRect(width / 2 - 120, 36, 240, 10);
    }
  }

  private takeDamage(amt: number) {
    const now = Date.now();
    if (now < this.invulnerableUntil) return;

    if (this.shield > 0) {
      this.shield = Math.max(0, this.shield - amt);
      SoundFX.playShieldHit();
    } else {
      this.health -= amt;
      this.invulnerableUntil = now + 600;
      this.cameras.main.flash(80, 239, 68, 68);
      SoundFX.playShieldHit();

      if (this.health <= 0) {
        this.health = 0;
        this.finishDefeat();
      }
    }
  }

  private finishVictory() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    SoundFX.playVictory();
    this.cameras.main.flash(400, 16, 185, 129);

    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const accuracy = this.shotsTotal > 0 ? Math.round((this.shotsHit / this.shotsTotal) * 100) : 85;

    this.time.delayedCall(700, () => {
      this.onVictory({
        sessionId: this.sessionId,
        missionId: this.missionId,
        elapsedSeconds: elapsed,
        score: this.score,
        enemiesDefeated: this.enemiesKilled,
        accuracyPercent: accuracy,
        damageTaken: this.maxHealth - this.health,
        powerupsCollected: this.applesCollected,
        healthRemaining: Math.round((this.health / this.maxHealth) * 100),
        maxCombo: this.maxCombo
      });
    });
  }

  private finishDefeat() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    SoundFX.playDefeat();
    this.cameras.main.shake(500, 0.02);
    this.player.setVisible(false);
    this.time.delayedCall(900, () => this.onDefeat());
  }

  pauseGame() {
    this.isPaused = true;
    this.physics.world.pause();
  }

  resumeGame() {
    this.isPaused = false;
    this.physics.world.resume();
  }
}

// ─── React Component Wrapper ──────────────────────────────────────────────────
export const GameCanvas: React.FC<GameCanvasProps> = ({
  missionId,
  sessionId,
  missionConfig,
  shipStats,
  onVictory,
  onDefeat,
  onPause
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<SpaceShooterScene | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 800,
      height: 600,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      backgroundColor: '#020617',
      physics: {
        default: 'arcade',
        arcade: { gravity: { x: 0, y: 0 }, debug: false }
      },
      input: {
        keyboard: true,
        mouse: true,
        touch: true
      }
    });

    gameRef.current = game;

    // Add and start scene with exact configuration data
    game.scene.add('SpaceShooterScene', SpaceShooterScene, true, {
      missionId,
      sessionId,
      missionConfig,
      shipStats,
      onVictory,
      onDefeat,
      onPause: () => {
        sceneRef.current?.pauseGame();
        onPause();
      }
    });

    const activeScene = game.scene.getScene('SpaceShooterScene') as SpaceShooterScene;
    sceneRef.current = activeScene;

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [missionId]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* Game Viewport Container */}
      <div
        ref={containerRef}
        className="w-full max-w-4xl aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-cyan-500/40 bg-slate-950"
        style={{ cursor: 'crosshair', maxHeight: '78vh' }}
      />

      {/* Responsive Mobile / Touch On-Screen Controls */}
      <div className="mt-3 flex items-center justify-between w-full max-w-4xl px-4 py-2 rounded-xl bg-space-900/80 border border-slate-700/60 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-mono text-cyan-400 font-bold">CONTROLS:</span>
          <span>WASD / Touch & Drag to Move</span>
          <span className="hidden sm:inline">· SPACE to Fire</span>
          <span className="hidden sm:inline">· Q for Radial Nova Burst</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onPause}
            className="px-3 py-1 rounded-lg bg-space-800 hover:bg-space-700 text-slate-200 border border-slate-600 font-mono"
          >
            ESC Pause
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameCanvas;
