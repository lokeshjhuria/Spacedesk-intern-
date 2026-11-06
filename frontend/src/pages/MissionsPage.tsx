import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import StarBackground from '../components/StarBackground';
import { Lock, Star, Target, Clock, Zap, Shield, ChevronRight, Crosshair } from 'lucide-react';
import NavBar from '../components/NavBar';

const SECTOR_THEMES: Record<number, { name: string; color: string; gradient: string }> = {
  1: { name: 'Asteroid Frontier', color: 'text-cyan-400', gradient: 'from-cyan-900/30 to-cyan-900/10' },
  2: { name: 'Nebula Expanse', color: 'text-purple-400', gradient: 'from-purple-900/30 to-purple-900/10' },
  3: { name: 'Cybernetic Outpost', color: 'text-emerald-400', gradient: 'from-emerald-900/30 to-emerald-900/10' },
  4: { name: 'Solar Flare Zone', color: 'text-orange-400', gradient: 'from-orange-900/30 to-orange-900/10' },
  5: { name: 'Void Core', color: 'text-red-400', gradient: 'from-red-900/30 to-red-900/10' }
};

const DIFF_COLORS: Record<string, string> = {
  Recruit: 'text-emerald-400', Veteran: 'text-cyan-400',
  Elite: 'text-yellow-400', Master: 'text-orange-400', Nightmare: 'text-red-400'
};

const FALLBACK_MISSION_TITLES = [
  "First Contact Patrol", "Scrap Yard Skirmish", "Asteroid Ambush", "Mineral Convoy Escort",
  "Pirate Perimeter Sweep", "Deep Crater Infiltration", "Stellar Beacon Defense", "Raider Outpost Siege",
  "Belt Gate Lockdown", "Showdown: Aegis Dreadnought",
  "Into the Violet Mist", "Ion Storm Navigation", "Luminescent Swarm", "Gaseous Trench Run",
  "Plasma Well Disruption", "Derelict Ghost Hauler", "Sensor Array Sabotage", "Nebula Hive Assault",
  "Echoes in the Vapor", "Wrath: Nebula Leviathan",
  "Silicon Bastion Breach", "Firewall Penetration", "Automaton Fleet Clash", "Relay Tower Overload",
  "Sub-Routine Intercept", "Cyber Hive Vanguard", "Glitch Matrix Defense", "Quantum Core Extraction",
  "Mainframe Incursion", "Siege: Cyber Overlord Core",
  "Solar Corona Descent", "Coronal Mass Ejection", "Solar Flare Dogfight", "Helios Thermal Trap",
  "Radiant Perimeter Sweep", "Sunspot Raider Blitz", "Magnetic Storm Gauntlet", "Prominence Defense",
  "Inferno Fleet Vanguard", "Clash: Solar Titan",
  "Abyssal Horizon", "Dark Matter Rifts", "Void Singularity Run", "Shadow Drone Swarm",
  "Event Horizon Incursion", "Cosmic Rift Defense", "Void Gate Assault", "Oblivion Vanguard",
  "The Final Threshold", "Ascension: Void Empress Omen"
];

function generateFallbackMissions() {
  const diffs = ['Recruit', 'Veteran', 'Elite', 'Master', 'Nightmare'];
  const ships = ['interceptor', 'guardian', 'destroyer', 'phantom', 'nova'];

  return Array.from({ length: 50 }, (_, idx) => {
    const num = idx + 1;
    const sector = Math.ceil(num / 10);
    const isBoss = num % 10 === 0;
    return {
      missionId: `M-${String(num).padStart(3, '0')}`,
      numericId: num,
      title: FALLBACK_MISSION_TITLES[idx] || `Mission ${num}`,
      sector,
      difficulty: diffs[sector - 1],
      recommendedShipClass: ships[sector - 1],
      description: isBoss
        ? `Sector ${sector} Final Stand: Defeat the Sector Boss to open the jumpgate!`
        : `Eliminate enemy squadrons and patrol sector ${sector} coordinates.`,
      objective: {
        type: isBoss ? 'boss_fight' : 'elimination',
        description: isBoss ? 'Defeat Sector Flagship' : 'Clear Hostile Wave'
      },
      rewards: {
        credits: num * 120,
        energyCores: Math.ceil(num / 2),
        veloopCoins: Math.ceil(num / 4)
      },
      bossConfig: isBoss ? { name: `Sector ${sector} Boss` } : undefined,
      isUnlocked: num === 1,
      isCompleted: false,
      stars: 0,
      highestScore: 0
    };
  });
}

const MissionsPage: React.FC = () => {
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState(1);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    api.listMissions()
      .then(res => {
        if (res && res.missions && res.missions.length > 0) {
          setMissions(res.missions);
        } else {
          setMissions(generateFallbackMissions());
        }
      })
      .catch(() => {
        // Resilient fallback ensures missions are ALWAYS visible
        setMissions(generateFallbackMissions());
      })
      .finally(() => setLoading(false));
  }, []);

  const sectorMissions = missions.filter(m => m.sector === selectedSector);

  const handleLaunch = (mission: any) => {
    if (!mission.isUnlocked) {
      showToast(`Mission locked. Complete previous mission to unlock.`, 'warning');
      return;
    }
    navigate(`/game/${mission.missionId}`);
  };

  return (
    <div className="relative min-h-screen pt-16 pb-8 px-4">
      <StarBackground />
      <NavBar />
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-6 pt-4">
          <h1 className="font-orbitron text-2xl font-bold text-white">MISSION CONTROL</h1>
          <p className="text-slate-400 text-sm mt-1">50 Missions across 5 Sectors</p>
        </div>

        {/* Sector Selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map(sec => {
            const theme = SECTOR_THEMES[sec];
            const sectorMiss = missions.filter(m => m.sector === sec);
            const completed = sectorMiss.filter(m => m.isCompleted).length;
            const isActive = selectedSector === sec;
            return (
              <button
                key={sec}
                onClick={() => setSelectedSector(sec)}
                className={`flex-shrink-0 flex-1 min-w-[140px] px-4 py-3 rounded-xl border transition-all text-left
                  ${isActive ? `border-cyan-500/60 bg-gradient-to-b ${theme.gradient} shadow-neon-cyan` : 'glass-card border-transparent'}`}
              >
                <div className={`text-xs font-bold uppercase tracking-wider ${isActive ? theme.color : 'text-slate-500'}`}>
                  SECTOR {sec}
                </div>
                <div className="text-white text-sm font-semibold truncate">{theme.name}</div>
                <div className="text-xs text-slate-500 mt-1">{completed}/{sectorMiss.length} done</div>
              </button>
            );
          })}
        </div>

        {/* Missions Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="glass-card rounded-xl h-40 animate-pulse border border-slate-700" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sectorMissions.map(mission => (
              <MissionCard key={mission.missionId} mission={mission} onLaunch={handleLaunch} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MissionCard: React.FC<{ mission: any; onLaunch: (m: any) => void }> = ({ mission, onLaunch }) => {
  const isBoss = !!mission.bossConfig;
  const theme = SECTOR_THEMES[mission.sector];

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden cursor-pointer group
        ${!mission.isUnlocked ? 'opacity-60 cursor-not-allowed border-slate-700 bg-space-900'
          : isBoss ? 'border-red-500/40 hover:border-red-400/60 glass-card'
          : `border-transparent hover:border-cyan-500/30 glass-card`}`}
      onClick={() => onLaunch(mission)}
    >
      {/* Header */}
      <div className={`px-4 py-2 flex items-center justify-between bg-gradient-to-r ${isBoss ? 'from-red-900/40 to-red-900/20' : `${theme.gradient}`}`}>
        <div className="flex items-center gap-2">
          {isBoss && <span className="text-red-400 text-xs font-bold animate-pulse">⚡ BOSS</span>}
          <span className="text-xs text-slate-400 font-mono">{mission.missionId}</span>
        </div>
        <div className={`text-xs font-bold ${DIFF_COLORS[mission.difficulty] || 'text-white'}`}>
          {mission.difficulty}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-orbitron text-sm font-bold text-white group-hover:text-neon-cyan transition-colors truncate">
          {mission.title}
        </h3>
        <p className="text-slate-500 text-xs mt-1 line-clamp-2">{mission.description}</p>

        <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
          <span className="flex items-center gap-1"><Target size={10} /> {mission.objective?.type}</span>
          <span className="capitalize flex items-center gap-1"><Crosshair size={10} /> {mission.recommendedShipClass}</span>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-1 mt-2">
          {[1, 2, 3].map(s => (
            <Star
              key={s}
              size={12}
              className={mission.stars >= s ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700'}
            />
          ))}
          {mission.highestScore > 0 && (
            <span className="ml-auto text-xs text-slate-500 font-mono">
              {mission.highestScore.toLocaleString()}
            </span>
          )}
        </div>

        {/* Rewards */}
        <div className="flex items-center gap-3 mt-3 text-xs border-t border-slate-700/50 pt-3">
          <span className="text-yellow-400">+{mission.rewards?.credits}¢</span>
          <span className="text-neon-cyan flex items-center gap-0.5"><Zap size={9} />{mission.rewards?.energyCores}</span>
          <span className="text-neon-purple flex items-center gap-0.5"><Shield size={9} />{mission.rewards?.veloopCoins}</span>
          <span className="ml-auto">
            {!mission.isUnlocked ? (
              <Lock size={13} className="text-slate-600" />
            ) : (
              <ChevronRight size={13} className="text-neon-cyan group-hover:translate-x-1 transition-transform" />
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MissionsPage;
