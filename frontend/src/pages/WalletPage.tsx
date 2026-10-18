import React, { useEffect, useState } from 'react'
import { api } from '../services/api'
import { useToast } from '../context/ToastContext'
import NavBar from '../components/NavBar'
import StarBackground from '../components/StarBackground'

interface WalletData {
  credits: number
  energyCores: number
  xp: number
  veloopCoins: number
}

interface Transaction {
  _id: string
  type: string
  currency: string
  amount: number
  reason: string
  createdAt: string
  status: string
}

interface StreakData {
  currentStreak: number
  lastClaimDate: string
  nextReward: { credits: number; xp: number; veloopCoins: number }
  canClaim: boolean
}

const CURRENCY_INFO: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  credits: { label: 'Credits', icon: '💰', color: 'text-yellow-400', bg: 'from-yellow-500/20 to-amber-600/20 border-yellow-500/30' },
  energyCores: { label: 'Energy Cores', icon: '⚡', color: 'text-blue-400', bg: 'from-blue-500/20 to-cyan-600/20 border-blue-500/30' },
  xp: { label: 'XP', icon: '⭐', color: 'text-green-400', bg: 'from-green-500/20 to-emerald-600/20 border-green-500/30' },
  veloopCoins: { label: 'VELoop Coins', icon: '🔮', color: 'text-violet-400', bg: 'from-violet-500/20 to-purple-600/20 border-violet-500/30' },
}

const TX_TYPE_ICONS: Record<string, string> = {
  mission_reward: '🎯',
  daily_streak: '🔥',
  purchase: '🛒',
  achievement: '🏆',
  admin_grant: '👑',
  event_reward: '🎉',
  ad_reward: '📺',
  refund: '↩️',
}

const WalletPage: React.FC = () => {
  const { addToast } = useToast()
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [streak, setStreak] = useState<StreakData | null>(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [currencyFilter, setCurrencyFilter] = useState<string>('all')

  useEffect(() => { loadData() }, [])
  useEffect(() => { loadTransactions() }, [page, currencyFilter])

  const loadData = async () => {
    setLoading(true)
    try {
      const [walletRes, streakRes] = await Promise.all([api.getWallet(), api.getStreak()])
      setWallet(walletRes.data.wallet)
      setStreak(streakRes.data)
    } catch (e: any) {
      addToast('Failed to load wallet', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadTransactions = async () => {
    try {
      const params: any = { page, limit: 10 }
      if (currencyFilter !== 'all') params.currency = currencyFilter
      const res = await api.getTransactions(params)
      setTransactions(res.data.transactions || [])
      setTotalPages(res.data.totalPages || 1)
    } catch {}
  }

  const claimStreak = async () => {
    setClaiming(true)
    try {
      const res = await api.claimStreak()
      addToast(`Day ${res.data.newStreak} streak claimed! 🔥`, 'success')
      await loadData()
      await loadTransactions()
    } catch (e: any) {
      addToast(e.response?.data?.message || 'Already claimed today', 'error')
    } finally {
      setClaiming(false)
    }
  }

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleString() } catch { return d }
  }

  if (loading) return (
    <div className="min-h-screen bg-space-dark flex items-center justify-center">
      <StarBackground />
      <div className="text-cyan-400 text-xl animate-pulse z-10">Loading Wallet…</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-space-dark relative">
      <StarBackground />
      <NavBar />
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-24">
        <h1 className="text-4xl font-black uppercase tracking-widest text-white mb-2">
          💎 Rewards <span className="text-cyan-400">Wallet</span>
        </h1>
        <p className="text-gray-400 mb-8">Track your currencies, transactions, and daily rewards.</p>

        {/* Balances */}
        {wallet && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {(['credits', 'energyCores', 'xp', 'veloopCoins'] as const).map(key => {
              const info = CURRENCY_INFO[key]
              const value = wallet[key]
              return (
                <div key={key} className={`glass-panel p-4 rounded-xl border bg-gradient-to-br ${info.bg}`}>
                  <div className="text-2xl mb-1">{info.icon}</div>
                  <div className={`text-2xl font-black ${info.color}`}>{value.toLocaleString()}</div>
                  <div className="text-gray-400 text-xs mt-1">{info.label}</div>
                  {key === 'veloopCoins' && (
                    <div className="text-gray-600 text-[10px] mt-1">Platform rewards — not real currency</div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Daily Streak */}
        {streak && (
          <div className="glass-panel p-6 rounded-xl border border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-red-500/10 mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  🔥 Daily Login Streak
                  <span className="text-orange-400 text-2xl font-black">{streak.currentStreak}</span>
                  <span className="text-gray-400 text-sm">days</span>
                </h2>
                {streak.nextReward && (
                  <div className="text-sm text-gray-400 mt-1 space-x-3">
                    <span>Next: 💰 {streak.nextReward.credits} Credits</span>
                    <span>⭐ {streak.nextReward.xp} XP</span>
                    {streak.nextReward.veloopCoins > 0 && <span>🔮 {streak.nextReward.veloopCoins} VELoop Coins</span>}
                  </div>
                )}
              </div>
              <button
                onClick={claimStreak}
                disabled={!streak.canClaim || claiming}
                className={`px-6 py-3 rounded-lg font-bold transition-all ${
                  streak.canClaim && !claiming
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/30'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}>
                {claiming ? 'Claiming…' : streak.canClaim ? '🎁 Claim Daily Reward' : '✓ Claimed Today'}
              </button>
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div className="glass-panel rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-white font-bold text-lg">📋 Transaction History</h2>
            <div className="flex gap-2 flex-wrap">
              {['all', 'credits', 'energyCores', 'xp', 'veloopCoins'].map(f => (
                <button
                  key={f}
                  onClick={() => { setCurrencyFilter(f); setPage(1) }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    currencyFilter === f
                      ? 'bg-cyan-500 text-black'
                      : 'border border-white/20 text-gray-400 hover:border-white/40'
                  }`}>
                  {f === 'all' ? 'All' : CURRENCY_INFO[f]?.icon + ' ' + CURRENCY_INFO[f]?.label}
                </button>
              ))}
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No transactions yet. Complete missions to earn rewards!</div>
          ) : (
            <div className="divide-y divide-white/5">
              {transactions.map(tx => {
                const info = CURRENCY_INFO[tx.currency] || { icon: '💫', color: 'text-gray-400' }
                const isPositive = tx.amount > 0
                return (
                  <div key={tx._id} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors">
                    <div className="text-2xl w-8 text-center flex-shrink-0">
                      {TX_TYPE_ICONS[tx.type] || '💫'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{tx.reason}</div>
                      <div className="text-gray-500 text-xs">{formatDate(tx.createdAt)}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{tx.amount.toLocaleString()} {info.icon}
                      </div>
                      <div className={`text-xs ${info.color}`}>{info.label || tx.currency}</div>
                    </div>
                    <div className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                      tx.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {tx.status}
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
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-white/20 text-gray-400 hover:border-white/40 disabled:opacity-40 text-sm">
                ← Prev
              </button>
              <span className="text-gray-500 text-sm">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg border border-white/20 text-gray-400 hover:border-white/40 disabled:opacity-40 text-sm">
                Next →
              </button>
            </div>
          )}
        </div>

        {/* VELoop Disclaimer */}
        <div className="mt-6 p-4 rounded-lg border border-violet-500/20 bg-violet-500/5 text-xs text-gray-500">
          <strong className="text-violet-400">VELoop Reward Coins</strong> are platform loyalty credits and are not legal tender, 
          cryptocurrency, or exchangeable for real money. They are governed separately from Credits and Energy Cores 
          (in-game currencies). Earning VELoop Coins is subject to platform terms.
        </div>
      </div>
    </div>
  )
}

export default WalletPage
