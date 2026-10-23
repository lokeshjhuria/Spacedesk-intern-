import React, { useEffect, useRef, useState } from 'react';

interface PatrolFighter {
  id: number;
  type: 'interceptor' | 'destroyer' | 'phantom';
  x: number;
  y: number;
  speed: number;
  angle: number;
  scale: number;
  targetX: number;
  targetY: number;
  trailColor: string;
}

export const FighterJetFleetOverlay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fightersRef = useRef<PatrolFighter[]>([]);
  const mouseRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const [interactiveAlert, setInteractiveAlert] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Initialize 4 sleek orbital patrol fighter jets
    fightersRef.current = [
      {
        id: 1,
        type: 'interceptor',
        x: -100,
        y: height * 0.25,
        speed: 2.8,
        angle: 0.1,
        scale: 1,
        targetX: width * 0.7,
        targetY: height * 0.35,
        trailColor: '#00f6ff'
      },
      {
        id: 2,
        type: 'phantom',
        x: width + 100,
        y: height * 0.65,
        speed: 2.3,
        angle: Math.PI,
        scale: 0.85,
        targetX: width * 0.2,
        targetY: height * 0.55,
        trailColor: '#a855f7'
      },
      {
        id: 3,
        type: 'destroyer',
        x: width * 0.4,
        y: -100,
        speed: 1.9,
        angle: Math.PI / 2,
        scale: 1.15,
        targetX: width * 0.5,
        targetY: height + 100,
        trailColor: '#38bdf8'
      },
      {
        id: 4,
        type: 'interceptor',
        x: -200,
        y: height * 0.8,
        speed: 3.2,
        angle: -0.15,
        scale: 0.75,
        targetX: width + 200,
        targetY: height * 0.75,
        trailColor: '#00e5a3'
      }
    ];

    // Historical trail positions for ion plasma engine exhaust
    const trails: Record<number, Array<{ x: number; y: number; alpha: number }>> = {
      1: [],
      2: [],
      3: [],
      4: []
    };

    // Draw procedural futuristic fighter jet silhouette with plasma glow
    const drawFighter = (fighter: PatrolFighter) => {
      ctx.save();
      ctx.translate(fighter.x, fighter.y);
      ctx.rotate(fighter.angle);
      ctx.scale(fighter.scale, fighter.scale);

      // Jet Glow Shadow
      ctx.shadowColor = fighter.trailColor;
      ctx.shadowBlur = 15;

      // Draw Jet Wings and Cockpit
      ctx.beginPath();
      // Nose cone
      ctx.moveTo(28, 0);
      // Right forward canard
      ctx.lineTo(12, 6);
      ctx.lineTo(6, 18);
      // Right swept main wing
      ctx.lineTo(-4, 24);
      ctx.lineTo(-12, 10);
      // Right engine nozzle
      ctx.lineTo(-20, 7);
      ctx.lineTo(-16, 0);
      // Left engine nozzle
      ctx.lineTo(-20, -7);
      ctx.lineTo(-12, -10);
      // Left swept main wing
      ctx.lineTo(-4, -24);
      ctx.lineTo(6, -18);
      // Left forward canard
      ctx.lineTo(12, -6);
      ctx.closePath();

      // Jet fuselage gradient
      const bodyGrad = ctx.createLinearGradient(-20, 0, 28, 0);
      bodyGrad.addColorStop(0, '#0a1428');
      bodyGrad.addColorStop(0.5, '#1e293b');
      bodyGrad.addColorStop(1, '#38bdf8');
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // Neon armor panel lines
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = fighter.trailColor;
      ctx.stroke();

      // Glowing Cockpit Canopy
      ctx.beginPath();
      ctx.ellipse(8, 0, 9, 3.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.fill();

      // Dual Engine Afterburner Thrusters
      ctx.shadowColor = fighter.trailColor;
      ctx.shadowBlur = 20;
      const thrusterLength = 12 + Math.random() * 8;

      // Upper engine plume
      ctx.beginPath();
      ctx.moveTo(-18, 5);
      ctx.lineTo(-18 - thrusterLength, 5);
      ctx.strokeStyle = fighter.trailColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Lower engine plume
      ctx.beginPath();
      ctx.moveTo(-18, -5);
      ctx.lineTo(-18 - thrusterLength, -5);
      ctx.strokeStyle = fighter.trailColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // White hot core
      ctx.beginPath();
      ctx.moveTo(-18, 5);
      ctx.lineTo(-18 - thrusterLength * 0.5, 5);
      ctx.moveTo(-18, -5);
      ctx.lineTo(-18 - thrusterLength * 0.5, -5);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.restore();
    };

    let tick = 0;
    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;

      fightersRef.current.forEach((fighter) => {
        // Record engine exhaust trail
        const trail = trails[fighter.id];
        if (tick % 2 === 0) {
          trail.push({ x: fighter.x, y: fighter.y, alpha: 0.65 });
          if (trail.length > 25) trail.shift();
        }

        // Draw Ion Plasma Trail
        for (let i = 0; i < trail.length - 1; i++) {
          const pt = trail[i];
          const nextPt = trail[i + 1];
          pt.alpha *= 0.94; // fade over time

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(nextPt.x, nextPt.y);
          ctx.strokeStyle = fighter.trailColor;
          ctx.lineWidth = (i / trail.length) * 3.5;
          ctx.globalAlpha = pt.alpha;
          ctx.shadowColor = fighter.trailColor;
          ctx.shadowBlur = 12;
          ctx.stroke();
          ctx.restore();
        }

        // Behavior: Avoid mouse or cruise gracefully across viewport
        const dxToMouse = mouse.x - fighter.x;
        const dyToMouse = mouse.y - fighter.y;
        const distToMouse = Math.sqrt(dxToMouse * dxToMouse + dyToMouse * dyToMouse);

        let targetAngle = fighter.angle;

        // If mouse is near, execute evasive combat maneuver
        if (distToMouse < 180 && distToMouse > 0) {
          targetAngle = Math.atan2(-dyToMouse, -dxToMouse);
          fighter.speed = Math.min(fighter.speed + 0.15, 6.5); // afterburner kick
        } else {
          // Cruise toward target waypoint
          const dx = fighter.targetX - fighter.x;
          const dy = fighter.targetY - fighter.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 80) {
            // Pick new random patrol coordinate on the screen perimeter
            fighter.targetX = Math.random() < 0.5 ? -150 : width + 150;
            fighter.targetY = Math.random() * height;
          }

          targetAngle = Math.atan2(dy, dx);
          fighter.speed += (2.4 - fighter.speed) * 0.05; // return to normal cruising speed
        }

        // Smooth angle interpolation (smooth steering turning radius)
        let angleDiff = targetAngle - fighter.angle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        fighter.angle += angleDiff * 0.045;

        // Advance position
        fighter.x += Math.cos(fighter.angle) * fighter.speed;
        fighter.y += Math.sin(fighter.angle) * fighter.speed;

        // Respawn if drifted too far off boundaries
        if (fighter.x > width + 250) {
          fighter.x = -150;
          fighter.y = Math.random() * height;
        } else if (fighter.x < -250) {
          fighter.x = width + 150;
          fighter.y = Math.random() * height;
        }
        if (fighter.y > height + 250) {
          fighter.y = -150;
          fighter.x = Math.random() * width;
        } else if (fighter.y < -250) {
          fighter.y = height + 150;
          fighter.x = Math.random() * width;
        }

        // Render the fighter
        drawFighter(fighter);
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 w-full h-full"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default FighterJetFleetOverlay;
