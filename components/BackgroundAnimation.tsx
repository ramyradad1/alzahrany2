import React, { useEffect, useRef } from 'react';
import { Hexagon, Circle } from 'lucide-react';

interface Particle {
  id: number;
  x: number; // Percent 0-100 (Home position)
  y: number; // Percent 0-100 (Home position)
  size: number;
  type: 'hex' | 'circle';
  opacity: number;
  color: string;
}

// Static definition of particles layout
const PARTICLES: Particle[] = [
  { id: 1, x: 10, y: 20, size: 40, type: 'hex', opacity: 0.1, color: 'text-cyan-500' },
  { id: 2, x: 85, y: 15, size: 60, type: 'circle', opacity: 0.05, color: 'text-blue-500' },
  { id: 3, x: 50, y: 50, size: 120, type: 'hex', opacity: 0.03, color: 'text-slate-400' },
  { id: 4, x: 20, y: 80, size: 30, type: 'circle', opacity: 0.08, color: 'text-cyan-600' },
  { id: 5, x: 80, y: 70, size: 50, type: 'hex', opacity: 0.06, color: 'text-purple-500' },
  { id: 6, x: 40, y: 30, size: 25, type: 'hex', opacity: 0.07, color: 'text-blue-400' },
  { id: 7, x: 70, y: 90, size: 45, type: 'circle', opacity: 0.04, color: 'text-emerald-500' },
  { id: 8, x: 5, y: 50, size: 20, type: 'hex', opacity: 0.05, color: 'text-cyan-400' },
  { id: 9, x: 95, y: 40, size: 35, type: 'hex', opacity: 0.06, color: 'text-slate-500' },
];

export const BackgroundAnimation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const particleRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Physics state for each particle: Current Offset (x,y) and Velocity (vx,vy)
  const physicsState = useRef(PARTICLES.map(() => ({ x: 0, y: 0, vx: 0, vy: 0 })));
  
  const mouse = useRef({ x: -1000, y: -1000 }); // Initialize off-screen
  const timeRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;

    const animate = () => {
      timeRef.current += 0.005; // Slower global drift

      // Animate Gradient Background (Subtle global shift)
      if (containerRef.current) {
         // Normalize mouse for background gradient shift
         const nx = (mouse.current.x / window.innerWidth) * 2 - 1;
         const ny = (mouse.current.y / window.innerHeight) * 2 - 1;
         containerRef.current.style.setProperty('--mouse-x', `${nx * 30}px`);
         containerRef.current.style.setProperty('--mouse-y', `${ny * 30}px`);
      }

      // Physics Loop for Particles
      particleRefs.current.forEach((el, index) => {
        if (!el) return;
        
        const p = PARTICLES[index];
        const state = physicsState.current[index];

        // 1. Calculate Particle's Screen "Home" Position (in pixels)
        const homeX = (p.x / 100) * window.innerWidth;
        const homeY = (p.y / 100) * window.innerHeight;
        
        // Current actual position on screen (Home + Offset)
        const currentX = homeX + state.x;
        const currentY = homeY + state.y;

        // 2. Repulsion Logic
        const dx = mouse.current.x - currentX;
        const dy = mouse.current.y - currentY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Interaction Radius: Increased to 350px for broader reactivity
        const radius = 350; 
        
        if (distance < radius) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          
          // Force strength increases closer to cursor
          const force = (radius - distance) / radius;
          
          // Apply Impulse (Negative to repel)
          // Significantly increased strength for "dynamic" feel
          const repulsionStrength = -2.0; 
          // Add instant velocity kick
          state.vx += forceDirectionX * force * repulsionStrength;
          state.vy += forceDirectionY * force * repulsionStrength;
        }

        // 3. Spring Force (Return to Home)
        // Weaker spring K allows particles to float away further before returning
        const springK = 0.01; 
        state.vx -= state.x * springK;
        state.vy -= state.y * springK;

        // 4. Friction (Decay)
        // 0.92 provides a nice slide that settles over ~1-2 seconds
        const friction = 0.92; 
        state.vx *= friction;
        state.vy *= friction;

        // 5. Update Position based on Velocity
        state.x += state.vx;
        state.y += state.vy;

        // 6. Organic Idle Drift (Sine wave)
        // Independent of physics state to ensure constant life
        const driftX = Math.sin(timeRef.current + index) * 20;
        const driftY = Math.cos(timeRef.current + index * 1.5) * 20;

        // Rotate based on horizontal movement
        const rotation = state.x * 0.15; 

        // Apply Transform using translate3d for GPU acceleration
        el.style.transform = `translate3d(${state.x + driftX}px, ${state.y + driftY}px, 0) rotate(${rotation}deg)`;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none transition-colors duration-500 bg-slate-50 dark:bg-slate-950"
    >
      {/* 1. Base Gradient Layer */}
      <div 
        className="absolute inset-0 opacity-40 dark:opacity-20 transition-transform duration-100 ease-out"
        style={{ transform: 'translate(var(--mouse-x, 0), var(--mouse-y, 0))' }}
      >
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-gradient-to-br from-cyan-200/40 to-transparent dark:from-cyan-900/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-tl from-blue-200/40 to-transparent dark:from-blue-900/30 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] left-[40%] w-[40%] h-[40%] bg-gradient-to-tr from-purple-200/30 to-transparent dark:from-purple-900/20 rounded-full blur-[150px]" />
      </div>

      {/* 2. Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 dark:opacity-10" />

      {/* 3. Dynamic Physics Particles Layer */}
      {PARTICLES.map((p, i) => (
        <div
          key={p.id}
          ref={(el) => { particleRefs.current[i] = el; }}
          className={`absolute ${p.color} transition-opacity duration-300`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            willChange: 'transform',
          }}
        >
          {p.type === 'hex' ? (
            <Hexagon strokeWidth={1.5} className="w-full h-full" />
          ) : (
            <Circle strokeWidth={1.5} className="w-full h-full" />
          )}
        </div>
      ))}
      
      {/* 4. Subtle Vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-slate-50/50 dark:to-slate-950/80" />
    </div>
  );
};
