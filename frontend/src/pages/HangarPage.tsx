import React, { useEffect, useState } from 'react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import NavBar from '../components/NavBar'
import StarBackground from '../components/StarBackground'
import ShipVisual from '../components/ShipVisual'

interface Ship {
  _id: string
  name: string
  class: string
  description: string
  stats: { speed: number; fireRate: number; damage: number; shield: number; health: number }
  specialAbility: { name: string; description: string; cooldown: number }
  price: { credits: number; energyCores: number }
  unlockRequirement: { level: number }
  tier: number
}

interface PlayerShip {
  shipId: string
  isEquipped: boolean
  level: number
  upgrades: string[]
}

const DEFAULT_SHIPS: Ship[] = [
  {
    _id: 'ship_interceptor',
    name: 'Aero-Interceptor Mark IV',
    class: 'Interceptor',
    description: 'High-agility strike fighter built with twin plasma thrusters and rapid-fire pulse lasers.',
    stats: { speed: 9, fireRate: 8, damage: 18, shield: 70, health: 100 },
    specialAbility: { name: 'Hyper Overdrive', description: 'Triples fire rate and boosts velocity for 6 seconds.', cooldown: 18 },
    price: { credits: 0, energyCores: 0 },
    unlockRequirement: { level: 1 },
    tier: 1
  },
  {
    _id: 'ship_guardian',
    name: 'Aegis Guardian Vanguard',
    class: 'Guardian',
    description: 'Heavily armored dreadnought equipped with dual kinetic shield pylons and reinforced prow.',
    stats: { speed: 5, fireRate: 6, damage: 24, shield: 160, health: 220 },
    specialAbility: { name: 'Kinetic Bastion', description: 'Deploys an invulnerable energy shield absorbing 100% damage.', cooldown: 24 },
    price: { credits: 2500, energyCores: 25 },
    unlockRequirement: { level: 3 },
    tier: 2
  },
  {
    _id: 'ship_destroyer',
    name: 'Oblivion Destroyer',
    class: 'Destroyer',
    description: 'Frontline heavy strike vessel mounting twin railgun artillery and antimatter warheads.',
    stats: { speed: 6, fireRate: 5, damage: 42, shield: 90, health: 180 },
    specialAbility: { name: 'Plasma Barrage', description: 'Unleashes a 360-degree radial barrage of plasma devastation.', cooldown: 22 },
    price: { credits: 6000, energyCores: 60 },
    unlockRequirement: { level: 5 },
    tier: 3
  },
  {
    _id: 'ship_phantom',
    name: 'Spectre Phantom Corvette',
    class: 'Phantom',
    description: 'Covert void-infiltrator featuring radar-absorbing diamond armor and phase shift cloaking.',
    stats: { speed: 8, fireRate: 7, damage: 28, shield: 80, health: 110 },
    specialAbility: { name: 'Phase Shift', description: 'Phases into hyperspace, becoming untouchable and invisible.', cooldown: 20 },
    price: { credits: 12000, energyCores: 120 },
    unlockRequirement: { level: 8 },
    tier: 4
  },
  {
    _id: 'ship_nova',
    name: 'Solaris Nova Flagship',
    class: 'Nova',
    description: 'Supreme fleet vanguard powered by an artificial stellar core with devastating beam arrays.',
    stats: { speed: 7, fireRate: 9, damage: 38, shield: 180, health: 260 },
    specialAbility: { name: 'Supernova Burst', description: 'Radiates intense coronal energy, doubling damage and firing multishots.', cooldown: 25 },
    price: { credits: 25000, energyCores: 250 },
    unlockRequirement: { level: 12 },
    tier: 5
  }
];

const SHIP_COLORS: Record<string, string> = {
  Interceptor: 'from-cyan-500 to-blue-600',
  Guardian: 'from-blue-600 to-indigo-800',
  Destroyer: 'from-red-600 to-orange-600',
  Phantom: 'from-purple-600 to-violet-900',
  Nova: 'from-amber-400 to-yellow-600',
}

const StatBar: React.FC<{ label: string; value: number; max?: number; color?: string }> = ({
  label, value, max = 100, color = 'bg-cyan-500'
}) => (
  <div className="flex items-center gap-2 text-xs">
    <span className="w-16 text-gray-400 flex-shrink-0">{label}</span>
    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${(value / max) * 100}%` }} />
    </div>
    <span className="w-6 text-right text-gray-300">{value}</span>
  </div>
)

const HangarPage: React.FC = () => {
  const { wallet, refreshWallet } = useAuth()
  const { addToast } = useToast()
  const [ships, setShips] = useState<Ship[]>(DEFAULT_SHIPS)
  const [playerShips, setPlayerShips] = useState<PlayerShip[]>([])
  const [playerLevel, setPlayerLevel] = useState(1)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selected, setSelected] = useState<Ship | null>(DEFAULT_SHIPS[0])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [shipsRes, profileRes] = await Promise.all([
        api.listShips().catch(() => ({ ships: DEFAULT_SHIPS, playerShips: [] })),
        api.getProfile().catch(() => ({ profile: { level: 1 } })),
      ])
      const fetchedShips = shipsRes.ships?.length ? shipsRes.ships : DEFAULT_SHIPS
      setShips(fetchedShips)
      setPlayerShips(shipsRes.playerShips || [{ shipId: 'ship_interceptor', isEquipped: true, level: 1, upgrades: [] }])
      setPlayerLevel(profileRes.profile?.level || 1)
      if (fetchedShips.length) setSelected(prev => prev || fetchedShips[0])
    } catch {
      setShips(DEFAULT_SHIPS)
      setPlayerShips([{ shipId: 'ship_interceptor', isEquipped: true, level: 1, upgrades: [] }])
      setSelected(prev => prev || DEFAULT_SHIPS[0])
    }
  }

  const getPlayerShip = (shipId: string) => playerShips.find(ps => ps.shipId === shipId)
  const isOwned = (shipId: string) => !!getPlayerShip(shipId)
  const isEquipped = (shipId: string) => getPlayerShip(shipId)?.isEquipped ?? false

  const canAfford = (ship: Ship) =>
    (wallet?.credits || 0) >= ship.price.credits &&
    (wallet?.energyCores || 0) >= ship.price.energyCores

  const meetsLevel = (ship: Ship) => playerLevel >= (ship.unlockRequirement?.level || 1)

  const handleUnlock = async (ship: Ship) => {
    setActionLoading(ship._id)
    try {
      await api.unlockShip(ship._id)
      addToast(`${ship.name} unlocked! 🚀`, 'success')
      await Promise.all([loadData(), refreshWallet()])
    } catch (e: any) {
      addToast(e.response?.data?.message || 'Failed to unlock ship', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleEquip = async (ship: Ship) => {
    setActionLoading(ship._id)
    try {
      await api.equipShip(ship._id)
      addToast(`${ship.name} equipped! ✅`, 'success')
      await loadData()
    } catch (e: any) {
      addToast(e.response?.data?.message || 'Failed to equip ship', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-space-dark flex items-center justify-center">
      <StarBackground />
      <div className="text-cyan-400 text-xl animate-pulse z-10">Loading Hangar…</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-space-dark relative">
      <StarBackground />
      <NavBar />
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-24">
        <h1 className="text-4xl font-black uppercase tracking-widest text-white mb-2">
          🛸 Ship <span className="text-cyan-400">Hangar</span>
        </h1>
        <p className="text-gray-400 mb-8">Select, unlock, and equip your spacecraft.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ship List */}
          <div className="lg:col-span-1 space-y-3">
            {ships.map(ship => {
              const owned = isOwned(ship._id)
              const equipped = isEquipped(ship._id)
              const locked = !meetsLevel(ship)
              const color = SHIP_COLORS[ship.class] || 'from-gray-500 to-gray-700'
              return (
                <button
                  key={ship._id}
                  onClick={() => setSelected(ship)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selected?._id === ship._id
                      ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
                      : 'border-white/10 bg-white/5 hover:border-white/30'
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-space-950/80 border border-cyan-500/30 flex items-center justify-center p-1 shadow-lg flex-shrink-0">
                      <ShipVisual shipClass={ship.class} size={48} animated={false} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold truncate">{ship.name}</span>
                        {equipped && <span className="text-xs bg-cyan-500 text-black px-2 py-0.5 rounded-full font-bold">ACTIVE</span>}
                        {locked && <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">LVL {ship.unlockRequirement?.level}</span>}
                      </div>
                      <div className="text-gray-400 text-xs">{ship.class} Class • Tier {ship.tier}</div>
                    </div>
                    {owned ? (
                      <span className="text-green-400 text-lg">✓</span>
                    ) : (
                      <span className="text-gray-500 text-lg">🔒</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Ship Detail */}
          {selected && (() => {
            const owned = isOwned(selected._id)
            const equipped = isEquipped(selected._id)
            const locked = !meetsLevel(selected)
            const affordable = canAfford(selected)
            const busy = actionLoading === selected._id

            return (
              <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10">
                {/* Header */}
                <div className="flex items-start gap-6 mb-6">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-b from-space-900 to-black border border-cyan-500/40 flex items-center justify-center p-2 shadow-2xl relative overflow-hidden flex-shrink-0">
                    <div className="absolute inset-0 bg-radial-glow opacity-30 pointer-events-none" />
                    <ShipVisual shipClass={selected.class} size={112} animated={true} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-3xl font-black text-white">{selected.name}</h2>
                      {equipped && (
                        <span className="bg-cyan-500 text-black text-sm font-bold px-3 py-1 rounded-full">EQUIPPED</span>
                      )}
                    </div>
                    <p className="text-cyan-400 font-bold">{selected.class} Class — Tier {selected.tier}</p>
                    <p className="text-gray-400 text-sm mt-1 leading-relaxed">{selected.description}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="mb-6 bg-black/30 p-4 rounded-xl space-y-2">
                  <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Statistics</h3>
                  <StatBar label="Speed" value={selected.stats.speed} color="bg-cyan-500" />
                  <StatBar label="Fire Rate" value={selected.stats.fireRate} color="bg-yellow-500" />
                  <StatBar label="Damage" value={selected.stats.damage} color="bg-red-500" />
                  <StatBar label="Shield" value={selected.stats.shield} color="bg-blue-500" />
                  <StatBar label="Health" value={selected.stats.health} color="bg-green-500" />
                </div>

                {/* Special Ability */}
                <div className="mb-6 bg-violet-500/10 border border-violet-500/30 p-4 rounded-xl">
                  <h3 className="text-violet-400 font-bold text-sm uppercase tracking-wider mb-2">⚡ Special Ability</h3>
                  <p className="text-white font-bold">{selected.specialAbility?.name}</p>
                  <p className="text-gray-300 text-sm">{selected.specialAbility?.description}</p>
                  <p className="text-gray-500 text-xs mt-1">Cooldown: {selected.specialAbility?.cooldown}s — Activate with [Q]</p>
                </div>

                {/* Price & Requirements */}
                {!owned && (
                  <div className="mb-6 bg-black/30 p-4 rounded-xl">
                    <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-3">Purchase</h3>
                    <div className="flex flex-wrap gap-4 mb-3">
                      {selected.price.credits > 0 && (
                        <div className={`text-sm ${(wallet?.credits || 0) >= selected.price.credits ? 'text-yellow-400' : 'text-red-400'}`}>
                          💰 {selected.price.credits.toLocaleString()} Credits
                          {(wallet?.credits || 0) < selected.price.credits && (
                            <span className="text-gray-500 text-xs"> (need {(selected.price.credits - (wallet?.credits || 0)).toLocaleString()} more)</span>
                          )}
                        </div>
                      )}
                      {selected.price.energyCores > 0 && (
                        <div className={`text-sm ${(wallet?.energyCores || 0) >= selected.price.energyCores ? 'text-blue-400' : 'text-red-400'}`}>
                          ⚡ {selected.price.energyCores} Energy Cores
                        </div>
                      )}
                    </div>
                    {locked && (
                      <p className="text-orange-400 text-sm">🔒 Requires Level {selected.unlockRequirement?.level} (you are Level {playerLevel})</p>
                    )}
                  </div>
                )}

                {/* Action Button */}
                <div className="flex gap-3">
                  {equipped ? (
                    <div className="flex-1 py-3 text-center bg-cyan-500/20 border border-cyan-500 rounded-lg text-cyan-300 font-bold">
                      ✓ Currently Equipped
                    </div>
                  ) : owned ? (
                    <button
                      onClick={() => handleEquip(selected)}
                      disabled={busy}
                      className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500
                                 text-white font-bold rounded-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50">
                      {busy ? 'Equipping…' : '⚡ Equip Ship'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnlock(selected)}
                      disabled={busy || locked || !affordable}
                      className="flex-1 py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500
                                 text-white font-bold rounded-lg transition-all hover:scale-105 active:scale-95
                                 disabled:opacity-40 disabled:cursor-not-allowed">
                      {busy ? 'Purchasing…' : locked ? `🔒 Level ${selected.unlockRequirement?.level} Required` : !affordable ? '💸 Insufficient Funds' : '🔓 Purchase Ship'}
                    </button>
                  )}
                </div>

                {/* Wallet reminder */}
                {!owned && !locked && !affordable && (
                  <p className="text-gray-500 text-xs text-center mt-3">
                    Complete missions to earn more Credits and Energy Cores.
                  </p>
                )}
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}

export default HangarPage
