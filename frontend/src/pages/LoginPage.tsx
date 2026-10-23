import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StarBackground from '../components/StarBackground';
import { Eye, EyeOff, Crosshair, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login, register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        if (username.trim().length < 3) {
          showToast('Pilot callsign must be at least 3 characters.', 'error');
          return;
        }
        await register(username, email, password);
        showToast('Pilot registration successful! Welcome to the fleet.', 'success');
      } else {
        await login(email, password);
        showToast('Authorization granted. Welcome back, Pilot.', 'success');
      }
      navigate('/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Authentication failed. Check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-4 bg-space-950 font-rajdhani">
      <StarBackground />

      <div className="relative z-10 w-full max-w-md">
        {/* Header Branding with Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-purple-600/30 border border-cyan-400/50 mb-4 shadow-neon-cyan animate-pulse-glow">
            <Crosshair className="text-neon-cyan animate-spin" size={30} style={{ animationDuration: '15s' }} />
          </div>
          <h1 className="font-orbitron text-2xl sm:text-3xl font-extrabold tracking-wider bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(0,246,255,0.4)]">
            SPACE SHOOTER
          </h1>
          <p className="font-orbitron text-sm text-cyan-400 tracking-[0.4em] uppercase font-bold mt-0.5">ODYSSEY</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 mt-2 rounded-full bg-slate-900/60 border border-slate-700/60 text-[11px] text-slate-400">
            <Sparkles size={11} className="text-purple-400" />
            <span>VELoop Rewards Platform Network</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="glass-panel-glow rounded-3xl p-7 sm:p-9 border border-cyan-500/30 relative overflow-hidden">
          {/* Subtle Top Accent Glow Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-500" />

          {/* Tab Switcher */}
          <div className="flex p-1 mb-6 rounded-xl bg-space-900/80 border border-slate-700/60">
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-2 rounded-lg text-xs font-orbitron font-bold uppercase tracking-wider transition-all duration-200
                ${!isRegister ? 'bg-gradient-to-r from-cyan-500/30 to-blue-600/30 text-neon-cyan shadow-sm border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Pilot Login
            </button>
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-2 rounded-lg text-xs font-orbitron font-bold uppercase tracking-wider transition-all duration-200
                ${isRegister ? 'bg-gradient-to-r from-cyan-500/30 to-blue-600/30 text-neon-cyan shadow-sm border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Enlist
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Pilot Callsign
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. StarCommander"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-space-900/80 border border-slate-700/80 focus:border-cyan-400 
                    focus:outline-none focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-500 text-sm transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Pilot Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pilot@veloop.io"
                required
                className="w-full px-4 py-3 rounded-xl bg-space-900/80 border border-slate-700/80 focus:border-cyan-400 
                  focus:outline-none focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-500 text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Access Key (Password)
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-space-900/80 border border-slate-700/80 focus:border-cyan-400 
                    focus:outline-none focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-500 text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-orbitron font-bold text-sm uppercase tracking-widest
                bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:brightness-110 text-slate-950
                shadow-neon-cyan transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>SYNCHRONIZING...</span>
              ) : (
                <>
                  <span>{isRegister ? 'CONFIRM ENLISTMENT' : 'AUTHORIZE ACCESS'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {!isRegister && (
            <div className="mt-5 p-3.5 rounded-xl bg-space-900/90 border border-cyan-500/25 flex items-start gap-2.5">
              <ShieldCheck size={18} className="text-cyan-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300">
                <span className="text-slate-400 block font-mono text-[10px] uppercase">Default Flight Clearance</span>
                <span className="text-cyan-300 font-mono">pilot@veloop.io</span> · <span className="text-slate-400 font-mono">Password123!</span>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-slate-500 text-xs mt-6 tracking-wider">
          VELoop Rewards Platform · Space Shooter Odyssey
        </p>
      </div>
    </div>
  );
};

export default LoginPage;