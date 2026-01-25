import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronDown, ArrowLeft } from 'lucide-react';
import { Translations, Language } from '../types';

interface HeroProps {
  t: Translations;
  lang: Language;
  onShopNow: () => void;
}

export const Hero: React.FC<HeroProps> = ({ t, lang, onShopNow }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized mouse position (-1 to 1)
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden min-h-[700px] flex items-center transition-colors duration-500 perspective-1000">

      {/* Interactive Background Grid Layer */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-20 dark:opacity-30 transition-transform duration-100 ease-out"
        style={{
          transform: `rotateX(${mousePos.y * 5}deg) rotateY(${mousePos.x * 5}deg) scale(1.1)`,
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_50%,rgba(6,182,212,0.1),transparent)]"></div>
      </div>

      {/* Floating Orbs with Parallax */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 rtl:right-1/4 rtl:left-auto w-72 h-72 bg-cyan-400/30 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-float transition-transform duration-300"
          style={{ transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -30}px)` }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 rtl:left-1/4 rtl:right-auto w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-float-delayed transition-transform duration-300"
          style={{ transform: `translate(${mousePos.x * 40}px, ${mousePos.y * 40}px)` }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 mb-8 text-sm font-bold tracking-wider text-cyan-600 dark:text-cyan-400 uppercase bg-cyan-100/50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800 rounded-full backdrop-blur-sm animate-fade-in-up shadow-lg shadow-cyan-500/20">
            <span className="w-2 h-2 rounded-full bg-cyan-500 mr-2 rtl:ml-2 rtl:mr-0 animate-pulse"></span>
            Alzah<span className="text-cyan-600 dark:text-cyan-400">rany</span>
          </div>

          <h1
            className="text-5xl md:text-8xl font-black mb-8 leading-tight tracking-tight animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            {lang === 'en' ? 'Science' : 'تطور'}
            <span className="mx-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-500">
              {lang === 'en' ? 'Evolved' : 'العلوم'}
            </span>
          </h1>

          <p
            className="text-lg md:text-2xl text-slate-600 dark:text-slate-300 mb-12 leading-relaxed max-w-2xl mx-auto animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            {t.heroSubtitle}
          </p>

          <div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            <button
              onClick={onShopNow}
              className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] hover:-translate-y-1 flex items-center group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                {t.heroButton}
                {lang === 'en' ? (
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                ) : (
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            <button
              onClick={onShopNow}
              className="px-8 py-4 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-lg transition-all backdrop-blur-sm hover:border-cyan-500/50 hover:shadow-lg"
            >
              {t.viewSpecs}
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-400 dark:text-slate-500 animate-bounce">
        <ChevronDown className="w-8 h-8 opacity-70" />
      </div>
    </div>
  );
};