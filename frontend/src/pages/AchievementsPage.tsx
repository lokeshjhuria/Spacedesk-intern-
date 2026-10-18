import React, { useEffect, useState } from 'react'
import { api } from '../services/api'
import { useToast } from '../context/ToastContext'
import NavBar from '../components/NavBar'
import StarBackground from '../components/StarBackground'

interface Achievement {
  _id: string
  name: string
  description: string
  category: string
  icon: string
  reward: { xp: number; credits: number; veloopCoins: number }
  requirement: { type: string; value: number }
}

interface PlayerAchievement {
  achievementId: string
  progress: number
  completed: boolean
  claimed: boolean
  completedAt?: string
}

interface DailyMission {
  _id: string
  title: string
  description: string
  requirement: { type: string; value: number }
  reward: { xp: number; credits: number }
  progress: number
  completed: boolean
}

const AchievementsPage: React.FC = () => {
  const { addToast } = useToast()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [playerAch, setPlayerAch] = useState<PlayerAchievement[]>([])
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>([])
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'completed' | 'unclaimed' | 'pending'>('all')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [achRes, dailyRes] = await Promise.all([
        api.listAchievements(),
        api.getDailyMissions().catch(() => ({ data: { missions: [] } })),
      ])
      setAchievements(achRes.data.achievements || [])
      setPlayerAch(achRes.data.playerAchievements || [])
      setDailyMissions(dailyRes.data.missions || [])
    } catch (e: any) {
      addToast('Failed to load achievements', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getPA = (id: string) => playerAch.find(pa => pa.achievementId === id)

  const handleClaim = async (achievement: Achievement) => {
    setClaiming(achievement._id)
    try {
      await api.claimAchievement(achievement._id)
      addToast(`${achievement.name} claimed! 🏆`, 'success')
      await loadData()
    } catch (e: any) {
      addToast(e.response?.data?.message || 'Already claimed', 'error')
    } finally {
      setClaiming(null)
    }
  }

  const getProgress = (ach: Achievement) => {
    const pa = getPA(ach._id)
    const progress = pa?.progress || 0
    const total = ach.requirement?.value || 1
    return { progress, total, pct: Math.min(100, (progress / total) * 100), pa }
  }

  const filteredAch = achievements.filter(ach => {
    const pa = getPA(ach._id)
    if (filter === 'completed') return pa?.completed
    if (filter === 'unclaimed') return pa?.completed && !pa?.claimed
    if (filter === 'pending') return !pa?.completed
    return true
  })

  const stats = {
    total: achievements.length,
    completed: playerAch.filter(pa => pa.completed).length,
    claimed: playerAch.filter(pa => pa.claimed).length,
  }

  if (loading) return (
    <div className="min-h-screen bg-space-dark flex items-center justify-center">
      <StarBackground />
      <div className="text-cyan-400 text-xl animate-pulse z-10">Loading Achievements…</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-space-dark relative">
      <StarBackground />
      <NavBar />
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-24">
        <h1 className="text-4xl font-black uppercase tracking-widest text-white mb-2">
          🏆 <span className="text-yellow-400">Achievements</span>
        </h1>
        <p className="text-gray-400 mb-8">Track your milestones, claim rewards, and complete daily missions.</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="glass-panel p-4 rounded-xl border border-white/10 text-center">
            <div className="text-3xl font-black text-yellow-400">{stats.completed}</div>
            <div className="text-gray-500 text-xs">Completed</div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-white/10 text-center">
            <div className="text-3xl font-black text-green-400">{stats.claimed}</div>
            <div className="text-gray-500 text-xs">Claimed</div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-white/10 text-center">
            <div className="text-3xl font-black text-cyan-400">{stats.total}</div>
            <div className="text-gray-500 text-xs">Total</div>
          </div>
        </div>

        {/* Daily Missions */}
        {dailyMissions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-white font-bold text-xl mb-4">📋 Daily Missions</h2>
            <div className="space-y-3">
              {dailyMissions.map(dm => (
                <div key={dm._id}
                  className={`glass-panel p-4 rounded-xl border ${dm.completed ? 'border-green-500/30' : 'border-white/10'}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{dm.title}</span>
                        {dm.completed && <span className="text-green-400 text-xs bg-green-500/20 px-2 py-0.5 rounded-full">Complete</span>}
                      </div>
                      <p className="text-gray-400 text-xs mt-0.5">{dm.description}</p>
                      <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${dm.completed ? 'bg-green-500' : 'bg-cyan-500'}`}
                          style={{ width: `${Math.min(100, (dm.progress / (dm.requirement?.value || 1)) * 100)}%` }} />
                      </div>
                      <div className="text-gray-600 text-xs mt-1">{dm.progress} / {dm.requirement?.value}</div>
                    </div>
                    <div className="text-right text-xs text-gray-400 flex-shrink-0">
                      <div className="text-yellow-400">💰 {dm.reward?.credits}</div>
                      <div className="text-green-400">⭐ {dm.reward?.xp} XP</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievement Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'pending', 'completed', 'unclaimed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                filter === f ? 'bg-yellow-500 text-black' : 'border border-white/20 text-gray-400 hover:border-white/40'
              }`}>
              {f === 'unclaimed' ? '🎁 Claimable' : f === 'completed' ? '✓ Completed' : f === 'pending' ? '⏳ In Progress' : '🌐 All'}
            </button>
          ))}
        </div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAch.map(ach => {
            const { progress, total, pct, pa } = getProgress(ach)
            const canClaim = pa?.completed && !pa?.claimed
            const claimed = pa?.claimed
            const busy = claiming === ach._id

            return (
              <div key={ach._id}
                className={`glass-panel p-4 rounded-xl border transition-all ${
                  claimed ? 'border-gray-700 opacity-60' :
                  canClaim ? 'border-yellow-500/50 bg-yellow-500/5' :
                  pa?.completed ? 'border-green-500/30' : 'border-white/10'
                }`}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-3xl">{ach.icon || '🏅'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-bold truncate">{ach.name}</div>
                    <div className="text-gray-500 text-xs capitalize">{ach.category}</div>
                  </div>
                  {claimed && <span className="text-gray-600 text-sm">✓</span>}
                  {canClaim && <span className="text-yellow-400 animate-pulse text-sm">🎁</span>}
                </div>

                <p className="text-gray-400 text-xs leading-relaxed mb-3">{ach.description}</p>

                {/* Progress */}
                <div className="mb-3">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${pa?.completed ? 'bg-green-500' : 'bg-cyan-500'}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-gray-600 text-xs mt-1">{progress} / {total}</div>
                </div>

                {/* Reward */}
                <div className="text-xs text-gray-500 mb-3 space-x-2">
                  {ach.reward?.credits > 0 && <span className="text-yellow-400">💰 {ach.reward.credits}</span>}
                  {ach.reward?.xp > 0 && <span className="text-green-400">⭐ {ach.reward.xp} XP</span>}
                  {ach.reward?.veloopCoins > 0 && <span className="text-violet-400">🔮 {ach.reward.veloopCoins}</span>}
                </div>

                {canClaim && (
                  <button
                    onClick={() => handleClaim(ach)}
                    disabled={busy}
                    className="w-full py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-yellow-500 to-amber-600
                               text-black hover:from-yellow-400 hover:to-amber-500 transition-all disabled:opacity-50">
                    {busy ? 'Claiming…' : '🎁 Claim Reward'}
                  </button>
                )}
                {claimed && (
                  <div className="text-center text-xs text-gray-600 py-2">Reward claimed ✓</div>
                )}
              </div>
            )
          })}
        </div>

        {filteredAch.length === 0 && (
          <div className="text-center py-20 text-gray-500">No achievements match this filter.</div>
        )}
      </div>
    </div>
  )
}

export default AchievementsPage
