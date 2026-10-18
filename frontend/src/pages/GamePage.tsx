import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import GameCanvas from '../game/GameCanvas';
import { Pause, Play, RotateCcw, LogOut, Star, Zap, Shield, Trophy } from 'lucide-react';

const GamePage: React.FC = () => {
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate();
  const { profile, wallet, refreshWallet, refreshUserData } = useAuth();
  const { showToast } = useToast();

  const [phase, setPhase] = useState<'briefing' | 'playing' | 'paused' | 'victory' | 'defeat'>('briefing');
  const [mission, setMission] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [shipData, setShipData] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!missionId) return;
      try {
        const [missRes, invRes] = await Promise.all([api.getMission(missionId), api.getInventory()]);
        setMission(missRes.mission);

        const equippedId = profile?.equippedShipId || 'ship_interceptor';
        const shipDef = invRes.shipDefinitions?.find((s: any) => s.shipId === equippedId);
        if (shipDef) {
          setShipData({
            ...shipDef,
            equippedUpgrades: profile?.equippedUpgrades || {}
          });
        }
      } catch (err: any) {
        showToast(err.message || 'Failed to load mission', 'error');
        navigate('/missions');
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
      showToast(err.message || 'Failed to start mission', 'error');
    }
  };

  const handleVictory = useCallback(async (payload: any) => {
    setPhase('victory');
    try {
      const res = await api.completeMission(missionId!, payload);
      setResult(res);
      await refreshUserData();
      showToast(`Mission complete! +${res.rewardsAwarded?.credits} Credits earned!`, 'success');
    } catch (err: any) {
      showToast(`Mission complete! Reward processing: ${err.message}`, 'warning');
      setResult({ stars: 1, rewardsAwarded: { credits: 0, energyCores: 0, xp: 0, veloopCoins: 0 } });
    }
  }, [missionId]);

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
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="glass-panel-glow rounded-2xl p-8 max-w-xl w-full border border-cyan-500/30">
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
            <p className="text-slate-300 text-sm leading-relaxed mb-2">{mission.loreBrief}</p>
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
            <div className="flex flex-col gap-2 text-xs text-slate-500 mb-5">
              <div className="flex gap-2 flex-wrap">
                <span className="bg-space-800 rounded px-2 py-1">WASD / ↑↓←→ Move</span>
                <span className="bg-space-800 rounded px-2 py-1">SPACE Fire</span>
                <span className="bg-space-800 rounded px-2 py-1">Q Special Ability</span>
                <span className="bg-space-800 rounded px-2 py-1">ESC Pause</span>
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
