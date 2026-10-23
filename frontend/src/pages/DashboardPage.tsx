import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import StarBackground from '../components/StarBackground';
import NavBar from '../components/NavBar';
import {
  Zap, Shield, Star, Trophy, Gift, Map, Rocket,
  Activity, Target, TrendingUp, CheckCircle, Clock, Award, Play, Sparkles, ChevronRight
} from 'lucide-react';

const XP_PER_LEVEL = (level: number) => level * level * 100;

const DashboardPage: React.FC = () => {
  const { user, profile, wallet, progress, refreshWallet } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [streak, setStreak] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingDaily, setClaimingDaily] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const [streakData, eventsData] = await Promise.all([
          api.getStreak().catch(() => ({ streak: null })),
          api.listEvents().catch(() => ({ events: [] }))
        ]);
        setStreak(streakData.streak);
        setEvents(eventsData.events || []);
      } catch (e) {
        console.error('Dashboard load error:', e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const claimDaily = async () => {
    setClaimingDaily(true);
    try {
      const res = await api.claimDaily();
      showToast(`Day ${res.currentStreak || 1} bonus claimed! +${res.reward?.credits || 100} Credits`, 'success');
      setStreak((prev: any) => ({ ...prev, claimedToday: true, currentStreak: (prev?.currentStreak || 0) + 1 }));
      await refreshWallet();
    } catch (err: any) {
      showToast(err.message || 'Streak already claimed for today', 'info');
    } finally {
      setClaimingDaily(false);
    }
  };

  if (!profile || !wallet) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-space-950">
        <StarBackground />
        <div className="relative z-10 text-center">
          <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto mb-4" />
          <div className="text-neon-cyan font-orbitron text-sm tracking-widest uppercase animate-pulse">
            CALIBRATING PILOT TELEMETRY...
          </div>
        </div>
      </div>
    );
  }

  const currentXP = wallet.xp || 0;
  const xpNeeded = XP_PER_LEVEL(profile.level);
  const xpProgress = Math.min(100, (currentXP / Math.max(xpNeeded, 1)) * 100);
  const completedCount = progress?.completedMissions?.length || 0;

  return (
    <div className="relative min-h-screen pt-20 pb-12 px-4 sm:px-6 bg-space-950 font-rajdhani text-slate-100">
      <StarBackground />
      <NavBar />

      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        {/* Hero Profile Card */}
        <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 border border-cyan-500/35 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
            {/* Callsign Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black font-orbitron
                bg-gradient-to-br from-cyan-500/30 via-blue-600/30 to-purple-600/40 border-2 border-cyan-400/60 shadow-neon-cyan flex-shrink-0">
                {(profile.displayName || user?.username || 'P')[0].toUpperCase()}
              </div>
              <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-black font-mono uppercase">
                LVL {profile.level}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-orbitron text-2xl sm:text-3xl font-black text-white tracking-wide">
                  {profile.displayName || user?.username}
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                  SECTOR {profile.highestSector}/5
                </span>
                {user?.role === 'admin' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-red-500/20 text-red-400 border border-red-500/40">
                    FLEET ADMIN
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-sm mt-1.5 flex items-center gap-2">
                <span>Commissioned Ship:</span>
                <span className="text-cyan-300 font-bold uppercase tracking-wider font-mono">
                  {profile.equippedShipId?.replace('ship_', '') || 'Interceptor'} Class
                </span>
              </p>

              {/* XP Progress Bar */}
              <div className="mt-3.5 max-w-xl">
                <div className="flex justify-between text-xs text-slate-400 font-mono mb-1.5">
                  <span className="text-cyan-400">XP Progress to Level {profile.level + 1}</span>
                  <span className="text-slate-300 font-bold">{currentXP.toLocaleString()} / {xpNeeded.toLocaleString()}</span>
                </div>
                <div className="h-2.5 bg-space-900 rounded-full overflow-hidden border border-slate-700/80 p-0.5 shadow-inner">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400 transition-all duration-700 shadow-neon-cyan"
                    style={{ width: `${Math.max(xpProgress, 4)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="flex-shrink-0 w-full md:w-auto">
              <Link
                to="/missions"
                className="w-full md:w-auto px-7 py-3.5 rounded-xl font-orbitron font-bold text-xs uppercase tracking-widest
                  bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:brightness-110 text-slate-950
                  shadow-neon-cyan transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5"
              >
                <Play size={16} className="fill-slate-950" />
                <span>LAUNCH MISSION</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Currency Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Credits', value: wallet.credits, color: 'text-amber-300', icon: '¢', border: 'border-amber-500/30', bg: 'from-amber-500/10 to-transparent' },
            { label: 'Energy Cores', value: wallet.energyCores, color: 'text-cyan-300', icon: <Zap size={16} className="text-cyan-400 animate-pulse" />, border: 'border-cyan-500/30', bg: 'from-cyan-500/10 to-transparent' },
            { label: 'VELoop Coins', value: wallet.veloopCoins, color: 'text-purple-300', icon: <Sparkles size={16} className="text-purple-400" />, border: 'border-purple-500/30', bg: 'from-purple-500/10 to-transparent' },
            { label: 'Total XP', value: currentXP, color: 'text-emerald-300', icon: <TrendingUp size={16} className="text-emerald-400" />, border: 'border-emerald-500/30', bg: 'from-emerald-500/10 to-transparent' }
          ].map(c => (
            <div key={c.label} className={`glass-card rounded-2xl p-4 sm:p-5 border ${c.border} bg-gradient-to-br ${c.bg}`}>
              <div className={`flex items-center gap-2 ${c.color} text-xs font-bold uppercase tracking-wider mb-1.5`}>
                {c.icon} <span>{c.label}</span>
              </div>
              <div className="font-orbitron text-xl sm:text-2xl font-black text-white tracking-wide">
                {(c.value || 0).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid: Stats + Daily Streak + Events */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats Card */}
          <div className="glass-card rounded-3xl p-6 border border-cyan-500/20">
            <h2 className="font-orbitron text-sm font-bold text-cyan-300 mb-5 flex items-center gap-2">
              <Activity size={16} className="text-cyan-400" /> 
              <span>COMBAT TELEMETRY</span>
            </h2>
            <div className="space-y-3.5">
              {[
                { label: 'Missions Completed', value: `${completedCount} / 50`, icon: <CheckCircle size={15} className="text-emerald-400" /> },
                { label: 'Hostiles Eliminated', value: (profile.stats?.enemiesKilled || 0).toLocaleString(), icon: <Target size={15} className="text-red-400" /> },
                { label: 'Capital Bosses Down', value: profile.stats?.bossesDefeated || 0, icon: <Award size={15} className="text-amber-400" /> },
                { label: 'Highest Mission Score', value: (profile.totalScore || 0).toLocaleString(), icon: <Trophy size={15} className="text-cyan-400" /> },
                { label: 'Combat Sortie Time', value: `${Math.round((profile.stats?.playTimeSeconds || 0) / 60)} min`, icon: <Clock size={15} className="text-slate-400" /> }
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between py-1 border-b border-slate-800/60 last:border-0">
                  <div className="flex items-center gap-2 text-slate-300 text-xs">{s.icon} <span>{s.label}</span></div>
                  <div className="text-white font-mono font-bold text-sm">{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Login Streak Card */}
          <div className="glass-card rounded-3xl p-6 border border-amber-500/20">
            <h2 className="font-orbitron text-sm font-bold text-amber-300 mb-5 flex items-center gap-2">
              <Gift size={16} className="text-amber-400" /> 
              <span>DAILY FLEET RATION</span>
            </h2>
            {streak ? (
              <div>
                <div className="text-center py-2 mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <div className="font-orbitron text-3xl font-black text-amber-300 tracking-wider">
                    {streak.currentStreak || 1}
                  </div>
                  <div className="text-amber-400/80 text-[11px] font-mono tracking-widest uppercase">CONSECUTIVE DAYS</div>
                </div>

                {/* Day tiles */}
                <div className="grid grid-cols-7 gap-1.5 mb-5">
                  {Array.from({ length: 7 }, (_, i) => i + 1).map((day) => {
                    const active = day <= (streak.currentStreak || 1);
                    return (
                      <div
                        key={day}
                        className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-mono font-bold transition-all
                          ${active 
                            ? 'bg-amber-400/20 border border-amber-400/60 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.25)]' 
                            : 'bg-space-900 border border-slate-800 text-slate-600'}`}
                      >
                        <span className="text-[10px] text-slate-400">D</span>
                        <span>{day}</span>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={claimDaily}
                  disabled={streak.claimedToday || claimingDaily}
                  className={`w-full py-3.5 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider transition-all duration-200
                    ${streak.claimedToday
                      ? 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 shadow-neon-gold hover:scale-[1.02] active:scale-[0.98]'}`}
                >
                  {streak.claimedToday ? '✓ RATIONS RECEIVED TODAY' : claimingDaily ? 'COMMUNICATING...' : 'CLAIM DAILY BONUS'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-44 text-slate-500 text-xs">
                <Gift className="mb-2 opacity-30 text-amber-400" size={32} />
                <span>Checking flight logs...</span>
              </div>
            )}
          </div>

          {/* Active Events Card */}
          <div className="glass-card rounded-3xl p-6 border border-purple-500/20">
            <h2 className="font-orbitron text-sm font-bold text-purple-300 mb-5 flex items-center gap-2">
              <Star size={16} className="text-purple-400" /> 
              <span>ACTIVE FLEET CAMPAIGNS</span>
            </h2>
            {events.length > 0 ? (
              <div className="space-y-3.5">
                {events.map((evt: any) => {
                  const isActive = new Date(evt.startDate) <= new Date() && new Date(evt.endDate) >= new Date();
                  const endDate = new Date(evt.endDate);
                  const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / (1000 * 86400)));
                  return (
                    <div 
                      key={evt.eventId || evt.name} 
                      className={`rounded-2xl p-4 border transition-all ${isActive ? 'border-purple-400/40 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'border-slate-800 bg-space-900 opacity-60'}`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold font-mono text-purple-300 uppercase tracking-wider bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-400/30">
                          {evt.bannerTag || 'SECTOR EVENT'}
                        </span>
                        {isActive && (
                          <span className="text-xs text-emerald-400 font-mono font-bold">{daysLeft}d left</span>
                        )}
                      </div>
                      <p className="text-white text-sm font-bold font-orbitron">{evt.title || evt.name}</p>
                      <p className="text-slate-400 text-xs mt-1 leading-relaxed">{evt.description}</p>
                      <div className="mt-2.5 text-xs font-bold font-mono text-cyan-300 flex items-center gap-1.5">
                        <Sparkles size={13} className="text-purple-400" />
                        <span>BONUS REWARDS MULTIPLIER ACTIVE</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                <Star className="mx-auto mb-2 opacity-30 text-purple-400" size={32} />
                No active fleet campaigns right now. Check back soon!
              </div>
            )}
          </div>
        </div>

        {/* Quick Route Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { to: '/missions', icon: <Map size={22} />, label: 'Sector Missions', desc: `${completedCount} of 50 Cleared`, color: 'text-cyan-400', border: 'hover:border-cyan-400/50' },
            { to: '/hangar', icon: <Rocket size={22} />, label: 'Ship Hangar', desc: '5 Combat Vessels', color: 'text-blue-400', border: 'hover:border-blue-400/50' },
            { to: '/leaderboard', icon: <Trophy size={22} />, label: 'Pilot Rankings', desc: 'Verified Scores', color: 'text-amber-400', border: 'hover:border-amber-400/50' },
            { to: '/wallet', icon: <Gift size={22} />, label: 'VELoop Vault', desc: 'Reward Currency', color: 'text-purple-400', border: 'hover:border-purple-400/50' }
          ].map(card => (
            <Link
              key={card.to}
              to={card.to}
              className={`glass-card rounded-2xl p-5 border border-slate-800 ${card.border} transition-all duration-300 group`}
            >
              <div className={`${card.color} mb-3 group-hover:scale-110 transition-transform`}>{card.icon}</div>
              <div className="text-white text-sm font-bold font-orbitron flex items-center justify-between">
                <span>{card.label}</span>
                <ChevronRight size={14} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              <div className="text-slate-400 text-xs mt-1 font-mono">{card.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;