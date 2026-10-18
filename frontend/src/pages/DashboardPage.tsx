import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import StarBackground from '../components/StarBackground';
import {
  Zap, Shield, Star, Trophy, Gift, Map, Rocket,
  Activity, Target, TrendingUp, CheckCircle, Clock, Award
} from 'lucide-react';

interface DailyMission {
  title: string;
  description: string;
  type: string;
  target: number;
  current: number;
  isClaimed: boolean;
  reward: { credits: number; xp: number; veloopCoins: number };
}

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
          api.getStreak(),
          api.listEvents()
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
      showToast(`Day ${res.currentStreak} bonus claimed! +${res.reward.credits} Credits`, 'success');
      setStreak((prev: any) => ({ ...prev, claimedToday: true }));
      await refreshWallet();
    } catch (err: any) {
      showToast(err.message, 'info');
    } finally {
      setClaimingDaily(false);
    }
  };

  if (!profile || !wallet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-neon-cyan font-orbitron animate-pulse">LOADING PILOT DATA...</div>
      </div>
    );
  }

  const currentXP = wallet.xp || 0;
  const xpNeeded = XP_PER_LEVEL(profile.level);
  const xpProgress = Math.min(100, (currentXP / Math.max(xpNeeded, 1)) * 100);
  const completedCount = progress?.completedMissions?.length || 0;

  return (
    <div className="relative min-h-screen pt-16 pb-8 px-4">
      <StarBackground />

      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        {/* Hero Profile Card */}
        <div className="glass-panel-glow rounded-2xl p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold
              bg-gradient-to-br from-cyan-600/40 to-blue-700/40 border-2 border-cyan-500/50 flex-shrink-0">
              {(profile.displayName || user?.username || 'P')[0].toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-orbitron text-xl font-bold text-white">{profile.displayName}</h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-neon-cyan border border-cyan-500/30">
                  LVL {profile.level}
                </span>
                {user?.role === 'admin' && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-sm mt-1">
                Active Ship: <span className="text-neon-cyan capitalize">{profile.equippedShipId?.replace('ship_', '') || 'Interceptor'}</span>
                {' '}· Sector {profile.highestSector}/5
              </p>

              {/* XP Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>XP Progress to Level {profile.level + 1}</span>
                  <span>{currentXP} / {xpNeeded}</span>
                </div>
                <div className="h-2 bg-space-800 rounded-full overflow-hidden border border-cyan-500/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-blue-500 transition-all duration-500"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 flex-shrink-0">
              <Link
                to="/missions"
                className="px-5 py-2.5 rounded-lg font-orbitron font-bold text-xs uppercase tracking-wider
                  bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500
                  text-white transition-all hover:shadow-neon-cyan"
              >
                ▶ LAUNCH MISSION
              </Link>
            </div>
          </div>
        </div>

        {/* Currency Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Credits', value: wallet.credits, color: 'text-neon-gold', icon: '¢', border: 'border-yellow-500/30' },
            { label: 'Energy Cores', value: wallet.energyCores, color: 'text-neon-cyan', icon: <Zap size={14} />, border: 'border-cyan-500/30' },
            { label: 'VELoop Coins', value: wallet.veloopCoins, color: 'text-neon-purple', icon: <Shield size={14} />, border: 'border-purple-500/30' },
            { label: 'XP', value: currentXP, color: 'text-neon-green', icon: <TrendingUp size={14} />, border: 'border-emerald-500/30' }
          ].map(c => (
            <div key={c.label} className={`glass-card rounded-xl p-4 border ${c.border}`}>
              <div className={`flex items-center gap-1.5 ${c.color} text-xs font-semibold mb-1`}>
                {c.icon} {c.label}
              </div>
              <div className="font-orbitron text-xl font-bold text-white">
                {(c.value || 0).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid: Stats + Daily Streak + Events */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats */}
          <div className="glass-card rounded-2xl p-5 border border-cyan-500/15">
            <h2 className="font-orbitron text-sm font-bold text-neon-cyan mb-4 flex items-center gap-2">
              <Activity size={15} /> COMBAT STATS
            </h2>
            <div className="space-y-3">
              {[
                { label: 'Missions Completed', value: completedCount, icon: <CheckCircle size={13} className="text-emerald-400" /> },
                { label: 'Enemies Destroyed', value: (profile.stats?.enemiesKilled || 0).toLocaleString(), icon: <Target size={13} className="text-red-400" /> },
                { label: 'Bosses Defeated', value: profile.stats?.bossesDefeated || 0, icon: <Award size={13} className="text-yellow-400" /> },
                { label: 'Total Score', value: (profile.totalScore || 0).toLocaleString(), icon: <Trophy size={13} className="text-neon-cyan" /> },
                { label: 'Flight Time', value: `${Math.round((profile.stats?.playTimeSeconds || 0) / 60)}m`, icon: <Clock size={13} className="text-slate-400" /> }
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400 text-xs">{s.icon} {s.label}</div>
                  <div className="text-white font-semibold text-sm">{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Login Streak */}
          <div className="glass-card rounded-2xl p-5 border border-yellow-500/15">
            <h2 className="font-orbitron text-sm font-bold text-neon-gold mb-4 flex items-center gap-2">
              <Gift size={15} /> DAILY STREAK
            </h2>
            {streak ? (
              <div>
                <div className="text-center mb-4">
                  <div className="font-orbitron text-3xl font-bold text-neon-gold">{streak.currentStreak}</div>
                  <div className="text-slate-400 text-xs">DAY STREAK</div>
                </div>

                {/* Day tiles */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {streak.streakRewards?.map((r: any) => (
                    <div
                      key={r.day}
                      className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold
                        ${r.day <= streak.currentStreak ? 'bg-yellow-500/30 border border-yellow-500/50 text-yellow-300' : 'bg-space-800 border border-slate-700 text-slate-600'}`}
                    >
                      {r.day}
                    </div>
                  ))}
                </div>

                <button
                  onClick={claimDaily}
                  disabled={streak.claimedToday || claimingDaily}
                  className={`w-full py-2.5 rounded-lg font-orbitron font-bold text-xs uppercase tracking-wider transition-all
                    ${streak.claimedToday
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white hover:shadow-neon-gold'}`}
                >
                  {streak.claimedToday ? '✓ CLAIMED TODAY' : claimingDaily ? 'CLAIMING...' : 'CLAIM DAILY BONUS'}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-24 text-slate-500 text-xs animate-pulse">Loading streak...</div>
            )}
          </div>

          {/* Active Events */}
          <div className="glass-card rounded-2xl p-5 border border-purple-500/15">
            <h2 className="font-orbitron text-sm font-bold text-neon-purple mb-4 flex items-center gap-2">
              <Star size={15} /> ACTIVE EVENTS
            </h2>
            {events.length > 0 ? (
              <div className="space-y-3">
                {events.map((evt: any) => {
                  const isActive = new Date(evt.startDate) <= new Date() && new Date(evt.endDate) >= new Date();
                  const endDate = new Date(evt.endDate);
                  const daysLeft = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 86400));
                  return (
                    <div key={evt.eventId} className={`rounded-xl p-4 border ${isActive ? 'border-purple-500/40 bg-purple-500/10' : 'border-slate-700 bg-slate-800/30 opacity-50'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">{evt.bannerTag}</span>
                        {isActive && (
                          <span className="text-xs text-emerald-400 font-semibold">{daysLeft}d left</span>
                        )}
                      </div>
                      <p className="text-white text-sm font-semibold">{evt.title}</p>
                      <p className="text-slate-400 text-xs mt-1">{evt.description}</p>
                      <div className="mt-2 text-xs font-bold text-neon-purple">×{evt.rewardMultiplier} {evt.bonusCurrency?.toUpperCase()}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                <Star className="mx-auto mb-2 opacity-30" size={28} />
                No active events right now. Check back soon!
              </div>
            )}
          </div>
        </div>

        {/* Quick Nav Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/missions', icon: <Map size={20} />, label: 'Missions', desc: `${completedCount}/50 done`, color: 'text-neon-cyan' },
            { to: '/hangar', icon: <Rocket size={20} />, label: 'Ship Hangar', desc: '5 ship classes', color: 'text-blue-400' },
            { to: '/leaderboard', icon: <Trophy size={20} />, label: 'Leaderboard', desc: 'Global rankings', color: 'text-neon-gold' },
            { to: '/wallet', icon: <Gift size={20} />, label: 'Rewards', desc: 'Claim bonuses', color: 'text-neon-purple' }
          ].map(card => (
            <Link
              key={card.to}
              to={card.to}
              className="glass-card rounded-xl p-4 border border-transparent hover:border-cyan-500/30 transition-all group"
            >
              <div className={`${card.color} mb-2 group-hover:scale-110 transition-transform`}>{card.icon}</div>
              <div className="text-white text-sm font-semibold">{card.label}</div>
              <div className="text-slate-500 text-xs">{card.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
