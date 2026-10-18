import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { api } from '../services/api';
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

// ─── Main Gameplay Phaser Scene ───────────────────────────────────────────────
class GameScene extends Phaser.Scene {
  // Player
  private player!: Phaser.GameObjects.Container;
  private playerBody!: Phaser.GameObjects.Graphics;
  private playerShield!: Phaser.GameObjects.Graphics;
  private playerBullets!: Phaser.GameObjects.Group;

  // Enemies
  private enemies!: Phaser.GameObjects.Group;
  private enemyBullets!: Phaser.GameObjects.Group;

  // Boss
  private boss: Phaser.GameObjects.Container | null = null;
  private bossHealth = 0;
  private bossMaxHealth = 0;
  private bossPhase = 1;
  private bossBar!: Phaser.GameObjects.Graphics;
  private bossBarBg!: Phaser.GameObjects.Graphics;
  private bossNameText!: Phaser.GameObjects.Text;

  // Powerups
  private powerups!: Phaser.GameObjects.Group;
  private activePowerups: Map<string, number> = new Map();

  // Stars background
  private stars: Phaser.GameObjects.Graphics[] = [];

  // HUD
  private scoreText!: Phaser.GameObjects.Text;
  private healthText!: Phaser.GameObjects.Text;
  private shieldText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private powerupBar!: Phaser.GameObjects.Text;

  // State
  private health = 100;
  private maxHealth = 100;
  private shield = 100;
  private maxShield = 100;
  private score = 0;
  private isShieldActive = false;
  private invulnerableUntil = 0;
  private damage = 18;
  private fireRate = 180; // ms between shots
  private lastFired = 0;
  private currentWave = 0;
  private waveSpawnTimer = 0;
  private wavesConfig: any[] = [];
  private bossConfig: any = null;
  private bossSpawned = false;
  private allWavesCleared = false;
  private enemiesKilled = 0;
  private powerupsCollected = 0;
  private shotsTotal = 0;
  private shotsHit = 0;
  private startTime = 0;
  private maxCombo = 0;
  private currentCombo = 0;
  private missionId = '';
  private sessionId = '';
  private objectiveType = 'elimination';
  private objectiveTarget = 0;
  private survivalEndTime = 0;
  private isPaused = false;
  private isGameOver = false;
  private onVictory!: (payload: any) => void;
  private onDefeat!: () => void;
  private onPauseCallback!: () => void;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private abKey!: Phaser.Input.Keyboard.Key;
  private pauseKey!: Phaser.Input.Keyboard.Key;
  private specialCooldown = 0;
  private specialDuration = 0;
  private shipClass = 'interceptor';
  private speedMult = 1;
  private fireRateMult = 1;
  private damageMult = 1;
  private shieldMult = 1;
  private healthMult = 1;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: any) {
    this.missionId = data.missionId;
    this.sessionId = data.sessionId;
    this.wavesConfig = data.missionConfig?.waves || [];
    this.bossConfig = data.missionConfig?.bossConfig;
    this.objectiveType = data.missionConfig?.objective?.type || 'elimination';
    this.objectiveTarget = data.missionConfig?.objective?.targetCount || 0;
    const survivalSec = data.missionConfig?.objective?.targetSeconds;
    if (survivalSec) this.survivalEndTime = Date.now() + survivalSec * 1000;
    this.onVictory = data.onVictory;
    this.onDefeat = data.onDefeat;
    this.onPauseCallback = data.onPause;
    this.shipClass = data.shipStats?.class || 'interceptor';

    // Apply upgrade multipliers
    const upgrades = data.shipStats?.equippedUpgrades || {};
    const base = data.shipStats;
    const weaponMult = 1 + (((upgrades.weapon || 1) - 1) * 0.18);
    const shieldLvl = 1 + (((upgrades.shield || 1) - 1) * 0.20);
    const engineMult = 1 + (((upgrades.engine || 1) - 1) * 0.12);
    const hullMult = 1 + (((upgrades.hull || 1) - 1) * 0.22);
    const reactorMult = 1 + (((upgrades.reactor || 1) - 1) * 0.15);

    this.maxHealth = Math.round((base?.baseStats?.health || 120) * hullMult);
    this.health = this.maxHealth;
    this.maxShield = Math.round((base?.baseStats?.shield || 80) * shieldLvl);
    this.shield = this.maxShield;
    this.damage = Math.round((base?.baseStats?.damage || 18) * weaponMult * this.damageMult);
    this.speedMult = engineMult;
    this.fireRateMult = reactorMult;
    this.fireRate = Math.round(180 / ((base?.baseStats?.fireRate || 8) / 5) / weaponMult);
    this.specialCooldown = base?.specialAbility?.cooldownSeconds * 1000 || 20000;
    this.specialDuration = base?.specialAbility?.durationSeconds * 1000 || 6000;
  }

  preload() {
    // All graphics generated procedurally — no external assets
  }

  create() {
    const { width, height } = this.scale;
    this.startTime = Date.now();
    this.score = 0;
    this.isGameOver = false;

    // Background
    this.cameras.main.setBackgroundColor('#030712');
    this.createStarfield(width, height);

    // Groups
    this.playerBullets = this.add.group({ maxSize: 40, runChildUpdate: true });
    this.enemies = this.add.group({ runChildUpdate: true });
    this.enemyBullets = this.add.group({ maxSize: 80, runChildUpdate: true });
    this.powerups = this.add.group({ runChildUpdate: true });

    // Player ship
    this.player = this.createPlayerShip(width / 2, height - 100);

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
      this.abKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
      this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    }

    // HUD
    this.createHUD(width, height);

    // Boss bar (hidden initially)
    this.bossBarBg = this.add.graphics().setDepth(20);
    this.bossBar = this.add.graphics().setDepth(20);
    this.bossNameText = this.add.text(width / 2, 52, '', {
      fontFamily: 'Orbitron',
      fontSize: '13px',
      color: '#ef4444'
    }).setOrigin(0.5).setDepth(21);

    // Spawn first wave
    this.spawnWave(this.currentWave);
  }

  private createStarfield(w: number, h: number) {
    const gfx = this.add.graphics().setDepth(-10);
    for (let i = 0; i < 150; i++) {
      const x = Phaser.Math.Between(0, w);
      const y = Phaser.Math.Between(0, h);
      const size = Math.random() < 0.8 ? 1 : 2;
      const alpha = 0.3 + Math.random() * 0.7;
      gfx.fillStyle(0xffffff, alpha);
      gfx.fillRect(x, y, size, size);
    }
    // Nebula hints
    const neb = this.add.graphics().setDepth(-9).setAlpha(0.12);
    neb.fillStyle(0x7c3aed);
    neb.fillCircle(w * 0.2, h * 0.3, 120);
    neb.fillStyle(0x0e7490);
    neb.fillCircle(w * 0.8, h * 0.6, 90);
  }

  private createPlayerShip(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y).setDepth(10);

    const body = this.add.graphics();
    const colorMap: Record<string, number> = {
      interceptor: 0x00f6ff,
      guardian: 0x3b82f6,
      destroyer: 0xef4444,
      phantom: 0xa855f7,
      nova: 0xf59e0b
    };
    const col = colorMap[this.shipClass] || 0x00f6ff;

    // Engine glow
    body.fillStyle(col, 0.3);
    body.fillEllipse(0, 14, 18, 10);

    // Hull
    body.fillStyle(col, 0.9);
    body.fillTriangle(0, -28, -18, 20, 18, 20);
    body.fillStyle(0xffffff, 0.6);
    body.fillTriangle(0, -22, -6, 2, 6, 2);

    // Wings
    body.fillStyle(col, 0.7);
    body.fillTriangle(-18, 20, -30, 10, -10, 14);
    body.fillTriangle(18, 20, 30, 10, 10, 14);

    const shield = this.add.graphics();
    shield.lineStyle(2, col, 0.4);
    shield.strokeCircle(0, 0, 32);

    container.add([body, shield]);
    this.playerBody = body;
    this.playerShield = shield;

    // Add physics body
    this.physics.add.existing(container);
    const body2 = container.body as Phaser.Physics.Arcade.Body;
    body2.setSize(36, 48);
    body2.setCollideWorldBounds(true);

    return container;
  }

  private createEnemyGraphics(type: string, x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y).setDepth(8);
    const gfx = this.add.graphics();

    const typeColors: Record<string, number> = {
      scout: 0xff6600,
      interceptor_drone: 0xff4444,
      heavy_cruiser: 0xcc0000,
      stealth_infiltrator: 0x9900cc,
      swarm_bomber: 0xff0088
    };
    const col = typeColors[type] || 0xff6600;

    if (type === 'scout') {
      gfx.fillStyle(col, 0.9);
      gfx.fillTriangle(0, 20, -12, -15, 12, -15);
    } else if (type === 'interceptor_drone') {
      gfx.fillStyle(col, 0.9);
      gfx.fillRect(-10, -8, 20, 16);
      gfx.fillStyle(0xffffff, 0.4);
      gfx.fillCircle(0, 0, 5);
    } else if (type === 'heavy_cruiser') {
      gfx.fillStyle(col, 0.9);
      gfx.fillRect(-20, -15, 40, 30);
      gfx.fillStyle(col, 0.5);
      gfx.fillRect(-28, -8, 10, 16);
      gfx.fillRect(18, -8, 10, 16);
    } else if (type === 'stealth_infiltrator') {
      gfx.fillStyle(col, 0.7);
      gfx.fillTriangle(0, 18, -18, -10, 18, -10);
      gfx.fillTriangle(-12, -10, -22, -20, -4, -16);
      gfx.fillTriangle(12, -10, 22, -20, 4, -16);
    } else {
      // swarm_bomber
      gfx.fillStyle(col, 0.9);
      gfx.fillCircle(0, 0, 14);
      gfx.fillStyle(0xffff00, 0.6);
      gfx.fillCircle(0, 0, 6);
    }

    container.add(gfx);
    this.physics.add.existing(container);
    const b = container.body as Phaser.Physics.Arcade.Body;
    b.setSize(28, 28);

    return container;
  }

  private spawnWave(waveIndex: number) {
    if (waveIndex >= this.wavesConfig.length) {
      if (this.bossConfig && !this.bossSpawned) {
        this.time.delayedCall(1500, () => this.spawnBoss());
      } else {
        this.allWavesCleared = true;
      }
      return;
    }

    const wave = this.wavesConfig[waveIndex];
    const { width } = this.scale;
    let delay = 0;

    for (const enemyConfig of wave.enemies) {
      for (let i = 0; i < enemyConfig.count; i++) {
        this.time.delayedCall(delay, () => {
          const x = Phaser.Math.Between(40, width - 40);
          const y = Phaser.Math.Between(-50, -20);
          const enemy = this.createEnemyGraphics(enemyConfig.type, x, y);
          const b = enemy.body as Phaser.Physics.Arcade.Body;
          b.setVelocity(
            Phaser.Math.Between(-40, 40),
            enemyConfig.speed || 100
          );

          enemy.setData('health', enemyConfig.health || 30);
          enemy.setData('maxHealth', enemyConfig.health || 30);
          enemy.setData('damage', enemyConfig.damage || 10);
          enemy.setData('type', enemyConfig.type);
          enemy.setData('lastShot', 0);
          enemy.setData('fireRate', 1500 + Math.random() * 2000);

          this.enemies.add(enemy);
        });
        delay += 120;
      }
    }

    // Next wave after delay + spawn time
    const nextDelay = delay + (wave.spawnDelaySeconds || 3) * 1000;
    this.waveSpawnTimer = nextDelay;

    this.time.delayedCall(nextDelay, () => {
      this.currentWave++;
      this.spawnWave(this.currentWave);
    });
  }

  private spawnBoss() {
    if (!this.bossConfig || this.bossSpawned) return;
    this.bossSpawned = true;

    const { width } = this.scale;
    const container = this.add.container(width / 2, -60).setDepth(9);
    const gfx = this.add.graphics();

    // Boss visual (large imposing design)
    const bossColors: Record<string, number> = {
      aegis_dreadnought: 0xff2200,
      nebula_leviathan: 0xcc00ff,
      cyber_overlord: 0x00ffcc,
      solar_titan: 0xff8800,
      void_empress: 0x6600ff
    };
    const col = bossColors[this.bossConfig.bossType] || 0xff0000;

    gfx.fillStyle(col, 0.9);
    gfx.fillRect(-50, -30, 100, 60);
    gfx.fillStyle(col, 0.7);
    gfx.fillRect(-70, -15, 25, 30);
    gfx.fillRect(45, -15, 25, 30);
    gfx.fillStyle(0xffffff, 0.4);
    gfx.fillCircle(0, 0, 18);
    gfx.fillStyle(0xff0000, 0.8);
    gfx.fillCircle(-20, -8, 6);
    gfx.fillCircle(20, -8, 6);

    container.add(gfx);

    this.physics.add.existing(container);
    const b = container.body as Phaser.Physics.Arcade.Body;
    b.setSize(120, 60);
    b.setVelocity(0, 60);

    this.bossHealth = this.bossConfig.health || 1500;
    this.bossMaxHealth = this.bossHealth;
    this.boss = container;
    this.boss.setData('health', this.bossHealth);
    this.boss.setData('lastAttack', 0);
    this.boss.setData('attackPhase', 0);

    this.bossNameText.setText(`⚡ ${this.bossConfig.name} ⚡`);

    // Boss movement pattern: oscillate
    this.tweens.add({
      targets: container,
      x: { from: 80, to: width - 80 },
      yoyo: true,
      repeat: -1,
      duration: 2800,
      ease: 'Sine.easeInOut'
    });

    this.time.delayedCall(1000, () => {
      const bod = container.body as Phaser.Physics.Arcade.Body;
      bod.setVelocityY(0);
      container.y = 90;
    });

    SoundFX.playAbility();
    this.cameras.main.shake(300, 0.012);
  }

  private fireBullet(fromX: number, fromY: number, isPlayer: boolean, angle = -Math.PI / 2, bulletColor = 0x00f6ff) {
    const gfx = this.add.graphics();
    if (isPlayer) {
      gfx.fillStyle(bulletColor, 1);
      gfx.fillRect(-2, -8, 4, 16);
    } else {
      gfx.fillStyle(0xff3300, 0.9);
      gfx.fillCircle(0, 0, 4);
    }

    const bullet = this.add.container(fromX, fromY, [gfx]).setDepth(7);
    this.physics.add.existing(bullet);
    const b = bullet.body as Phaser.Physics.Arcade.Body;
    const speed = isPlayer ? 650 : 250;
    b.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    b.setAllowGravity(false);
    bullet.setData('isPlayer', isPlayer);
    bullet.setData('damage', isPlayer ? this.damage : 12);

    if (isPlayer) {
      this.playerBullets.add(bullet);
      this.shotsTotal++;
      SoundFX.playLaser(Phaser.Math.Between(-80, 80));
    } else {
      this.enemyBullets.add(bullet);
    }
  }

  private fireMultiShot(fromX: number, fromY: number) {
    const angles = [-Math.PI / 2, -Math.PI / 2 - 0.25, -Math.PI / 2 + 0.25];
    angles.forEach(a => this.fireBullet(fromX, fromY, true, a, 0x00ffcc));
  }

  private spawnPowerup(x: number, y: number) {
    const types = ['shield', 'rapid_fire', 'healing', 'damage_boost', 'multi_shot', 'invulnerability', 'homing_missiles', 'emp_blast'];
    const type = types[Math.floor(Math.random() * types.length)];

    const gfx = this.add.graphics();
    const colorMap: Record<string, number> = {
      shield: 0x3b82f6, rapid_fire: 0xfbbf24, healing: 0x10b981,
      damage_boost: 0xef4444, multi_shot: 0xa855f7,
      invulnerability: 0xffffff, homing_missiles: 0xf97316, emp_blast: 0x06b6d4
    };
    const col = colorMap[type] || 0xffffff;
    gfx.fillStyle(col, 0.9);
    gfx.fillRect(-10, -10, 20, 20);
    gfx.lineStyle(1.5, 0xffffff, 0.8);
    gfx.strokeRect(-10, -10, 20, 20);

    const container = this.add.container(x, y, [gfx]).setDepth(6);
    this.physics.add.existing(container);
    const b = container.body as Phaser.Physics.Arcade.Body;
    b.setVelocity(0, 60);
    b.setAllowGravity(false);
    container.setData('type', type);

    this.tweens.add({
      targets: container,
      angle: 360,
      repeat: -1,
      duration: 1200
    });

    this.powerups.add(container);
  }

  private activatePowerup(type: string) {
    const durations: Record<string, number> = {
      rapid_fire: 6000, damage_boost: 7000, multi_shot: 8000,
      invulnerability: 5000, shield: 0, healing: 0,
      homing_missiles: 8000, emp_blast: 0
    };

    SoundFX.playPowerup();
    this.powerupsCollected++;

    switch (type) {
      case 'healing':
        this.health = Math.min(this.maxHealth, this.health + Math.round(this.maxHealth * 0.35));
        break;
      case 'shield':
        this.shield = Math.min(this.maxShield, this.shield + Math.round(this.maxShield * 0.5));
        break;
      case 'emp_blast':
        // Stun all enemies briefly
        this.enemies.getChildren().forEach((e) => {
          const body = (e as Phaser.GameObjects.Container).body as Phaser.Physics.Arcade.Body;
          body.setVelocity(0, 0);
          this.time.delayedCall(2000, () => body.setVelocity(Phaser.Math.Between(-40, 40), 80));
        });
        this.cameras.main.flash(200, 100, 200, 255);
        break;
      default:
        if (durations[type] > 0) {
          this.activePowerups.set(type, Date.now() + durations[type]);
        }
    }
  }

  private createHUD(w: number, h: number) {
    const style = { fontFamily: 'Orbitron', fontSize: '11px', color: '#00f6ff', stroke: '#000', strokeThickness: 2 };

    this.scoreText = this.add.text(10, 10, 'SCORE: 0', { ...style, fontSize: '13px' }).setDepth(15);
    this.healthText = this.add.text(10, 30, 'HULL: 100%', { ...style, color: '#10b981' }).setDepth(15);
    this.shieldText = this.add.text(10, 48, 'SHIELD: 100%', { ...style, color: '#3b82f6' }).setDepth(15);
    this.waveText = this.add.text(w / 2, 10, 'WAVE 1', style).setOrigin(0.5).setDepth(15);
    this.timerText = this.add.text(w - 10, 10, '', style).setOrigin(1, 0).setDepth(15);
    this.powerupBar = this.add.text(10, h - 20, '', { fontFamily: 'Rajdhani', fontSize: '10px', color: '#fbbf24' }).setDepth(15);
  }

  private updateHUD() {
    this.scoreText.setText(`SCORE: ${this.score.toLocaleString()}`);
    this.healthText.setText(`HULL: ${Math.round((this.health / this.maxHealth) * 100)}%`);
    this.shieldText.setText(`SHIELD: ${Math.round((this.shield / this.maxShield) * 100)}%`);
    this.waveText.setText(`WAVE ${this.currentWave + 1}/${this.wavesConfig.length}`);

    const now = Date.now();
    const elapsed = Math.floor((now - this.startTime) / 1000);
    this.timerText.setText(`${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`);

    // Active powerups display
    const activePUText = Array.from(this.activePowerups.entries())
      .filter(([, end]) => now < end)
      .map(([type]) => `[${type.toUpperCase().replace('_', ' ')}]`)
      .join(' ');
    this.powerupBar.setText(activePUText);

    // Boss bar
    if (this.boss && this.bossMaxHealth > 0) {
      const { width } = this.scale;
      const bossPercent = Math.max(0, this.bossHealth / this.bossMaxHealth);
      this.bossBarBg.clear();
      this.bossBarBg.fillStyle(0x1a1a2e, 0.8);
      this.bossBarBg.fillRect(60, 55, width - 120, 12);
      this.bossBar.clear();
      this.bossBar.fillStyle(0xef4444, 1);
      this.bossBar.fillRect(60, 55, (width - 120) * bossPercent, 12);
    }
  }

  private triggerVictory() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    SoundFX.playVictory();
    this.cameras.main.flash(500, 0, 255, 100);
    this.cameras.main.shake(200, 0.01);

    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const accuracy = this.shotsTotal > 0 ? Math.round((this.shotsHit / this.shotsTotal) * 100) : 0;

    this.time.delayedCall(800, () => {
      this.onVictory({
        sessionId: this.sessionId,
        missionId: this.missionId,
        elapsedSeconds: elapsed,
        score: this.score,
        enemiesDefeated: this.enemiesKilled,
        accuracyPercent: accuracy,
        damageTaken: this.maxHealth - this.health,
        powerupsCollected: this.powerupsCollected,
        healthRemaining: Math.round((this.health / this.maxHealth) * 100),
        maxCombo: this.maxCombo
      });
    });
  }

  private triggerDefeat() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    SoundFX.playDefeat();
    this.cameras.main.shake(600, 0.025);
    this.cameras.main.flash(400, 255, 50, 0);

    const explosion = this.add.graphics().setDepth(20);
    explosion.fillStyle(0xff6600, 1);
    explosion.fillCircle(this.player.x, this.player.y, 40);
    this.player.setVisible(false);

    this.time.delayedCall(1200, () => this.onDefeat());
  }

  private handleCollisions() {
    const now = Date.now();

    // Player bullets vs enemies
    this.playerBullets.getChildren().slice().forEach((bRaw) => {
      const bullet = bRaw as Phaser.GameObjects.Container;
      if (!bullet.active) return;
      const { width, height } = this.scale;
      const bx = bullet.x; const by = bullet.y;
      if (bx < 0 || bx > width || by < 0 || by > height) {
        bullet.destroy();
        return;
      }

      this.enemies.getChildren().slice().forEach((eRaw) => {
        const enemy = eRaw as Phaser.GameObjects.Container;
        if (!enemy.active) return;
        const dist = Phaser.Math.Distance.Between(bullet.x, bullet.y, enemy.x, enemy.y);
        if (dist < 26) {
          bullet.destroy();
          this.shotsHit++;
          let hp = enemy.getData('health') as number;
          hp -= this.damage;
          enemy.setData('health', hp);

          if (hp <= 0) {
            // Explosion particles
            const expl = this.add.graphics().setDepth(12);
            expl.fillStyle(0xff6600, 0.9);
            expl.fillCircle(enemy.x, enemy.y, 20);
            this.time.delayedCall(150, () => expl.destroy());

            enemy.destroy();
            this.enemiesKilled++;
            this.currentCombo++;
            this.maxCombo = Math.max(this.maxCombo, this.currentCombo);
            this.score += 200 * Math.min(this.currentCombo, 5);
            SoundFX.playExplosion(false);

            // Chance to drop powerup
            if (Math.random() < 0.18) {
              this.spawnPowerup(enemy.x, enemy.y);
            }

            // Check elimination objective
            if (this.objectiveType === 'elimination' && this.enemiesKilled >= this.objectiveTarget) {
              this.time.delayedCall(500, () => this.triggerVictory());
            }
          }
          this.time.delayedCall(500, () => { this.currentCombo = 0; });
        }
      });

      // Player bullets vs boss
      if (this.boss && this.boss.active) {
        const dist = Phaser.Math.Distance.Between(bullet.x, bullet.y, this.boss.x, this.boss.y);
        if (dist < 65) {
          bullet.destroy();
          this.shotsHit++;
          this.bossHealth -= this.damage;
          this.boss.setData('health', this.bossHealth);
          this.score += 50;

          if (this.bossHealth <= 0) {
            SoundFX.playExplosion(true);
            this.cameras.main.shake(500, 0.02);
            const bigExp = this.add.graphics().setDepth(20);
            bigExp.fillStyle(0xff8800, 1);
            bigExp.fillCircle(this.boss.x, this.boss.y, 80);
            this.boss.destroy();
            this.boss = null;
            this.score += 5000;
            this.time.delayedCall(500, () => bigExp.destroy());
            this.time.delayedCall(800, () => this.triggerVictory());
          }
        }
      }
    });

    // Enemy bullets vs player
    this.enemyBullets.getChildren().slice().forEach((bRaw) => {
      const bullet = bRaw as Phaser.GameObjects.Container;
      if (!bullet.active) return;
      const { width, height } = this.scale;
      if (bullet.x < 0 || bullet.x > width || bullet.y < 0 || bullet.y > height) {
        bullet.destroy();
        return;
      }
      const dist = Phaser.Math.Distance.Between(bullet.x, bullet.y, this.player.x, this.player.y);
      if (dist < 22) {
        bullet.destroy();
        this.applyDamageToPlayer(12);
      }
    });

    // Enemies vs player (collision)
    this.enemies.getChildren().slice().forEach((eRaw) => {
      const enemy = eRaw as Phaser.GameObjects.Container;
      if (!enemy.active) return;
      const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      if (dist < 30) {
        enemy.destroy();
        this.applyDamageToPlayer(25);
      }
    });

    // Powerups vs player
    this.powerups.getChildren().slice().forEach((pRaw) => {
      const pu = pRaw as Phaser.GameObjects.Container;
      if (!pu.active) return;
      const { height } = this.scale;
      if (pu.y > height + 50) { pu.destroy(); return; }
      const dist = Phaser.Math.Distance.Between(pu.x, pu.y, this.player.x, this.player.y);
      if (dist < 28) {
        const type = pu.getData('type') as string;
        this.activatePowerup(type);
        pu.destroy();
      }
    });
  }

  private applyDamageToPlayer(amount: number) {
    const now = Date.now();
    if (now < this.invulnerableUntil) return;

    // Invulnerability powerup
    if (this.activePowerups.has('invulnerability') && now < (this.activePowerups.get('invulnerability') || 0)) return;

    if (this.shield > 0) {
      this.shield = Math.max(0, this.shield - amount);
      SoundFX.playShieldHit();
    } else {
      this.health -= amount;
      this.invulnerableUntil = now + 800; // 800ms grace period
      this.cameras.main.flash(100, 255, 50, 50, true);
      SoundFX.playShieldHit();

      if (this.health <= 0) {
        this.health = 0;
        this.triggerDefeat();
      }
    }
  }

  private enemyFire() {
    const now = Date.now();
    this.enemies.getChildren().forEach((eRaw) => {
      const enemy = eRaw as Phaser.GameObjects.Container;
      if (!enemy.active) return;
      const lastShot = enemy.getData('lastShot') as number;
      const fireRate = enemy.getData('fireRate') as number;
      if (now - lastShot > fireRate) {
        enemy.setData('lastShot', now);
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        this.fireBullet(enemy.x, enemy.y + 15, false, angle);
      }
    });

    // Boss firing patterns
    if (this.boss && this.boss.active) {
      const lastAttack = this.boss.getData('lastAttack') as number;
      if (now - lastAttack > 1200) {
        this.boss.setData('lastAttack', now);
        const angles = [-Math.PI / 2 - 0.5, -Math.PI / 2, -Math.PI / 2 + 0.5];
        angles.forEach(a => this.fireBullet(this.boss!.x, this.boss!.y + 35, false, a));
      }
    }
  }

  private handleSpecialAbility() {
    const now = Date.now();
    const abilityKey = this.activePowerups.get('_specialLastUsed') || 0;
    if (now < abilityKey) return;

    switch (this.shipClass) {
      case 'interceptor': // Hyper Overdrive
        this.activePowerups.set('rapid_fire', now + this.specialDuration);
        this.activePowerups.set('_specialLastUsed', now + this.specialCooldown);
        break;
      case 'guardian': // Kinetic Barrier
        this.activePowerups.set('invulnerability', now + this.specialDuration);
        this.activePowerups.set('_specialLastUsed', now + this.specialCooldown);
        break;
      case 'destroyer': // Plasma Barrage
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2;
          this.fireBullet(this.player.x, this.player.y, true, a, 0xff6600);
        }
        this.activePowerups.set('_specialLastUsed', now + this.specialCooldown);
        break;
      case 'phantom': // Phase Shift
        this.activePowerups.set('invulnerability', now + this.specialDuration);
        this.player.setAlpha(0.3);
        this.time.delayedCall(this.specialDuration, () => this.player.setAlpha(1));
        this.activePowerups.set('_specialLastUsed', now + this.specialCooldown);
        break;
      case 'nova': // Supernova Burst
        this.activePowerups.set('damage_boost', now + this.specialDuration);
        this.activePowerups.set('multi_shot', now + this.specialDuration);
        this.cameras.main.flash(300, 255, 200, 50);
        this.cameras.main.shake(200, 0.01);
        this.activePowerups.set('_specialLastUsed', now + this.specialCooldown);
        break;
    }

    SoundFX.playAbility();
  }

  update(time: number, delta: number) {
    if (this.isPaused || this.isGameOver) return;

    const { width, height } = this.scale;
    const now = Date.now();
    const speed = 260 * this.speedMult;
    const pBody = this.player.body as Phaser.Physics.Arcade.Body;

    // Movement
    pBody.setVelocity(0, 0);
    if (this.cursors.left.isDown || this.wasd.A.isDown) pBody.setVelocityX(-speed);
    else if (this.cursors.right.isDown || this.wasd.D.isDown) pBody.setVelocityX(speed);
    if (this.cursors.up.isDown || this.wasd.W.isDown) pBody.setVelocityY(-speed);
    else if (this.cursors.down.isDown || this.wasd.S.isDown) pBody.setVelocityY(speed);

    // Clamp to screen
    this.player.x = Phaser.Math.Clamp(this.player.x, 24, width - 24);
    this.player.y = Phaser.Math.Clamp(this.player.y, 24, height - 24);

    // Firing
    const rapidFire = this.activePowerups.has('rapid_fire') && now < (this.activePowerups.get('rapid_fire') || 0);
    const effectiveFireRate = rapidFire ? this.fireRate * 0.35 : this.fireRate;

    if ((this.spaceKey.isDown || this.cursors.space?.isDown) && now - this.lastFired > effectiveFireRate) {
      this.lastFired = now;
      const multiShot = this.activePowerups.has('multi_shot') && now < (this.activePowerups.get('multi_shot') || 0);
      if (multiShot) {
        this.fireMultiShot(this.player.x, this.player.y - 20);
      } else {
        this.fireBullet(this.player.x, this.player.y - 20, true);
      }
    }

    // Special Ability (Q key)
    if (Phaser.Input.Keyboard.JustDown(this.abKey)) {
      this.handleSpecialAbility();
    }

    // Pause (ESC)
    if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
      this.onPauseCallback();
    }

    // Enemy firing
    this.enemyFire();

    // Collision detection
    this.handleCollisions();

    // Score boost
    const damageBoost = this.activePowerups.has('damage_boost') && now < (this.activePowerups.get('damage_boost') || 0);
    this.damage = Math.round((this.scene.settings.data as any)?.baseDamage || 18) * (damageBoost ? 2.2 : 1);

    // Shield regen
    if (this.shield < this.maxShield && now % 60 < 20) {
      this.shield = Math.min(this.maxShield, this.shield + 0.08);
    }

    // Survival objective
    if (this.objectiveType === 'survival' && now >= this.survivalEndTime && this.survivalEndTime > 0) {
      this.survivalEndTime = 0;
      this.triggerVictory();
    }

    // All waves done, no boss: auto-victory after enemies clear
    if (this.allWavesCleared && this.objectiveType !== 'survival') {
      const aliveEnemies = this.enemies.getChildren().filter(e => e.active);
      if (aliveEnemies.length === 0 && !this.bossSpawned && !this.boss) {
        this.allWavesCleared = false;
        this.time.delayedCall(1500, () => this.triggerVictory());
      }
    }

    // Scrolling stars parallax
    this.updateHUD();
  }

  pauseGame() { this.isPaused = true; this.physics.world.pause(); }
  resumeGame() { this.isPaused = false; this.physics.world.resume(); }
}

// ─── React Wrapper Component ───────────────────────────────────────────────────
const GameCanvas: React.FC<GameCanvasProps> = ({
  missionId, sessionId, missionConfig, shipStats, onVictory, onDefeat, onPause
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<GameScene | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: Math.min(800, window.innerWidth),
      height: Math.min(600, window.innerHeight - 60),
      backgroundColor: '#030712',
      physics: {
        default: 'arcade',
        arcade: { gravity: { x: 0, y: 0 }, debug: false }
      },
      scene: GameScene,
      input: {
        keyboard: true,
        mouse: true,
        touch: true
      }
    });

    gameRef.current = game;

    game.events.once('ready', () => {
      const scene = game.scene.getScene('GameScene') as GameScene;
      sceneRef.current = scene;
      scene.scene.start('GameScene', {
        missionId,
        sessionId,
        missionConfig,
        shipStats,
        onVictory,
        onDefeat,
        onPause: () => {
          scene.pauseGame();
          onPause();
        }
      });
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-space-950"
      style={{ cursor: 'crosshair' }}
    />
  );
};

export default GameCanvas;
