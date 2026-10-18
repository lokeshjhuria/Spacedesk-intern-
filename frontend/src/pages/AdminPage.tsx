import React, { useEffect, useState } from 'react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import NavBar from '../components/NavBar'
import StarBackground from '../components/StarBackground'

interface Event {
  _id: string
  name: string
  description: string
  startDate: string
  endDate: string
  isActive: boolean
  rewards: { xp: number; credits: number; veloopCoins: number }
  type: string
}

interface AdminStats {
  totalPlayers: number
  totalMissions: number
  totalSessions: number
  recentActivity: Array<{ username: string; action: string; createdAt: string }>
}

const AdminPage: React.FC = () => {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [newEvent, setNewEvent] = useState({
    name: '', description: '', startDate: '', endDate: '',
    rewards: { xp: 100, credits: 500, veloopCoins: 10 },
    type: 'limited_time'
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user?.role !== 'admin') return
    loadData()
  }, [user])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsRes, eventsRes] = await Promise.all([
        api.getAdminStats().catch(() => ({ data: { stats: null } })),
        api.listEvents(),
      ])
      setStats(statsRes.data.stats)
      setEvents(eventsRes.data.events || [])
    } catch {
      addToast('Failed to load admin data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.createEvent(newEvent)
      addToast('Event created! 🎉', 'success')
      await loadData()
      setNewEvent({ name: '', description: '', startDate: '', endDate: '', rewards: { xp: 100, credits: 500, veloopCoins: 10 }, type: 'limited_time' })
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to create event', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (user?.role !== 'admin') return (
    <div className="min-h-screen bg-space-dark flex items-center justify-center">
      <StarBackground />
      <div className="z-10 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <div className="text-red-400 text-xl font-bold">Access Denied</div>
        <div className="text-gray-400 mt-2">Admin privileges required.</div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-space-dark relative">
      <StarBackground />
      <NavBar />
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-24">
        <h1 className="text-4xl font-black uppercase tracking-widest text-white mb-2">
          👑 <span className="text-violet-400">Admin Panel</span>
        </h1>
        <p className="text-gray-400 mb-8">Manage missions, events, and platform configuration.</p>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Players', value: stats.totalPlayers, icon: '👥', color: 'text-cyan-400' },
              { label: 'Total Missions', value: stats.totalMissions, icon: '🎯', color: 'text-yellow-400' },
              { label: 'Sessions', value: stats.totalSessions, icon: '🚀', color: 'text-green-400' },
              { label: 'Active Events', value: events.filter(e => e.isActive).length, icon: '🎉', color: 'text-violet-400' },
            ].map(s => (
              <div key={s.label} className="glass-panel p-4 rounded-xl border border-white/10 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-gray-500 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Events List */}
          <div className="glass-panel p-6 rounded-xl border border-white/10">
            <h2 className="text-white font-bold text-lg mb-4">🎉 Events</h2>
            {loading ? (
              <div className="text-cyan-400 animate-pulse text-sm">Loading…</div>
            ) : events.length === 0 ? (
              <div className="text-gray-500 text-sm">No events configured.</div>
            ) : (
              <div className="space-y-3">
                {events.map(ev => (
                  <div key={ev._id} className={`p-3 rounded-lg border ${ev.isActive ? 'border-green-500/30 bg-green-500/5' : 'border-white/10'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-white font-medium">{ev.name}</div>
                        <div className="text-gray-400 text-xs">{ev.description}</div>
                        <div className="text-gray-600 text-xs mt-1">
                          {new Date(ev.startDate).toLocaleDateString()} → {new Date(ev.endDate).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                        ev.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'
                      }`}>
                        {ev.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="mt-2 flex gap-3 text-xs text-gray-500">
                      <span className="text-yellow-400">💰 {ev.rewards?.credits}</span>
                      <span className="text-green-400">⭐ {ev.rewards?.xp} XP</span>
                      <span className="text-violet-400">🔮 {ev.rewards?.veloopCoins}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create Event */}
          <div className="glass-panel p-6 rounded-xl border border-white/10">
            <h2 className="text-white font-bold text-lg mb-4">➕ Create Event</h2>
            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="text-gray-400 text-xs">Event Name</label>
                <input
                  type="text"
                  required
                  value={newEvent.name}
                  onChange={e => setNewEvent(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Galaxy Defenders Weekend"
                  className="w-full mt-1 bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none" />
              </div>
              <div>
                <label className="text-gray-400 text-xs">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={e => setNewEvent(p => ({ ...p, description: e.target.value }))}
                  placeholder="Describe the event…"
                  rows={2}
                  className="w-full mt-1 bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 text-xs">Start Date</label>
                  <input
                    type="datetime-local"
                    required
                    value={newEvent.startDate}
                    onChange={e => setNewEvent(p => ({ ...p, startDate: e.target.value }))}
                    className="w-full mt-1 bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs">End Date</label>
                  <input
                    type="datetime-local"
                    required
                    value={newEvent.endDate}
                    onChange={e => setNewEvent(p => ({ ...p, endDate: e.target.value }))}
                    className="w-full mt-1 bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {(['credits', 'xp', 'veloopCoins'] as const).map(k => (
                  <div key={k}>
                    <label className="text-gray-400 text-xs capitalize">{k === 'veloopCoins' ? 'VELoop Coins' : k}</label>
                    <input
                      type="number"
                      min={0}
                      value={newEvent.rewards[k]}
                      onChange={e => setNewEvent(p => ({ ...p, rewards: { ...p.rewards, [k]: parseInt(e.target.value) || 0 } }))}
                      className="w-full mt-1 bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none" />
                  </div>
                ))}
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500
                           text-white font-bold rounded-lg transition-all disabled:opacity-50">
                {saving ? 'Creating…' : '✨ Create Event'}
              </button>
            </form>
          </div>
        </div>

        {/* Recent Activity */}
        {stats?.recentActivity && stats.recentActivity.length > 0 && (
          <div className="mt-6 glass-panel p-6 rounded-xl border border-white/10">
            <h2 className="text-white font-bold text-lg mb-4">📊 Recent Activity</h2>
            <div className="space-y-2">
              {stats.recentActivity.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-white/5 last:border-0">
                  <span className="text-cyan-400 font-medium">{item.username}</span>
                  <span className="text-gray-400">{item.action}</span>
                  <span className="text-gray-600 text-xs">{new Date(item.createdAt).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPage
