import React, { useEffect, useState } from 'react'
import { api } from '../services/api'
import { useToast } from '../context/ToastContext'
import NavBar from '../components/NavBar'
import StarBackground from '../components/StarBackground'

interface LeaderboardEntry {
  _id: string
  rank: number
  playerName: string
  score: number
  missionId: string
  missionTitle: string
  sector: string
  completedAt: string
  stars: number
}

const RANK_BADGES: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

const LeaderboardPage: React.FC = () => {
  const { addToast } = useToast()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState<'score' | 'completedAt'>('score')
  const [timeframe, setTimeframe] = useState<'all' | 'daily' | 'weekly'>('all')

  useEffect(() => { loadData() }, [page, sortBy, timeframe])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await api.getLeaderboard({ page, limit: 20, sortBy, timeframe })
      setEntries(res.data.entries || [])
      setTotalPages(res.data.totalPages || 1)
    } catch (e: any) {
      addToast('Failed to load leaderboard', 'error')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString() } catch { return d }
  }

  return (
    <div className="min-h-screen bg-space-dark relative">
      <StarBackground />
      <NavBar />
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-24">
        <h1 className="text-4xl font-black uppercase tracking-widest text-white mb-2">
          🏆 <span className="text-yellow-400">Leaderboard</span>
        </h1>
        <p className="text-gray-400 mb-8">Server-validated rankings. Scores are never accepted from clients.</p>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex gap-2">
            {(['all', 'weekly', 'daily'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTimeframe(t); setPage(1) }}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  timeframe === t ? 'bg-yellow-500 text-black' : 'border border-white/20 text-gray-400 hover:border-white/40'
                }`}>
                {t === 'all' ? '∞ All Time' : t === 'weekly' ? '📅 Weekly' : '📆 Daily'}
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-auto">
            {(['score', 'completedAt'] as const).map(s => (
              <button
                key={s}
                onClick={() => { setSortBy(s); setPage(1) }}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  sortBy === s ? 'bg-cyan-500 text-black' : 'border border-white/20 text-gray-400 hover:border-white/40'
                }`}>
                {s === 'score' ? '🎯 By Score' : '🕐 Most Recent'}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="glass-panel rounded-xl border border-white/10 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/10 text-xs font-bold uppercase tracking-wider text-gray-500">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-4">Pilot</div>
            <div className="col-span-3">Mission</div>
            <div className="col-span-2 text-right">Score</div>
            <div className="col-span-1 text-center">Stars</div>
            <div className="col-span-1 text-right">Date</div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-cyan-400 animate-pulse">Loading rankings…</div>
          ) : entries.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No scores yet. Complete missions to appear here!
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {entries.map((entry, i) => {
                const globalRank = (page - 1) * 20 + i + 1
                const isTop3 = globalRank <= 3
                return (
                  <div key={entry._id}
                    className={`grid grid-cols-12 gap-2 px-4 py-3 items-center transition-colors hover:bg-white/5 ${
                      isTop3 ? 'bg-gradient-to-r from-yellow-500/5 to-transparent' : ''
                    }`}>
                    <div className="col-span-1 text-center">
                      {RANK_BADGES[globalRank] ? (
                        <span className="text-xl">{RANK_BADGES[globalRank]}</span>
                      ) : (
                        <span className="text-gray-500 font-bold text-sm">#{globalRank}</span>
                      )}
                    </div>
                    <div className="col-span-4">
                      <div className={`font-bold ${isTop3 ? 'text-yellow-400' : 'text-white'}`}>
                        {entry.playerName}
                      </div>
                    </div>
                    <div className="col-span-3 min-w-0">
                      <div className="text-gray-300 text-sm truncate">{entry.missionTitle}</div>
                      <div className="text-gray-600 text-xs">{entry.sector}</div>
                    </div>
                    <div className={`col-span-2 text-right font-black tabular-nums ${isTop3 ? 'text-yellow-400' : 'text-white'}`}>
                      {(entry.score || 0).toLocaleString()}
                    </div>
                    <div className="col-span-1 text-center text-yellow-400">
                      {'★'.repeat(entry.stars || 0)}{'☆'.repeat(3 - (entry.stars || 0))}
                    </div>
                    <div className="col-span-1 text-right text-gray-600 text-xs">
                      {formatDate(entry.completedAt)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="px-4 py-2 rounded-lg border border-white/20 text-gray-400 hover:border-white/40 disabled:opacity-40 text-sm">
                ← Prev
              </button>
              <span className="text-gray-500 text-sm">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
                className="px-4 py-2 rounded-lg border border-white/20 text-gray-400 hover:border-white/40 disabled:opacity-40 text-sm">
                Next →
              </button>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs text-gray-600 text-center">
          All scores are validated server-side. Client-submitted scores are never accepted.
        </p>
      </div>
    </div>
  )
}

export default LeaderboardPage
