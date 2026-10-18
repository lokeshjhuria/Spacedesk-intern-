import React from 'react';

interface StarBackgroundProps {
  className?: string;
}

// Pure CSS animated star field using absolutely positioned divs
const StarBackground: React.FC<StarBackgroundProps> = ({ className = '' }) => {
  const stars = React.useMemo(() => {
    return Array.from({ length: 120 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() < 0.8 ? 1 : Math.random() < 0.5 ? 2 : 3,
      opacity: 0.2 + Math.random() * 0.8,
      animDuration: `${2 + Math.random() * 5}s`,
      animDelay: `${Math.random() * 5}s`
    }));
  }, []);

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`} style={{ zIndex: 0 }}>
      {/* Deep space gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#030712] via-[#070d1e] to-[#0c1633]" />

      {/* Nebula blobs */}
      <div className="absolute top-1/4 left-1/5 w-96 h-96 rounded-full blur-3xl opacity-8"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-10"
        style={{ background: 'radial-gradient(circle, rgba(14,116,144,0.15) 0%, transparent 70%)' }} />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-3xl opacity-8"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)' }} />

      {/* Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            backgroundColor: '#ffffff',
            opacity: star.opacity,
            animation: `pulse ${star.animDuration} ease-in-out ${star.animDelay} infinite alternate`
          }}
        />
      ))}

      <style>{`
        @keyframes pulse {
          from { opacity: 0.1; }
          to { opacity: 0.9; }
        }
      `}</style>
    </div>
  );
};

export default StarBackground;
