import React, { useState, useEffect } from 'react';
import { CachedImage } from '../components/common/CachedImage';
import { ArrowRight, ChevronDown, ArrowLeft } from 'lucide-react';
import { Translations, Language, HeroContent as BaseHeroContent } from '../types';

interface HeroContent extends BaseHeroContent {
  opacity?: number;
}

interface HeroProps {
  t: Translations;
  lang: Language;
  onShopNow: () => void;
  content?: HeroContent;
}

export const Hero: React.FC<HeroProps> = ({ t, lang, onShopNow, content }) => {
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

  const title = (lang === 'en' ? content?.title_en : content?.title_ar) || (lang === 'en' ? 'Science Evolved' : 'تطور العلوم');
  const subtitle = (lang === 'en' ? content?.subtitle_en : content?.subtitle_ar) || t.heroSubtitle;
  const btnText = (lang === 'en' ? content?.button_text_en : content?.button_text_ar) || t.heroButton;

  // Split title for effect if it matches default, otherwise show full
  const isDefaultTitle = !content?.title_en && !content?.title_ar;

  return (
    <div className="relative bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden min-h-[600px] md:min-h-[800px] flex items-center transition-colors duration-500 perspective-1000">

      {/* Background Layer */}
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <CachedImage
          src={content?.image || '/images/hero-background.jpeg'}
          alt="Hero Background"
          className={`w-full h-full object-cover scale-105 transition-all duration-700 ${content?.opacity
            ? ''
            : 'opacity-50 dark:opacity-60 blur-[1px]'
            }`}
          style={{ opacity: content?.opacity }}
        />
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-slate-50/50 to-slate-50 dark:from-slate-950/80 dark:via-slate-950/50 dark:to-slate-950"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50/50 via-transparent to-slate-50/50 dark:from-slate-950/50 dark:via-transparent dark:to-slate-950/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-5xl mx-auto text-center">

          {/* Brand Badge */}
          <div className="inline-flex items-center px-5 py-2.5 mb-10 text-sm font-bold tracking-widest text-cyan-600 dark:text-cyan-400 uppercase bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-full backdrop-blur-md animate-fade-in-up shadow-xl shadow-cyan-900/5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 mr-3 rtl:ml-3 rtl:mr-0 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.6)]"></span>
            {lang === 'en' ? (
              <span dir="ltr">Arkan<span className="text-slate-900 dark:text-white">Lab</span></span>
            ) : (
                <span>أركان لاب</span>
            )}
          </div>

          <h1
            className="text-4xl md:text-6xl lg:text-8xl font-black mb-10 leading-[1.1] tracking-tight animate-fade-in-up delay-100"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-cyan-800 to-cyan-600 dark:from-white dark:via-cyan-200 dark:to-cyan-500">
              Arkan-Labtech
            </span>
          </h1>

          <p
            className="text-lg md:text-2xl text-slate-600 dark:text-slate-300 mb-10 md:mb-14 leading-relaxed max-w-3xl mx-auto animate-fade-in-up font-medium px-4 delay-200"
          >
            <span className="block font-bold mb-4 tracking-wider text-slate-800 dark:text-cyan-400">CHEMICALS - GLASSWARE - EQUIPMENT</span>
            A pioneer distributor in the field of Chemicals, Laboratory, and Medical Instruments as well as Consumables & Diagnostics in the Kingdom of Saudi Arabia.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up delay-300"
          >
            <button
              onClick={onShopNow}
              className="px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-lg transition-all shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-1 flex items-center group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                {btnText}
                {lang === 'en' ? (
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                ) : (
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                )}
              </span>
              <div className="absolute inset-0 bg-cyan-600 dark:bg-cyan-400 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>


          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 w-full flex justify-center z-20 text-slate-400 dark:text-slate-500 animate-bounce">
        <ChevronDown className="w-10 h-10 opacity-60 hover:opacity-100 transition-opacity cursor-pointer" onClick={onShopNow} />
      </div>
    </div>
  );
};
