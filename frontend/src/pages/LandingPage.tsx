import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import StarBackground from '../components/StarBackground'

const features = [
  { icon: '🚀', title: 'Five Ship Classes', desc: 'Interceptor, Guardian, Destroyer, Phantom & Nova — each with unique abilities.' },
  { icon: '⚔️', title: '50 Missions', desc: 'Five sectors of escalating combat. Boss encounters at every 10th mission.' },
  { icon: '🏆', title: 'Live Leaderboard', desc: 'Server-validated scores. No cheating — rankings you can trust.' },
  { icon: '💎', title: 'VELoop Rewards', desc: 'Earn VELoop Reward Coins for gameplay. Separate from standard credits.' },
  { icon: '🛡️', title: '8 Power-Ups', desc: 'Shields, homing missiles, EMP blasts, rapid fire and more.' },
  { icon: '🎯', title: 'Achievements', desc: 'Unlock badges, claim daily missions, and maintain login streaks.' },
]

const LandingPage: React.FC = () => {
  const navigate = useNavigate()
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    // floating animation on title
    const el = titleRef.current
    if (!el) return
    let t = 0
    const id = setInterval(() => {
      t += 0.05
      el.style.transform = `translateY(${Math.sin(t) * 6}px)`
    }, 16)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-space-dark">
      <StarBackground />

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {/* Logo */}
        <div className="mb-6 w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600
                        flex items-center justify-center text-5xl shadow-lg shadow-cyan-500/40 animate-pulse-slow">
          🛸
        </div>

        <h1 ref={titleRef}
          className="text-5xl md:text-7xl font-black tracking-widest uppercase
                     bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent
                     drop-shadow-[0_0_30px_rgba(0,255,255,0.5)] transition-transform">
          Space Shooter
        </h1>
        <h2 className="mt-2 text-xl md:text-3xl font-bold tracking-[0.4em] text-blue-300 uppercase">
          Odyssey
        </h2>
        <p className="mt-6 max-w-xl text-gray-300 text-base md:text-lg leading-relaxed">
          Command your spacecraft through five dangerous sectors. Destroy enemy fleets,
          survive boss encounters, collect power-ups, and earn VELoop Rewards.
        </p>

        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => navigate('/login')}
            className="btn-primary px-8 py-3 text-lg font-bold tracking-widest uppercase rounded-lg
                       bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500
                       text-white shadow-lg shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95">
            ▶ Play Now
          </button>
          <button
            onClick={() => document.getElementById('how-to-play')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-3 text-lg font-bold tracking-widest uppercase rounded-lg border border-cyan-500/50
                       text-cyan-300 hover:bg-cyan-500/10 transition-all hover:scale-105 active:scale-95">
            How to Play
          </button>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-gray-500 text-sm animate-bounce">
          <span>↓</span>
          <span>scroll</span>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-20 px-4">
        <h3 className="text-center text-3xl font-black uppercase tracking-widest text-white mb-12">
          Core Features
        </h3>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title}
              className="glass-panel p-6 rounded-xl border border-white/10 hover:border-cyan-500/50
                         transition-all hover:shadow-lg hover:shadow-cyan-500/10 group">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{f.icon}</div>
              <h4 className="text-cyan-300 font-bold text-lg mb-1">{f.title}</h4>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How to Play */}
      <section id="how-to-play" className="relative z-10 py-20 px-4 bg-black/30">
        <h3 className="text-center text-3xl font-black uppercase tracking-widest text-white mb-12">
          How to Play
        </h3>
        <div className="max-w-3xl mx-auto space-y-4">
          {[
            ['🎮 Move', 'WASD or Arrow Keys to fly your ship in any direction.'],
            ['🔫 Fire', 'Space Bar to shoot your primary weapon.'],
            ['⚡ Special', 'Q key to activate your ship\'s unique special ability.'],
            ['🛡️ Survive', 'Dodge enemy fire, collect power-ups, and manage your shield.'],
            ['🏁 Complete', 'Destroy all waves or fulfill the mission objective to win.'],
            ['💰 Earn', 'Get Credits, XP, and VELoop Reward Coins for every mission.'],
          ].map(([title, desc]) => (
            <div key={title} className="glass-panel flex items-start gap-4 p-4 rounded-lg border border-white/10">
              <span className="text-xl w-8 text-center flex-shrink-0">{title.split(' ')[0]}</span>
              <div>
                <span className="text-cyan-300 font-bold">{title.substring(3)}: </span>
                <span className="text-gray-300 text-sm">{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="relative z-10 py-20 px-4 text-center">
        <h3 className="text-3xl font-black text-white mb-4">Ready to Begin?</h3>
        <p className="text-gray-400 mb-8">Create your pilot profile and launch into the galaxy.</p>
        <button
          onClick={() => navigate('/login')}
          className="px-10 py-4 text-lg font-bold tracking-widest uppercase rounded-lg
                     bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500
                     text-white shadow-xl shadow-violet-500/30 transition-all hover:scale-105 active:scale-95">
          Create Pilot Account
        </button>
      </section>
    </div>
  )
}

export default LandingPage
