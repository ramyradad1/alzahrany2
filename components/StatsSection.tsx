import React, { useState, useEffect, useRef } from 'react';
import { Translations } from '../types';

interface StatsSectionProps {
  t: Translations;
}

// Custom Hook for Count Up Animation
const useCountUp = (end: number, duration: number = 2000, trigger: boolean) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // EaseOutExpo easing function for realistic deceleration
      const ease = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      
      setCount(Math.floor(end * ease));

      if (progress < duration) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration, trigger]);

  return count;
};

// Sub-component for individual stat item
const StatItem: React.FC<{ 
  value: number; 
  label: string; 
  suffix?: string; 
  prefix?: string;
  trigger: boolean;
}> = ({ value, label, suffix = '', prefix = '', trigger }) => {
  const count = useCountUp(value, 2500, trigger);

  return (
    <div className="flex flex-col items-center justify-center p-6 transition-transform hover:scale-105 duration-300">
      <div className="text-4xl md:text-5xl font-black text-white mb-2 font-mono tracking-tight flex items-baseline">
        <span className="text-cyan-500 mr-1">{prefix}</span>
        {count}
        <span className="text-cyan-500 ml-1">{suffix}</span>
      </div>
      <div className="text-sm md:text-base font-bold text-slate-400 uppercase tracking-widest text-center">
        {label}
      </div>
    </div>
  );
};

export const StatsSection: React.FC<StatsSectionProps> = ({ t }) => {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect(); // Trigger once
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div 
        ref={sectionRef}
        className="bg-slate-900 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl border border-slate-800"
      >
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x-0 md:divide-x divide-slate-800/50">
          <StatItem value={500} label={t.statProducts} suffix="+" trigger={inView} />
          <StatItem value={30} label={t.statCountries} suffix="+" trigger={inView} />
          
          {/* Static rendering for non-numeric complex strings, or mapped to numeric if applicable. 
              Here we handle '24/7' and 'ISO' slightly differently visually to match style */}
          <div className="flex flex-col items-center justify-center p-6 transition-transform hover:scale-105 duration-300">
             <div className="text-4xl md:text-5xl font-black text-white mb-2 font-mono tracking-tight">
               24<span className="text-cyan-500">/</span>7
             </div>
             <div className="text-sm md:text-base font-bold text-slate-400 uppercase tracking-widest text-center">
               {t.statSupport}
             </div>
          </div>

           <div className="flex flex-col items-center justify-center p-6 transition-transform hover:scale-105 duration-300">
             <div className="text-2xl md:text-3xl font-black text-white mb-2 font-mono tracking-tight mt-2 md:mt-0">
               ISO <span className="text-cyan-500">9001</span>
             </div>
             <div className="text-sm md:text-base font-bold text-slate-400 uppercase tracking-widest text-center">
               Certified
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};