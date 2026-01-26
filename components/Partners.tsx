import React from 'react';
import { Partner, PartnersContent, Language } from '../types';

interface PartnersProps {
  partners: Partner[];
  title: string;
  content?: PartnersContent;
  lang?: Language;
}

export const Partners: React.FC<PartnersProps> = ({ partners, title, content, lang = 'en' }) => {
  if (partners.length === 0) return null;

  // Duplicate the list to create a seamless loop
  const displayPartners = [...partners, ...partners];

  const displayTitle = (lang === 'en' ? content?.title_en : content?.title_ar) || title;
  const subtitle = (lang === 'en' ? content?.subtitle_en : content?.subtitle_ar);

  return (
    <div id="partners" className="w-full py-16 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 overflow-hidden">
      <div className="container mx-auto px-4 mb-10 text-center">
        <h3 className="text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-2">
          {displayTitle}
        </h3>
        {subtitle && (
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>

      <div className="relative w-full overflow-hidden">
        {/* Gradients to fade edges */}
        <div className="absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10"></div>
        <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-10"></div>

        <div className="flex animate-scroll hover:pause-animation w-max">
          {displayPartners.map((partner, index) => (
            <div
              key={`${partner.id}-${index}`}
              className="flex-shrink-0 mx-8 md:mx-16 flex items-center justify-center transition-all duration-300 hover:scale-125 cursor-pointer"
            >
              <div className="h-16 w-32 md:h-20 md:w-40 flex items-center justify-center">
                {partner.logo ? (
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="max-h-full max-w-full object-contain grayscale-0"
                    title={partner.name}
                  />
                ) : (
                  <span className="text-xl font-black text-slate-300 dark:text-slate-600">{partner.name}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
        .pause-animation {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};
