import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import GameCanvas from '../game/GameCanvas';
import StarBackground from '../components/StarBackground';
import { ShipVisual } from '../components/ShipVisual';
import { Pause, Play, RotateCcw, LogOut, Star, Zap, Shield, Trophy } from 'lucide-react';

const DEFAULT_FALLBACK_SHIP = {
  shipId: 'ship_interceptor',
  name: 'NX-1 Interceptor',
  shipClass: 'interceptor',
  rarity: 'Common',
  baseStats: {
    hull: 100,
    shield: 50,
    speed: 350,
    fireRate: 6.0,
    attackPower: 25,
    specialAbility: 'AFTERBURNER',
    specialCooldown: 12
  },
  equippedUpgrades: {}
};

const GamePage: React.FC = () => {
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate();
  const { profile, wallet, refreshWallet, refreshUserData } = useAuth();
  const { showToast } = useToast();

  const [phase, setPhase] = useState<'briefing' | 'playing' | 'paused' | 'victory' | 'defeat'>('briefing');
  const [mission, setMission] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [shipData, setShipData] = useState<any>(DEFAULT_FALLBACK_SHIP);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!missionId) return;
      try {
        const [missRes, invRes] = await Promise.all([
          api.getMission(missionId).catch(() => ({ mission: null })),
          api.getInventory().catch(() => ({ shipDefinitions: [] }))
        ]);

        if (missRes?.mission) {
          setMission(missRes.mission);
        } else {
          // If offline or mission not in DB, create an instant Sector mission config
          const sector = parseInt(missionId.replace('m', '').substring(0, 1)) || 1;
          setMission({
            missionId,
            sector,
            sectorName: ['Orion Nebula', 'Kuiper Asteroid Belt', 'Veloop Core Station', 'Proxima Centauri', 'Cosmic Void Abyss'][sector - 1] || 'Deep Cosmos',
            title: `Sector ${sector} Vanguard Sweep`,
            difficulty: sector === 1 ? 'Cadet' : sector === 2 ? 'Veteran' : sector === 3 ? 'Elite' : sector === 4 ? 'Master' : 'Nightmare',
            loreBrief: 'Tactical command detects enemy swarms, rogue asteroid belts, and space serpent anomalies. Neutralize all hostiles and collect golden energy apples.',
            objective: { description: 'Destroy hostile craft and collect stellar energy apples.', targetScore: 3000 * sector },
            rewards: { credits: 150 * sector, xp: 200 * sector, veloopCoins: 25 * sector },
            bossConfig: sector % 2 === 0 ? { name: 'Titan Serpent Dreadnought' } : null
          });
        }

        const equippedId = profile?.equippedShipId || 'ship_interceptor';
        const shipDef = invRes?.shipDefinitions?.find((s: any) => s.shipId === equippedId);
        if (shipDef) {
          setShipData({
            ...shipDef,
            equippedUpgrades: profile?.equippedUpgrades || {}
          });
        } else {
          setShipData({
            ...DEFAULT_FALLBACK_SHIP,
            shipId: equippedId,
            shipClass: equippedId.replace('ship_', '') || 'interceptor'
          });
        }
      } catch (err: any) {
        showToast(err.message || 'Starting in standby flight mode', 'warning');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [missionId, profile]);

  const startGame = async () => {
    try {
      const res = await api.startMission(missionId!);
      setSession(res);
      setPhase('playing');
    } catch (err: any) {
      console.warn('Backend startMission unreachable, starting offline flight session:', err);
      setSession({
        sessionId: `local_sess_${Date.now()}`,
        missionId: missionId,
        energyCost: 10,
        startedAt: new Date().toISOString()
      });
      setPhase('playing');
    }
  };

  const handleVictory = useCallback(async (payload: any) => {
    setPhase('victory');
    try {
      const res = await api.completeMission(missionId!, payload);
      setResult(res);
      await refreshUserData();
      showToast(`Mission complete! +${res.rewardsAwarded?.credits || 150} Credits earned!`, 'success');
    } catch (err: any) {
      setResult({
        stars: payload?.stars || 3,
        rewardsAwarded: {
          credits: mission?.rewards?.credits || 250,
          energyCores: 1,
          xp: mission?.rewards?.xp || 300,
          veloopCoins: mission?.rewards?.veloopCoins || 50
        }
      });
      showToast(`Mission Victory recorded locally!`, 'success');
    }
  }, [missionId, mission, refreshUserData, showToast]);

  const handleDefeat = useCallback(() => {
    setPhase('defeat');
  }, []);

  const handlePause = useCallback(() => {
    setPhase(prev => prev === 'playing' ? 'paused' : 'playing');
  }, []);

  if (loading || !mission) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-space-950">
        <div className="text-neon-cyan font-orbitron animate-pulse text-lg">PREPARING MISSION...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space-950 flex flex-col">
      {/* Mission Briefing */}
      {phase === 'briefing' && (
        <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden">
          <StarBackground showFighters={true} />
          <div className="relative z-10 glass-panel-glow rounded-3xl p-8 max-w-xl w-full border border-cyan-500/40 shadow-2xl">
            <div className="text-xs font-orbitron text-slate-500 mb-1">{mission.missionId} · SECTOR {mission.sector}: {mission.sectorName}</div>
            <h1 className="font-orbitron text-xl font-bold text-white mb-2">{mission.title}</h1>
            {mission.bossConfig && (
              <div className="text-xs text-red-400 font-bold mb-2 animate-pulse">⚡ BOSS ENCOUNTER: {mission.bossConfig.name}</div>
            )}
            <div className={`inline-block px-2 py-0.5 rounded text-xs font-bold mb-4 ${
              mission.difficulty === 'Nightmare' ? 'bg-red-900/30 text-red-400' :
              mission.difficulty === 'Master' ? 'bg-orange-900/30 text-orange-400' :
              mission.difficulty === 'Elite' ? 'bg-yellow-900/30 text-yellow-400' :
              mission.difficulty === 'Veteran' ? 'bg-cyan-900/30 text-cyan-400' :
              'bg-emerald-900/30 text-emerald-400'
            }`}>{mission.difficulty}</div>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">{mission.loreBrief}</p>

            {/* Commissioned Ship Preview */}
            <div className="flex items-center gap-4 bg-space-900/80 p-3.5 rounded-xl border border-cyan-500/30 mb-4 shadow-inner">
              <div className="w-16 h-16 flex items-center justify-center bg-space-950 rounded-lg border border-cyan-500/30 p-1 flex-shrink-0">
                <ShipVisual
                  shipClass={shipData?.shipClass || shipData?.shipId?.replace('ship_', '') || 'interceptor'}
                  size={52}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-orbitron text-cyan-400 tracking-wider">DEPLOYED CRAFT</div>
                <div className="text-sm font-bold text-white font-orbitron truncate">{shipData?.name || 'NX-1 Interceptor'}</div>
                <div className="text-xs text-slate-300 flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-emerald-400 font-mono">Hull: {shipData?.baseStats?.hull || 100}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-cyan-400 font-mono">Shield: {shipData?.baseStats?.shield || 50}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-purple-400 font-mono">Speed: {shipData?.baseStats?.speed || 350}</span>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-lg p-3 mb-4 border border-cyan-500/20">
              <div className="text-xs text-neon-cyan font-bold mb-1">OBJECTIVE</div>
              <p className="text-white text-sm">{mission.objective?.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
              <div className="glass-card rounded-lg p-3 text-center border border-yellow-500/20">
                <div className="text-yellow-400 font-bold text-base">+{mission.rewards?.credits}</div>
                <div className="text-slate-500">Credits</div>
              </div>
              <div className="glass-card rounded-lg p-3 text-center border border-purple-500/20">
                <div className="text-neon-purple font-bold text-base flex items-center justify-center gap-1">
                  <Shield size={12} />+{mission.rewards?.veloopCoins}
                </div>
                <div className="text-slate-500">VELoop Coins</div>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-xs text-slate-400 mb-5">
              <div className="flex gap-2 flex-wrap">
                <span className="bg-space-800 rounded px-2 py-1 border border-slate-700">WASD / ↑↓←→ / Drag Move</span>
                <span className="bg-space-800 rounded px-2 py-1 border border-slate-700">SPACE Auto Fire</span>
                <span className="bg-space-800 rounded px-2 py-1 border border-slate-700">Q Special Ability</span>
                <span className="bg-space-800 rounded px-2 py-1 border border-slate-700">ESC Pause</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate('/missions')} className="px-4 py-2.5 rounded-lg glass-card border border-slate-600 text-slate-400 hover:text-white text-sm transition-all">
                ← Back
              </button>
              <button
                onClick={startGame}
                className="flex-1 py-2.5 rounded-lg font-orbitron font-bold text-sm uppercase tracking-wider
                  bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white transition-all hover:shadow-neon-cyan"
              >
                ▶ LAUNCH MISSION
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Gameplay */}
      {(phase === 'playing' || phase === 'paused') && session && (
        <div className="relative flex-1 flex flex-col">
          {/* Pause Overlay */}
          {phase === 'paused' && (
            <div className="absolute inset-0 z-30 bg-black/80 flex items-center justify-center">
              <div className="glass-panel-glow rounded-2xl p-8 text-center border border-cyan-500/30 max-w-sm w-full">
                <h2 className="font-orbitron text-xl font-bold text-neon-cyan mb-6">MISSION PAUSED</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={() => setPhase('playing')} className="py-3 rounded-lg font-orbitron font-bold text-sm bg-gradient-to-r from-cyan-600 to-blue-600 text-white flex items-center justify-center gap-2">
                    <Play size={16} /> RESUME
                  </button>
                  <button onClick={() => { setPhase('briefing'); setSession(null); }} className="py-3 rounded-lg glass-card border border-slate-600 text-slate-400 hover:text-white text-sm flex items-center justify-center gap-2">
                    <RotateCcw size={16} /> RESTART
                  </button>
                  <button onClick={() => navigate('/missions')} className="py-3 rounded-lg glass-card border border-red-600/40 text-red-400 hover:text-red-300 text-sm flex items-center justify-center gap-2">
                    <LogOut size={16} /> ABANDON
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Game Canvas */}
          <div className="flex-1" style={{ minHeight: '500px' }}>
            <GameCanvas
              missionId={missionId!}
              sessionId={session.sessionId}
              missionConfig={mission}
              shipStats={shipData}
              onVictory={handleVictory}
              onDefeat={handleDefeat}
              onPause={handlePause}
            />
          </div>
        </div>
      )}

      {/* Victory Screen */}
      {phase === 'victory' && (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="glass-panel-glow rounded-2xl p-8 max-w-md w-full border border-emerald-500/40 text-center">
            <div className="text-4xl mb-2">🏆</div>
            <h2 className="font-orbitron text-2xl font-bold text-emerald-400 mb-1">MISSION SUCCESS</h2>
            <p className="text-slate-400 text-sm mb-5">{mission.title}</p>

            {result && (
              <>
                {/* Stars */}
                <div className="flex justify-center gap-2 mb-5">
                  {[1, 2, 3].map(s => (
                    <Star
                      key={s}
                      size={32}
                      className={result.stars >= s ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700'}
                    />
                  ))}
                </div>

                {/* Rewards */}
                <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
                  {[
                    { label: 'Credits', value: result.rewardsAwarded?.credits, color: 'text-yellow-400' },
                    { label: 'Energy Cores', value: result.rewardsAwarded?.energyCores, color: 'text-neon-cyan', icon: <Zap size={12} /> },
                    { label: 'XP', value: result.rewardsAwarded?.xp, color: 'text-emerald-400' },
                    { label: 'VELoop Coins', value: result.rewardsAwarded?.veloopCoins, color: 'text-neon-purple', icon: <Shield size={12} /> }
                  ].map(r => r.value > 0 && (
                    <div key={r.label} className="glass-card rounded-lg p-3 border border-slate-700">
                      <div className={`flex items-center justify-center gap-1 font-bold text-base ${r.color}`}>
                        {r.icon}+{r.value}
                      </div>
                      <div className="text-slate-500 text-xs">{r.label}</div>
                    </div>
                  ))}
                </div>

                {result.levelUp && (
                  <div className="glass-card rounded-lg p-3 border border-neon-gold/50 mb-5 text-neon-gold font-orbitron font-bold">
                    ⬆ LEVEL UP! Now Rank {result.newLevel}
                  </div>
                )}
              </>
            )}

            <div className="flex gap-3">
              <button onClick={() => navigate('/missions')} className="flex-1 py-2.5 rounded-lg glass-card border border-slate-600 text-slate-400 hover:text-white text-sm transition-all">
                Missions
              </button>
              <button
                onClick={() => { setPhase('briefing'); setSession(null); setResult(null); }}
                className="flex-1 py-2.5 rounded-lg font-orbitron font-bold text-sm bg-gradient-to-r from-cyan-600 to-blue-600 text-white transition-all"
              >
                PLAY AGAIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Defeat Screen */}
      {phase === 'defeat' && (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="glass-panel rounded-2xl p-8 max-w-md w-full border border-red-500/40 text-center">
            <div className="text-4xl mb-2">💀</div>
            <h2 className="font-orbitron text-2xl font-bold text-red-400 mb-1">HULL BREACHED</h2>
            <p className="text-slate-400 text-sm mb-6">{mission.title} — Mission Failed</p>
            <div className="flex gap-3">
              <button onClick={() => navigate('/missions')} className="flex-1 py-2.5 rounded-lg glass-card border border-slate-600 text-slate-400 hover:text-white text-sm transition-all">
                Missions
              </button>
              <button
                onClick={() => { setPhase('briefing'); setSession(null); setResult(null); }}
                className="flex-1 py-2.5 rounded-lg font-orbitron font-bold text-sm bg-gradient-to-r from-red-700 to-red-600 text-white"
              >
                TRY AGAIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePage;
