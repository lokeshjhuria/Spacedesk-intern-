import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import StarBackground from '../components/StarBackground'
import { Rocket, Shield, Trophy, Sparkles, Crosshair, Zap, ArrowRight, Play, Compass, Award } from 'lucide-react'

const features = [
  { icon: <Rocket className="text-cyan-400" size={28} />, title: 'Five Ship Classes', desc: 'Interceptor, Guardian, Destroyer, Phantom & Nova — each with distinct abilities & stats.' },
  { icon: <Crosshair className="text-purple-400" size={28} />, title: '50 Deep-Space Missions', desc: 'Five sectors of intense orbital combat with unique multi-phase Boss battles at every 10th mission.' },
  { icon: <Trophy className="text-amber-400" size={28} />, title: 'Server-Validated Rankings', desc: 'Cryptographically protected anti-cheat architecture. Leaderboard scores you can genuinely trust.' },
  { icon: <Sparkles className="text-fuchsia-400" size={28} />, title: 'VELoop Rewards Economy', desc: 'Separate platform-governed VELoop Coins, in-game Credits, Energy Cores & XP progression.' },
  { icon: <Zap className="text-teal-400" size={28} />, title: '8 Combat Power-Ups', desc: 'Kinetic shields, homing missiles, EMP shockwaves, overclocked rapid fire, and invulnerability.' },
  { icon: <Award className="text-blue-400" size={28} />, title: 'Missions & Achievements', desc: 'Daily tactical orders, persistent login streaks, milestone rewards and upgrade unlocks.' },
]

const LandingPage: React.FC = () => {
  const navigate = useNavigate()
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = titleRef.current
    if (!el) return
    let t = 0
    const id = setInterval(() => {
      t += 0.04
      el.style.transform = `translateY(${Math.sin(t) * 5}px)`
    }, 16)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-space-950 font-rajdhani text-slate-100">
      <StarBackground />

      {/* Top Banner Navigation */}
      <header className="relative z-20 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/30 to-purple-600/30 border border-cyan-400/50 flex items-center justify-center shadow-neon-cyan">
            <Crosshair className="text-neon-cyan" size={20} />
          </div>
          <div>
            <span className="font-orbitron font-extrabold text-base tracking-widest text-white">SPACE SHOOTER</span>
            <span className="block text-[10px] tracking-widest text-cyan-400 font-mono -mt-1">ODYSSEY • VELOOP</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white border border-slate-700/60 hover:border-cyan-400/40 bg-slate-900/60 backdrop-blur-md transition-all hover:scale-105"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-black bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:brightness-110 shadow-neon-cyan transition-all hover:scale-105"
          >
            Launch Fleet
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] px-4 text-center">
        {/* Glow Badge */}
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/40 bg-cyan-950/40 backdrop-blur-md shadow-neon-cyan animate-pulse-glow">
          <Sparkles size={14} className="text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="text-xs font-bold tracking-widest uppercase text-cyan-300">VELoop Rewards Platform Edition</span>
        </div>

        {/* Main Title */}
        <h1 
          ref={titleRef}
          className="text-5xl sm:text-7xl md:text-8xl font-black font-orbitron tracking-wider uppercase transition-transform"
        >
          <span className="block bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(255,255,255,0.2)]">
            SPACE SHOOTER
          </span>
          <span className="block mt-1 bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(0,246,255,0.4)]">
            ODYSSEY
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
          Pilot next-generation interceptors across five treacherous star sectors. 
          Defeat alien armadas, challenge colossal bosses, conquer physics-validated missions, and earn genuine 
          <span className="text-cyan-300 font-semibold"> VELoop Reward Coins</span>.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap gap-4 justify-center items-center">
          <button
            onClick={() => navigate('/login')}
            className="group relative px-9 py-4 rounded-xl text-base font-orbitron font-bold tracking-widest uppercase
                       bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 text-slate-950
                       shadow-[0_0_30px_rgba(0,246,255,0.4)] hover:shadow-[0_0_45px_rgba(0,246,255,0.6)]
                       transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-3"
          >
            <Play size={18} className="fill-slate-950" />
            <span>Engage Mission</span>
            <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
          </button>
          
          <button
            onClick={() => document.getElementById('how-to-play')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 rounded-xl text-base font-orbitron font-bold tracking-widest uppercase
                       border border-cyan-500/40 bg-space-900/60 hover:bg-cyan-500/10 hover:border-cyan-400 text-cyan-300
                       backdrop-blur-md shadow-glass transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Compass size={18} />
            <span>Flight Briefing</span>
          </button>
        </div>

        {/* Scroll Indicator */}
        <div className="mt-16 flex flex-col items-center gap-1.5 text-slate-500 text-xs font-mono tracking-widest uppercase animate-bounce">
          <span>Telemetry Details</span>
          <span className="text-cyan-400">↓</span>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-xs font-orbitron font-bold tracking-[0.3em] uppercase text-cyan-400 mb-2">Tactical Capabilities</h2>
          <h3 className="text-3xl sm:text-5xl font-extrabold font-orbitron uppercase text-white">
            Engineered For Combat
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div 
              key={f.title}
              className="glass-card p-7 rounded-2xl border border-slate-700/50 hover:border-cyan-400/50 group relative overflow-hidden"
            >
              <div className="w-14 h-14 rounded-xl bg-space-850/80 border border-slate-700/60 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:border-cyan-400/50 transition-all shadow-inner">
                {f.icon}
              </div>
              <h4 className="text-lg font-orbitron font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                {f.title}
              </h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                {f.desc}
              </p>
              <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-cyan-500/5 blur-2xl group-hover:bg-cyan-500/15 transition-colors pointer-events-none" />
            </div>
          ))}
        </div>
      </section>

      {/* How to Play Tactical Manual */}
      <section id="how-to-play" className="relative z-10 py-24 px-4 bg-space-900/60 border-y border-slate-800/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-xs font-orbitron font-bold tracking-[0.3em] uppercase text-cyan-400 mb-2">Standard Operating Procedures</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold font-orbitron uppercase text-white">
              Flight Control Protocol
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'W A S D / Arrows', action: 'Flight Thrusters', desc: 'Omnidirectional sub-light vector maneuvering across the combat viewport.' },
              { key: 'SPACE BAR', action: 'Primary Cannons', desc: 'Continuous pulse-laser fire with adaptive heat sinks.' },
              { key: 'Q KEY', action: 'Special Ability', desc: 'Overdrive system (Overclock, Aegis Dome, EMP Nova, Phase Shift).' },
              { key: 'ESCAPE', action: 'Tactical Pause', desc: 'Halts physics loop for situational assessment.' },
              { key: 'SHIELDS & CORES', action: 'Combat Salvage', desc: 'Collect floating wreckage and energy orbs to replenish vital systems.' },
              { key: 'STAR RATINGS', action: 'Mission Evaluation', desc: 'Earn 1 to 3 stars based on damage taken, kill count, and accuracy.' },
            ].map((item, idx) => (
              <div key={idx} className="glass-panel p-5 rounded-2xl flex items-start gap-4">
                <div className="px-3 py-2 rounded-xl bg-space-950 border border-cyan-500/30 font-mono text-cyan-300 text-xs font-bold shadow-neon-cyan flex-shrink-0">
                  {item.key}
                </div>
                <div>
                  <h5 className="font-orbitron text-sm font-bold text-white mb-1">{item.action}</h5>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Call to Action */}
      <section className="relative z-10 py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto glass-panel-glow p-10 sm:p-14 rounded-3xl border border-cyan-500/40 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-transparent pointer-events-none" />
          <h3 className="text-3xl sm:text-4xl font-black font-orbitron text-white mb-4">
            The Galaxy Awaits Your Command
          </h3>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto text-sm sm:text-base">
            Enroll your callsign into the VELoop Fleet registry and embark on your maiden orbital sortie.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-10 py-4 rounded-xl text-base font-orbitron font-bold tracking-widest uppercase
                       bg-gradient-to-r from-cyan-400 to-purple-500 text-slate-950 hover:brightness-110 shadow-neon-cyan transition-all hover:scale-105 active:scale-95"
          >
            Access Pilot Terminal
          </button>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
