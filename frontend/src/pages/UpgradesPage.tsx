import React, { useEffect, useState } from 'react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import NavBar from '../components/NavBar'
import StarBackground from '../components/StarBackground'

interface Upgrade {
  _id: string
  name: string
  category: string
  tier: number
  description: string
  effect: Record<string, number>
  price: { credits: number; energyCores: number }
  requiredLevel: number
  prerequisiteUpgrade?: string
}

interface PlayerUpgrade {
  upgradeId: string
  equipped: boolean
  purchasedAt: string
}

const CATEGORY_ICONS: Record<string, string> = {
  weapon: '🔫',
  shield: '🛡️',
  engine: '⚡',
  hull: '🛸',
  special: '✨',
}

const CATEGORY_COLORS: Record<string, string> = {
  weapon: 'text-red-400 border-red-500/30',
  shield: 'text-blue-400 border-blue-500/30',
  engine: 'text-cyan-400 border-cyan-500/30',
  hull: 'text-green-400 border-green-500/30',
  special: 'text-violet-400 border-violet-500/30',
}

const UpgradesPage: React.FC = () => {
  const { wallet, refreshWallet } = useAuth()
  const { addToast } = useToast()
  const [upgrades, setUpgrades] = useState<Upgrade[]>([])
  const [playerUpgrades, setPlayerUpgrades] = useState<PlayerUpgrade[]>([])
  const [playerLevel, setPlayerLevel] = useState(1)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [upRes, profileRes] = await Promise.all([api.listUpgrades(), api.getProfile()])
      setUpgrades(upRes.data.upgrades || [])
      setPlayerUpgrades(upRes.data.playerUpgrades || [])
      setPlayerLevel(profileRes.data.profile?.level || 1)
    } catch (e: any) {
      addToast(e.response?.data?.message || 'Failed to load upgrades', 'error')
    } finally {
      setLoading(false)
    }
  }

  const isOwned = (id: string) => playerUpgrades.some(pu => pu.upgradeId === id)
  const isEquipped = (id: string) => playerUpgrades.find(pu => pu.upgradeId === id)?.equipped

  const handlePurchase = async (upgrade: Upgrade) => {
    setActionLoading(upgrade._id)
    try {
      await api.purchaseUpgrade(upgrade._id)
      addToast(`${upgrade.name} purchased! 🎉`, 'success')
      await Promise.all([loadData(), refreshWallet()])
    } catch (e: any) {
      addToast(e.response?.data?.message || 'Purchase failed', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleEquip = async (upgrade: Upgrade) => {
    setActionLoading(upgrade._id)
    try {
      await api.equipUpgrade(upgrade._id)
      addToast(`${upgrade.name} ${isEquipped(upgrade._id) ? 'unequipped' : 'equipped'}!`, 'success')
      await loadData()
    } catch (e: any) {
      addToast(e.response?.data?.message || 'Failed', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const categories = ['all', ...Array.from(new Set(upgrades.map(u => u.category)))]
  const filtered = filter === 'all' ? upgrades : upgrades.filter(u => u.category === filter)

  if (loading) return (
    <div className="min-h-screen bg-space-dark flex items-center justify-center">
      <StarBackground />
      <div className="text-cyan-400 text-xl animate-pulse z-10">Loading Upgrades…</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-space-dark relative">
      <StarBackground />
      <NavBar />
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-24">
        <h1 className="text-4xl font-black uppercase tracking-widest text-white mb-2">
          🔧 Upgrade <span className="text-cyan-400">Store</span>
        </h1>
        <p className="text-gray-400 mb-2">Enhance your ship's weapons, shields, engines, and hull.</p>

        {/* Wallet Summary */}
        <div className="flex flex-wrap gap-4 mb-8 text-sm">
          <span className="glass-panel px-4 py-2 rounded-lg">💰 {(wallet?.credits || 0).toLocaleString()} Credits</span>
          <span className="glass-panel px-4 py-2 rounded-lg">⚡ {wallet?.energyCores || 0} Energy Cores</span>
          <span className="glass-panel px-4 py-2 rounded-lg">🎖️ Level {playerLevel}</span>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg border text-sm font-bold capitalize transition-all ${
                filter === cat
                  ? 'bg-cyan-500 border-cyan-500 text-black'
                  : 'border-white/20 text-gray-400 hover:border-white/40'
              }`}>
              {cat === 'all' ? '🌐 All' : `${CATEGORY_ICONS[cat] || '🔹'} ${cat}`}
            </button>
          ))}
        </div>

        {/* Upgrades Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(upgrade => {
            const owned = isOwned(upgrade._id)
            const equipped = isEquipped(upgrade._id)
            const locked = playerLevel < (upgrade.requiredLevel || 1)
            const affordable = (wallet?.credits || 0) >= upgrade.price.credits &&
                               (wallet?.energyCores || 0) >= upgrade.price.energyCores
            const busy = actionLoading === upgrade._id
            const colorClass = CATEGORY_COLORS[upgrade.category] || 'text-gray-400 border-gray-500/30'

            return (
              <div key={upgrade._id}
                className={`glass-panel p-4 rounded-xl border transition-all ${
                  owned ? 'border-green-500/30' : locked ? 'border-white/5 opacity-60' : 'border-white/10 hover:border-white/30'
                }`}>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className={`text-xs font-bold uppercase tracking-wider ${colorClass.split(' ')[0]}`}>
                      {CATEGORY_ICONS[upgrade.category]} {upgrade.category}
                    </div>
                    <h3 className="text-white font-bold mt-1">{upgrade.name}</h3>
                    <div className="text-gray-500 text-xs">Tier {upgrade.tier}</div>
                  </div>
                  {owned && <span className="text-green-400 text-lg">✓</span>}
                  {locked && <span className="text-gray-500 text-lg">🔒</span>}
                </div>

                <p className="text-gray-400 text-xs leading-relaxed mb-3">{upgrade.description}</p>

                {/* Effects */}
                {Object.keys(upgrade.effect || {}).length > 0 && (
                  <div className="mb-3 space-y-1">
                    {Object.entries(upgrade.effect).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs">
                        <span className="text-gray-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-green-400">+{v}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Price */}
                {!owned && (
                  <div className="text-xs text-gray-400 mb-3 space-y-1">
                    {upgrade.price.credits > 0 && (
                      <div className={affordable || (wallet?.credits || 0) >= upgrade.price.credits ? 'text-yellow-400' : 'text-red-400'}>
                        💰 {upgrade.price.credits.toLocaleString()} Credits
                      </div>
                    )}
                    {upgrade.price.energyCores > 0 && (
                      <div className={(wallet?.energyCores || 0) >= upgrade.price.energyCores ? 'text-blue-400' : 'text-red-400'}>
                        ⚡ {upgrade.price.energyCores} Energy Cores
                      </div>
                    )}
                    {locked && <div className="text-orange-400">🔒 Requires Level {upgrade.requiredLevel}</div>}
                  </div>
                )}

                {/* Action */}
                {owned ? (
                  <button
                    onClick={() => handleEquip(upgrade)}
                    disabled={busy}
                    className={`w-full py-2 rounded-lg text-xs font-bold transition-all ${
                      equipped
                        ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-300 hover:bg-red-500/20 hover:border-red-500 hover:text-red-300'
                        : 'bg-green-500/20 border border-green-500 text-green-300 hover:bg-green-500/30'
                    }`}>
                    {busy ? '…' : equipped ? 'Unequip' : '⚡ Equip'}
                  </button>
                ) : (
                  <button
                    onClick={() => handlePurchase(upgrade)}
                    disabled={busy || locked || !affordable}
                    className="w-full py-2 rounded-lg text-xs font-bold bg-violet-500/20 border border-violet-500/50
                               text-violet-300 hover:bg-violet-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    {busy ? 'Buying…' : locked ? `Level ${upgrade.requiredLevel} req.` : !affordable ? 'Insufficient Funds' : '🛒 Purchase'}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-500">No upgrades in this category.</div>
        )}
      </div>
    </div>
  )
}

export default UpgradesPage
