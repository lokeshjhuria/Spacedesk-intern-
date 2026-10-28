import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StarBackground from '../components/StarBackground';
import { Eye, EyeOff, Crosshair, ArrowRight, ShieldCheck, Sparkles, Wifi, WifiOff, AlertTriangle } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login, register, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [errorMsg, setErrorMsg] = useState('');

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Check server connectivity on mount
  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch('/api/health', { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
          const data = await res.json();
          setServerStatus(data.status === 'online' ? 'online' : 'offline');
        } else {
          setServerStatus('offline');
        }
      } catch {
        setServerStatus('offline');
      }
    };
    checkServer();
    // Re-check every 10 seconds if offline
    const interval = setInterval(() => {
      if (serverStatus === 'offline') checkServer();
    }, 10000);
    return () => clearInterval(interval);
  }, [serverStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (serverStatus === 'offline') {
      setErrorMsg('Server is offline. Please start the backend server first.');
      showToast('Backend server is not running! Start it with: cd backend && npm run dev', 'error');
      return;
    }

    if (isRegister && username.trim().length < 3) {
      setErrorMsg('Pilot callsign must be at least 3 characters.');
      showToast('Pilot callsign must be at least 3 characters.', 'error');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register(username.trim(), email.trim(), password);
        showToast('Pilot registration successful! Welcome to the fleet.', 'success');
      } else {
        await login(email.trim(), password);
        showToast('Authorization granted. Welcome back, Pilot.', 'success');
      }
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.message || 'Authentication failed. Check your credentials.';
      setErrorMsg(msg);
      showToast(msg, 'error');
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

        {/* Server Status Banner */}
        {serverStatus === 'offline' && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/40 flex items-center gap-2.5 animate-pulse">
            <WifiOff size={18} className="text-red-400 flex-shrink-0" />
            <div className="text-xs text-red-300">
              <span className="font-bold block">Server Offline</span>
              <span className="text-red-400/80">Start backend: <code className="text-red-300">cd backend && npm run dev</code></span>
            </div>
          </div>
        )}
        {serverStatus === 'checking' && (
          <div className="mb-4 p-3 rounded-xl bg-yellow-950/30 border border-yellow-500/30 flex items-center gap-2.5">
            <Wifi size={18} className="text-yellow-400 flex-shrink-0 animate-pulse" />
            <span className="text-xs text-yellow-300">Connecting to game server...</span>
          </div>
        )}
        {serverStatus === 'online' && (
          <div className="mb-4 p-2.5 rounded-xl bg-green-950/30 border border-green-500/25 flex items-center gap-2">
            <Wifi size={14} className="text-green-400 flex-shrink-0" />
            <span className="text-[11px] text-green-400 font-mono">Server Online — Ready to play</span>
          </div>
        )}

        {/* Form Card */}
        <div className="glass-panel-glow rounded-3xl p-7 sm:p-9 border border-cyan-500/30 relative overflow-hidden">
          {/* Subtle Top Accent Glow Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-500" />

          {/* Tab Switcher */}
          <div className="flex p-1 mb-6 rounded-xl bg-space-900/80 border border-slate-700/60">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setErrorMsg(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-orbitron font-bold uppercase tracking-wider transition-all duration-200
                ${!isRegister ? 'bg-gradient-to-r from-cyan-500/30 to-blue-600/30 text-neon-cyan shadow-sm border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Pilot Login
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setErrorMsg(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-orbitron font-bold uppercase tracking-wider transition-all duration-200
                ${isRegister ? 'bg-gradient-to-r from-cyan-500/30 to-blue-600/30 text-neon-cyan shadow-sm border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Enlist
            </button>
          </div>

          {/* Error Message Display */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-500/30 flex items-start gap-2">
              <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-red-300">{errorMsg}</span>
            </div>
          )}

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
                  minLength={3}
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
                  minLength={6}
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
              disabled={loading || serverStatus === 'checking'}
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
            <div 
              onClick={() => {
                setEmail('pilot@veloop.io');
                setPassword('Password123!');
                setErrorMsg('');
              }}
              className="mt-5 p-3.5 rounded-xl bg-space-900/90 border border-cyan-500/25 flex items-start gap-2.5 cursor-pointer hover:border-cyan-400 transition-all group"
              title="Click to auto-fill demo credentials"
            >
              <ShieldCheck size={18} className="text-cyan-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
              <div className="text-xs text-slate-300">
                <span className="text-slate-400 block font-mono text-[10px] uppercase">Default Clearance (Click to fill)</span>
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
