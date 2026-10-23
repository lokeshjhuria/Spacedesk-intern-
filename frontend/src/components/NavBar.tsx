import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import {
  Crosshair, LayoutDashboard, Rocket, Map, Trophy, Star,
  Gift, Settings, Volume2, VolumeX, LogOut, Zap, Shield, Sparkles
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
    `relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 group
    ${isActive
      ? 'bg-gradient-to-r from-cyan-500/25 to-blue-600/20 text-neon-cyan border border-cyan-400/50 shadow-neon-cyan'
      : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/40 border border-transparent hover:border-slate-700/50'}`;

  if (!user) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-cyan-500/25 h-16 transition-all duration-300">
      <div className="flex items-center justify-between px-4 sm:px-6 h-full max-w-screen-2xl mx-auto">
        {/* Brand / Logo with Glow Animation */}
        <NavLink to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/30 via-blue-600/20 to-purple-600/30 border border-cyan-400/60 flex items-center justify-center shadow-neon-cyan transition-transform duration-300 group-hover:scale-105 group-hover:border-cyan-300">
            <Crosshair size={18} className="text-neon-cyan animate-pulse-glow" />
            <div className="absolute inset-0 rounded-xl bg-cyan-400/20 blur-md -z-10 group-hover:opacity-100 opacity-60 transition-opacity" />
          </div>
          <div className="flex flex-col">
            <span className="font-orbitron font-extrabold text-sm tracking-wider bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent group-hover:brightness-125 transition-all">
              ODYSSEY
            </span>
            <span className="text-[9px] tracking-widest text-cyan-400/70 font-mono -mt-0.5">VELOOP FLEET</span>
          </div>
        </NavLink>

        {/* Nav Links */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
          <NavLink to="/dashboard" className={navLinkClass}>
            <LayoutDashboard size={14} className="group-hover:scale-110 transition-transform" /> 
            <span className="hidden lg:block font-rajdhani">Dashboard</span>
          </NavLink>
          <NavLink to="/missions" className={navLinkClass}>
            <Map size={14} className="group-hover:scale-110 transition-transform" /> 
            <span className="hidden lg:block font-rajdhani">Missions</span>
          </NavLink>
          <NavLink to="/hangar" className={navLinkClass}>
            <Rocket size={14} className="group-hover:scale-110 transition-transform" /> 
            <span className="hidden lg:block font-rajdhani">Hangar</span>
          </NavLink>
          <NavLink to="/upgrades" className={navLinkClass}>
            <Zap size={14} className="group-hover:scale-110 transition-transform" /> 
            <span className="hidden lg:block font-rajdhani">Upgrades</span>
          </NavLink>
          <NavLink to="/leaderboard" className={navLinkClass}>
            <Trophy size={14} className="group-hover:scale-110 transition-transform" /> 
            <span className="hidden lg:block font-rajdhani">Rankings</span>
          </NavLink>
          <NavLink to="/achievements" className={navLinkClass}>
            <Star size={14} className="group-hover:scale-110 transition-transform" /> 
            <span className="hidden lg:block font-rajdhani">Achievements</span>
          </NavLink>
          <NavLink to="/wallet" className={navLinkClass}>
            <Gift size={14} className="group-hover:scale-110 transition-transform" /> 
            <span className="hidden lg:block font-rajdhani">Rewards</span>
          </NavLink>
        </div>

        {/* Right side: Balances Pill & Controls */}
        <div className="flex items-center gap-3">
          {wallet && (
            <div className="hidden md:flex items-center gap-3.5 px-3.5 py-1.5 rounded-xl bg-space-900/80 border border-slate-700/60 shadow-inner font-rajdhani font-semibold text-xs">
              <div className="flex items-center gap-1.5 text-amber-300" title="Credits">
                <span className="w-4 h-4 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-[10px] font-bold">¢</span>
                <span className="font-mono">{wallet.credits?.toLocaleString()}</span>
              </div>
              <div className="h-3 w-[1px] bg-slate-700" />
              <div className="flex items-center gap-1.5 text-cyan-300" title="Energy Cores">
                <Zap size={13} className="text-cyan-400 animate-pulse" />
                <span className="font-mono">{wallet.energyCores}</span>
              </div>
              <div className="h-3 w-[1px] bg-slate-700" />
              <div className="flex items-center gap-1.5 text-purple-300" title="VELoop Coins">
                <Sparkles size={13} className="text-purple-400" />
                <span className="font-mono">{wallet.veloopCoins}</span>
              </div>
            </div>
          )}

          {/* Audio toggle button */}
          <button 
            onClick={toggleMute} 
            className="p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/30 transition-all"
            title="Toggle Sound Effects"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} className="text-cyan-400" />}
          </button>

          {/* Settings */}
          <NavLink 
            to="/settings" 
            className="p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/30 transition-all"
            title="Settings"
          >
            <Settings size={16} />
          </NavLink>

          {/* Pilot callsign */}
          <div className="hidden xl:flex items-center gap-2 pl-1 border-l border-slate-800">
            <span className="text-xs font-semibold text-slate-300 max-w-[100px] truncate" title={user.username}>
              {profile?.displayName || user.username}
            </span>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;