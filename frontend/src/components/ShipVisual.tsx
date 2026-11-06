import React from 'react';

export type ShipClassType = 'interceptor' | 'guardian' | 'destroyer' | 'phantom' | 'nova';

interface ShipVisualProps {
  shipClass: string;
  size?: number; // width/height in px
  className?: string;
  animated?: boolean;
}

export const ShipVisual: React.FC<ShipVisualProps> = ({
  shipClass,
  size = 120,
  className = '',
  animated = true
}) => {
  const normalizedClass = (shipClass || 'interceptor').toLowerCase();

  switch (normalizedClass) {
    case 'guardian':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 160 160"
          className={`drop-shadow-[0_0_16px_rgba(59,130,246,0.6)] ${className}`}
        >
          <defs>
            <linearGradient id="guard-hull" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="50%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
            <linearGradient id="guard-armor" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#93c5fd" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="shield-core" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
          </defs>

          {/* Engine Thruster Glow */}
          <ellipse cx="64" cy="142" rx="6" ry="14" fill="#38bdf8" opacity="0.8" className={animated ? 'animate-pulse' : ''} />
          <ellipse cx="96" cy="142" rx="6" ry="14" fill="#38bdf8" opacity="0.8" className={animated ? 'animate-pulse' : ''} />
          <ellipse cx="80" cy="145" rx="8" ry="18" fill="#60a5fa" opacity="0.9" className={animated ? 'animate-pulse' : ''} />

          {/* Outer Shield Deflector Wings */}
          <polygon points="80,18 24,76 36,132 58,118 70,136" fill="url(#guard-hull)" stroke="#93c5fd" strokeWidth="2" />
          <polygon points="80,18 136,76 124,132 102,118 90,136" fill="url(#guard-hull)" stroke="#93c5fd" strokeWidth="2" />

          {/* Heavy Armored Pylons */}
          <polygon points="28,82 14,124 38,128 46,94" fill="#1e40af" stroke="#60a5fa" strokeWidth="1.5" />
          <polygon points="132,82 146,124 122,128 114,94" fill="#1e40af" stroke="#60a5fa" strokeWidth="1.5" />

          {/* Central Bastion Core */}
          <polygon points="80,24 54,72 58,136 80,144 102,136 106,72" fill="url(#guard-armor)" stroke="#bfdbfe" strokeWidth="2" />

          {/* Aegis Hexagonal Crest */}
          <polygon points="80,48 94,62 94,84 80,96 66,84 66,62" fill="url(#shield-core)" opacity="0.85" />
          <circle cx="80" cy="72" r="7" fill="#ffffff" opacity="0.95" />

          {/* Reinforced Cockpit Armor */}
          <polygon points="80,32 72,52 88,52" fill="#0284c7" opacity="0.9" />
          <line x1="80" y1="96" x2="80" y2="138" stroke="#93c5fd" strokeWidth="2" strokeDasharray="3,3" />
        </svg>
      );

    case 'destroyer':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 160 160"
          className={`drop-shadow-[0_0_18px_rgba(239,68,68,0.7)] ${className}`}
        >
          <defs>
            <linearGradient id="dest-hull" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="40%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#450a0a" />
            </linearGradient>
            <linearGradient id="dest-cannons" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>

          {/* Twin Heavy Afterburners */}
          <ellipse cx="56" cy="146" rx="7" ry="18" fill="#f97316" opacity="0.9" className={animated ? 'animate-pulse' : ''} />
          <ellipse cx="104" cy="146" rx="7" ry="18" fill="#f97316" opacity="0.9" className={animated ? 'animate-pulse' : ''} />
          <ellipse cx="80" cy="148" rx="10" ry="22" fill="#ef4444" opacity="0.8" className={animated ? 'animate-pulse' : ''} />

          {/* Heavy Railgun Long Barrels */}
          <rect x="42" y="16" width="6" height="74" fill="#374151" stroke="#f87171" strokeWidth="1" />
          <rect x="112" y="16" width="6" height="74" fill="#374151" stroke="#f87171" strokeWidth="1" />
          <circle cx="45" cy="16" r="4" fill="#facc15" />
          <circle cx="115" cy="16" r="4" fill="#facc15" />

          {/* Aggressive Forward Sweep Wings */}
          <polygon points="80,28 18,92 24,136 50,118 70,132" fill="url(#dest-hull)" stroke="#fca5a5" strokeWidth="2" />
          <polygon points="80,28 142,92 136,136 110,118 90,132" fill="url(#dest-hull)" stroke="#fca5a5" strokeWidth="2" />

          {/* Forward Ramming Blades */}
          <polygon points="80,12 62,60 80,48 98,60" fill="#991b1b" stroke="#f87171" strokeWidth="2" />

          {/* Heavy Central Fuselage */}
          <polygon points="80,36 58,78 64,142 80,148 96,142 102,78" fill="#1f2937" stroke="#ef4444" strokeWidth="2" />

          {/* Core Plasma Reactor Glow */}
          <polygon points="80,64 70,88 90,88" fill="#f97316" />
          <line x1="58" y1="96" x2="102" y2="96" stroke="#ef4444" strokeWidth="2" />
          <line x1="62" y1="112" x2="98" y2="112" stroke="#f97316" strokeWidth="2" />
        </svg>
      );

    case 'phantom':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 160 160"
          className={`drop-shadow-[0_0_18px_rgba(168,85,247,0.7)] ${className}`}
        >
          <defs>
            <linearGradient id="phant-hull" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="45%" stopColor="#7e22ce" />
              <stop offset="100%" stopColor="#1e1035" />
            </linearGradient>
            <linearGradient id="void-core" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e879f9" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>

          {/* Phase-Shift Thrusters */}
          <ellipse cx="80" cy="144" rx="12" ry="20" fill="#a855f7" opacity="0.8" className={animated ? 'animate-pulse' : ''} />
          <ellipse cx="80" cy="144" rx="6" ry="12" fill="#f0abfc" opacity="0.95" />

          {/* Diamond Stealth Wing Geometry */}
          <polygon points="80,10 14,84 46,134 80,116 114,134 146,84" fill="url(#phant-hull)" stroke="#d8b4fe" strokeWidth="2" />

          {/* Inner Phase Cutouts */}
          <polygon points="80,26 38,82 56,118 80,102 104,118 122,82" fill="#180b2b" stroke="#a855f7" strokeWidth="1.5" />

          {/* Central Crystalline Needle */}
          <polygon points="80,18 72,68 80,126 88,68" fill="url(#void-core)" stroke="#f5d0fe" strokeWidth="1.5" />

          {/* Stealth Wings Serrations */}
          <line x1="26" y1="88" x2="48" y2="104" stroke="#e879f9" strokeWidth="1.5" />
          <line x1="134" y1="88" x2="112" y2="104" stroke="#e879f9" strokeWidth="1.5" />
        </svg>
      );

    case 'nova':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 160 160"
          className={`drop-shadow-[0_0_20px_rgba(245,158,11,0.8)] ${className}`}
        >
          <defs>
            <linearGradient id="nova-hull" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <radialGradient id="nova-star" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#ea580c" />
            </radialGradient>
          </defs>

          {/* Tri-Engine Solar Plume */}
          <ellipse cx="60" cy="144" rx="6" ry="16" fill="#facc15" opacity="0.9" className={animated ? 'animate-pulse' : ''} />
          <ellipse cx="100" cy="144" rx="6" ry="16" fill="#facc15" opacity="0.9" className={animated ? 'animate-pulse' : ''} />
          <ellipse cx="80" cy="148" rx="10" ry="24" fill="#fb923c" opacity="0.9" className={animated ? 'animate-pulse' : ''} />

          {/* Expansive Vanguard Solar Wings */}
          <polygon points="80,14 10,72 28,136 60,118 74,138" fill="url(#nova-hull)" stroke="#fef08a" strokeWidth="2" />
          <polygon points="80,14 150,72 132,136 100,118 86,138" fill="url(#nova-hull)" stroke="#fef08a" strokeWidth="2" />

          {/* Wingtip Solar Capacitors */}
          <polygon points="10,72 2,104 22,112 28,88" fill="#ea580c" stroke="#fde047" strokeWidth="1.5" />
          <polygon points="150,72 158,104 138,112 132,88" fill="#ea580c" stroke="#fde047" strokeWidth="1.5" />

          {/* Central High-Command Spine */}
          <polygon points="80,20 62,64 68,142 80,148 92,142 98,64" fill="#451a03" stroke="#f59e0b" strokeWidth="2" />

          {/* Mini Supernova Core */}
          <circle cx="80" cy="74" r="14" fill="url(#nova-star)" stroke="#ffffff" strokeWidth="2" className={animated ? 'animate-spin' : ''} style={{ transformOrigin: '80px 74px', animationDuration: '6s' }} />

          {/* Lance Prow */}
          <polygon points="80,8 74,32 86,32" fill="#ffffff" />
        </svg>
      );

    case 'interceptor':
    default:
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 160 160"
          className={`drop-shadow-[0_0_18px_rgba(0,246,255,0.7)] ${className}`}
        >
          <defs>
            <linearGradient id="inter-hull" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a5f3fc" />
              <stop offset="40%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#083344" />
            </linearGradient>
            <linearGradient id="cockpit-glass" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="100%" stopColor="#0e7490" />
            </linearGradient>
          </defs>

          {/* Twin Plasma Thrusters */}
          <ellipse cx="64" cy="144" rx="6" ry="16" fill="#00f6ff" opacity="0.9" className={animated ? 'animate-pulse' : ''} />
          <ellipse cx="96" cy="144" rx="6" ry="16" fill="#00f6ff" opacity="0.9" className={animated ? 'animate-pulse' : ''} />
          <ellipse cx="80" cy="146" rx="8" ry="20" fill="#38bdf8" opacity="0.8" className={animated ? 'animate-pulse' : ''} />

          {/* Dual Laser Blaster Barrels */}
          <rect x="36" y="44" width="4" height="42" fill="#334155" stroke="#00f6ff" strokeWidth="1" />
          <rect x="120" y="44" width="4" height="42" fill="#334155" stroke="#00f6ff" strokeWidth="1" />
          <circle cx="38" cy="44" r="3" fill="#00f6ff" />
          <circle cx="122" cy="44" r="3" fill="#00f6ff" />

          {/* Swept-Forward Aerodynamic Wings */}
          <polygon points="80,18 20,84 32,132 58,114 74,136" fill="url(#inter-hull)" stroke="#67e8f9" strokeWidth="2" />
          <polygon points="80,18 140,84 128,132 102,114 86,136" fill="url(#inter-hull)" stroke="#67e8f9" strokeWidth="2" />

          {/* Needle Nose Cone */}
          <polygon points="80,10 68,52 80,44 92,52" fill="#0891b2" stroke="#a5f3fc" strokeWidth="1.5" />

          {/* Main Fuselage Body */}
          <polygon points="80,30 60,76 66,138 80,144 94,138 100,76" fill="#0f172a" stroke="#00f6ff" strokeWidth="2" />

          {/* Cockpit Canopy */}
          <polygon points="80,48 72,74 80,82 88,74" fill="url(#cockpit-glass)" stroke="#ffffff" strokeWidth="1.5" opacity="0.95" />
          <ellipse cx="80" cy="62" rx="4" ry="8" fill="#ffffff" opacity="0.7" />

          {/* Wing Neon Accents */}
          <line x1="48" y1="84" x2="68" y2="108" stroke="#00f6ff" strokeWidth="2" />
          <line x1="112" y1="84" x2="92" y2="108" stroke="#00f6ff" strokeWidth="2" />
        </svg>
      );
  }
};

export default ShipVisual;
