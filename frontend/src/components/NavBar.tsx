import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import {
  Crosshair, LayoutDashboard, Rocket, Map, Trophy, Star,
  Gift, Settings, Volume2, VolumeX, LogOut, Zap, Shield
} from 'lucide-react';

const NavBar: React.FC = () => {
  const { user, wallet, profile, logout } = useAuth();
  const { isMuted, toggleMute } = useAudio();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200
    ${isActive
      ? 'bg-cyan-500/20 text-neon-cyan border border-cyan-500/40 shadow-neon-cyan'
      : 'text-slate-400 hover:text-neon-cyan hover:bg-cyan-500/10 border border-transparent'}`;

  if (!user) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-cyan-500/20 h-14">
      <div className="flex items-center justify-between px-4 h-full max-w-screen-2xl mx-auto">
        {/* Logo */}
        <NavLink to="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center group-hover:border-cyan-400 transition-colors">
            <Crosshair size={16} className="text-neon-cyan" />
          </div>
          <span className="font-orbitron font-bold text-sm text-glow-cyan text-neon-cyan hidden md:block">
            S.S.O.
          </span>
        </NavLink>

        {/* Nav Links */}
        <div className="flex items-center gap-1 overflow-x-auto">
          <NavLink to="/dashboard" className={navLinkClass}>
            <LayoutDashboard size={13} /> <span className="hidden lg:block">Dashboard</span>
          </NavLink>
          <NavLink to="/missions" className={navLinkClass}>
            <Map size={13} /> <span className="hidden lg:block">Missions</span>
          </NavLink>
          <NavLink to="/hangar" className={navLinkClass}>
            <Rocket size={13} /> <span className="hidden lg:block">Hangar</span>
          </NavLink>
          <NavLink to="/upgrades" className={navLinkClass}>
            <Zap size={13} /> <span className="hidden lg:block">Upgrades</span>
          </NavLink>
          <NavLink to="/leaderboard" className={navLinkClass}>
            <Trophy size={13} /> <span className="hidden lg:block">Rankings</span>
          </NavLink>
          <NavLink to="/achievements" className={navLinkClass}>
            <Star size={13} /> <span className="hidden lg:block">Achievements</span>
          </NavLink>
          <NavLink to="/wallet" className={navLinkClass}>
            <Gift size={13} /> <span className="hidden lg:block">Rewards</span>
          </NavLink>
        </div>

        {/* Right side: wallet + controls */}
        <div className="flex items-center gap-3">
          {wallet && (
            <div className="hidden md:flex items-center gap-3 text-xs font-rajdhani font-semibold">
              <div className="flex items-center gap-1 text-neon-gold" title="Credits">
                <span className="text-slate-500">¢</span>
                <span>{wallet.credits?.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 text-neon-cyan" title="Energy Cores">
                <Zap size={11} />
                <span>{wallet.energyCores}</span>
              </div>
              <div className="flex items-center gap-1 text-neon-purple" title="VELoop Coins">
                <Shield size={11} />
                <span>{wallet.veloopCoins}</span>
              </div>
            </div>
          )}

          <button onClick={toggleMute} className="p-2 text-slate-400 hover:text-neon-cyan transition-colors" title="Toggle Sound">
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          <NavLink to="/settings" className="p-2 text-slate-400 hover:text-neon-cyan transition-colors">
            <Settings size={15} />
          </NavLink>

          <div className="text-xs text-slate-500 hidden lg:block truncate max-w-[80px]" title={user.username}>
            {profile?.displayName || user.username}
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-slate-500 hover:text-neon-red transition-colors"
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
