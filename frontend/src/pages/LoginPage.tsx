import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StarBackground from '../components/StarBackground';
import { Eye, EyeOff, Crosshair } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center relative p-4">
      <StarBackground />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-cyan-500/60 mb-4 glass-panel-glow">
            <Crosshair className="text-neon-cyan" size={28} />
          </div>
          <h1 className="font-orbitron text-2xl font-bold text-glow-cyan text-neon-cyan tracking-widest">
            SPACE SHOOTER
          </h1>
          <p className="font-orbitron text-lg text-white/60 tracking-[0.35em]">ODYSSEY</p>
          <p className="text-slate-400 text-sm mt-2">VELoop Rewards Platform</p>
        </div>

        {/* Form Card */}
        <div className="glass-panel-glow rounded-2xl p-8">
          <div className="flex mb-6 rounded-lg overflow-hidden border border-cyan-500/20">
            <button
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-2.5 text-xs font-orbitron font-bold uppercase tracking-wider transition-all
                ${!isRegister ? 'bg-cyan-500/20 text-neon-cyan' : 'text-slate-500 hover:text-slate-300'}`}
            >
              PILOT LOGIN
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-2.5 text-xs font-orbitron font-bold uppercase tracking-wider transition-all
                ${isRegister ? 'bg-cyan-500/20 text-neon-cyan' : 'text-slate-500 hover:text-slate-300'}`}
            >
              ENLIST
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Pilot Callsign
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. StarCommander"
                  required
                  className="w-full px-4 py-3 rounded-lg glass-card border border-cyan-500/20 focus:border-cyan-500/60 
                    focus:outline-none text-white placeholder-slate-600 text-sm transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pilot@veloop.io"
                required
                className="w-full px-4 py-3 rounded-lg glass-card border border-cyan-500/20 focus:border-cyan-500/60 
                  focus:outline-none text-white placeholder-slate-600 text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  className="w-full px-4 py-3 pr-10 rounded-lg glass-card border border-cyan-500/20 focus:border-cyan-500/60 
                    focus:outline-none text-white placeholder-slate-600 text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-orbitron font-bold text-sm uppercase tracking-widest
                bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500
                text-white transition-all duration-200 hover:shadow-neon-cyan disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'PROCESSING...' : isRegister ? 'ENLIST NOW' : 'AUTHORIZE'}
            </button>
          </form>

          {!isRegister && (
            <div className="mt-4 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/15 text-center">
              <p className="text-xs text-slate-500">Demo account: <span className="text-neon-cyan">pilot@veloop.io</span> / <span className="text-slate-400">Password123!</span></p>
            </div>
          )}
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          VELoop Rewards Platform · Space Shooter Odyssey v1.0
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
