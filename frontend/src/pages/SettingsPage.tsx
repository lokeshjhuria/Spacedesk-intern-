import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAudio } from '../context/AudioContext'
import { useToast } from '../context/ToastContext'
import NavBar from '../components/NavBar'
import StarBackground from '../components/StarBackground'

const SettingsPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { isMuted, toggleMute, volume, setVolume } = useAudio()
  const { addToast } = useToast()
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [graphics, setGraphics] = useState<'low' | 'medium' | 'high'>('high')
  const [showParticles, setShowParticles] = useState(true)
  const [screenShake, setScreenShake] = useState(true)
  const [controls, setControls] = useState<'wasd' | 'arrows'>('wasd')

  const handleLogout = () => {
    if (!confirmLogout) { setConfirmLogout(true); return }
    logout()
    navigate('/')
    addToast('Logged out. See you, pilot! 👋', 'info')
  }

  const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void; label: string; desc?: string }> = ({
    value, onChange, label, desc
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div>
        <div className="text-white font-medium">{label}</div>
        {desc && <div className="text-gray-500 text-xs mt-0.5">{desc}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-all ${value ? 'bg-cyan-500' : 'bg-gray-700'}`}>
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${value ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-space-dark relative">
      <StarBackground />
      <NavBar />
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-24">
        <h1 className="text-4xl font-black uppercase tracking-widest text-white mb-2">
          ⚙️ <span className="text-cyan-400">Settings</span>
        </h1>
        <p className="text-gray-400 mb-8">Configure audio, graphics, controls, and account preferences.</p>

        <div className="space-y-6">
          {/* Audio */}
          <div className="glass-panel p-6 rounded-xl border border-white/10">
            <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">🔊 Audio</h2>
            <Toggle
              value={!isMuted}
              onChange={() => toggleMute()}
              label="Sound Effects"
              desc="Game sounds, explosions, and weapon fire" />
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="text-white font-medium">Master Volume</div>
                <div className="text-gray-500 text-xs">Affects all game audio</div>
              </div>
              <div className="flex items-center gap-3 w-40">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={e => setVolume(parseFloat(e.target.value))}
                  className="flex-1 accent-cyan-500"
                  disabled={isMuted} />
                <span className="text-cyan-400 text-sm w-10 text-right">{Math.round(volume * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Graphics */}
          <div className="glass-panel p-6 rounded-xl border border-white/10">
            <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">🖥️ Graphics</h2>
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <div>
                <div className="text-white font-medium">Quality Preset</div>
                <div className="text-gray-500 text-xs">Affects game rendering performance</div>
              </div>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map(g => (
                  <button
                    key={g}
                    onClick={() => setGraphics(g)}
                    className={`px-3 py-1 rounded text-xs font-bold capitalize transition-all ${
                      graphics === g ? 'bg-cyan-500 text-black' : 'border border-white/20 text-gray-400'
                    }`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <Toggle
              value={showParticles}
              onChange={setShowParticles}
              label="Particle Effects"
              desc="Explosions, engine trails, and power-up effects" />
            <Toggle
              value={screenShake}
              onChange={setScreenShake}
              label="Screen Shake"
              desc="Camera shake on hit or explosion" />
          </div>

          {/* Controls */}
          <div className="glass-panel p-6 rounded-xl border border-white/10">
            <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">🎮 Controls</h2>
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <div>
                <div className="text-white font-medium">Movement Keys</div>
                <div className="text-gray-500 text-xs">Choose your preferred movement scheme</div>
              </div>
              <div className="flex gap-2">
                {(['wasd', 'arrows'] as const).map(c => (
                  <button
                    key={c}
                    onClick={() => setControls(c)}
                    className={`px-3 py-1 rounded text-xs font-bold uppercase transition-all ${
                      controls === c ? 'bg-cyan-500 text-black' : 'border border-white/20 text-gray-400'
                    }`}>
                    {c === 'wasd' ? 'WASD' : '↑↓←→'}
                  </button>
                ))}
              </div>
            </div>
            <div className="py-3 text-sm text-gray-400 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['Move', controls === 'wasd' ? 'W A S D' : '↑ ↓ ← →'],
                  ['Fire', 'Space Bar'],
                  ['Special Ability', 'Q'],
                  ['Pause', 'Escape'],
                ].map(([action, key]) => (
                  <div key={action} className="flex justify-between bg-black/20 px-3 py-2 rounded-lg">
                    <span className="text-gray-400">{action}</span>
                    <span className="font-mono text-cyan-400 text-xs">{key}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Account */}
          <div className="glass-panel p-6 rounded-xl border border-white/10">
            <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">👤 Account</h2>
            <div className="space-y-2 mb-6 text-sm">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-gray-400">Username</span>
                <span className="text-white font-mono">{user?.username}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-gray-400">Email</span>
                <span className="text-white font-mono">{user?.email}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-400">Role</span>
                <span className={`font-bold capitalize px-2 py-0.5 rounded text-xs ${
                  user?.role === 'admin' ? 'bg-violet-500/20 text-violet-400' : 'bg-cyan-500/20 text-cyan-400'
                }`}>{user?.role}</span>
              </div>
            </div>

            {confirmLogout ? (
              <div className="space-y-3">
                <p className="text-yellow-400 text-sm text-center">Are you sure you want to log out?</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleLogout}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-all">
                    Yes, Log Out
                  </button>
                  <button
                    onClick={() => setConfirmLogout(false)}
                    className="flex-1 py-2 border border-white/20 text-gray-400 hover:border-white/40 font-bold rounded-lg transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full py-3 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-lg font-bold transition-all">
                🚪 Log Out
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
