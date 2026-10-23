import React, { useMemo } from 'react';
import FighterJetFleetOverlay from './FighterJetFleetOverlay';

interface StarBackgroundProps {
  className?: string;
  showFighters?: boolean;
}

const StarBackground: React.FC<StarBackgroundProps> = ({ className = '', showFighters = true }) => {
  const stars = useMemo(() => {
    return Array.from({ length: 140 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() < 0.75 ? 1.5 : Math.random() < 0.5 ? 2.5 : 3.5,
      opacity: 0.25 + Math.random() * 0.75,
      color: Math.random() < 0.25 ? '#38bdf8' : Math.random() < 0.15 ? '#c084fc' : '#ffffff',
      animDuration: `${2 + Math.random() * 4}s`,
      animDelay: `${Math.random() * 5}s`
    }));
  }, []);

  const shootingStars = useMemo(() => [
    { top: '15%', left: '80%', delay: '1s', duration: '6s' },
    { top: '45%', left: '60%', delay: '4s', duration: '8s' },
    { top: '25%', left: '20%', delay: '7s', duration: '7s' },
  ], []);

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`} style={{ zIndex: 0 }}>
      {/* Deep space base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#02040a] via-[#050a18] to-[#091024]" />

      {/* Floating Animated Nebula Clouds */}
      <div 
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-[120px] opacity-25 animate-float-slow"
        style={{ background: 'radial-gradient(circle, rgba(124, 58, 237, 0.45) 0%, rgba(0, 246, 255, 0.15) 50%, transparent 70%)' }}
      />
      <div 
        className="absolute top-1/2 -right-40 w-[550px] h-[550px] rounded-full blur-[130px] opacity-20 animate-float"
        style={{ background: 'radial-gradient(circle, rgba(0, 246, 255, 0.4) 0%, rgba(59, 130, 246, 0.15) 50%, transparent 70%)' }}
      />
      <div 
        className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] rounded-full blur-[110px] opacity-20 animate-pulse-slow"
        style={{ background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, rgba(168, 85, 247, 0.15) 60%, transparent 70%)' }}
      />

      {/* Grid overlay lines (subtle cyberpunk sci-fi grid) */}
      <div 
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: 'linear-gradient(to right, #00f6ff 1px, transparent 1px), linear-gradient(to bottom, #00f6ff 1px, transparent 1px)',
          backgroundSize: '64px 64px'
        }}
      />

      {/* Shooting Stars */}
      {shootingStars.map((s, idx) => (
        <div
          key={idx}
          className="absolute w-[120px] h-[1.5px] shooting-star"
          style={{
            top: s.top,
            left: s.left,
            background: 'linear-gradient(90deg, rgba(0,246,255,0.8), transparent)',
            animation: `shootingStarAnim ${s.duration} ease-in-out ${s.delay} infinite`,
            transform: 'rotate(-45deg)'
          }}
        />
      ))}

      {/* Twinkling Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: star.color,
            boxShadow: star.size > 2 ? `0 0 8px ${star.color}` : 'none',
            opacity: star.opacity,
            animation: `starPulse ${star.animDuration} ease-in-out ${star.animDelay} infinite alternate`
          }}
        />
      ))}

      <style>{`
        @keyframes starPulse {
          0% { opacity: 0.15; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes shootingStarAnim {
          0% { transform: translateX(0) translateY(0) rotate(-45deg); opacity: 0; }
          10% { opacity: 1; }
          25% { transform: translateX(-220px) translateY(220px) rotate(-45deg); opacity: 0; }
          100% { transform: translateX(-220px) translateY(220px) rotate(-45deg); opacity: 0; }
        }
      `}</style>

      {/* Interactive Fighter Jets Fleet Patrol Overlay */}
      {showFighters && <FighterJetFleetOverlay />}
    </div>
  );
};

export default StarBackground;