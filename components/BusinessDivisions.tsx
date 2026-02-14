import React from 'react';
import { 
  FlaskConical, 
  Factory, 
  FlaskRound, 
  Microscope, 
  TestTube, 
  Fuel 
} from 'lucide-react';

interface BusinessDivisionProps {
  t: any;
  lang: 'en' | 'ar';
}

export const BusinessDivisions: React.FC<BusinessDivisionProps> = ({ t, lang }) => {
  const divisions = [
    {
      id: 1,
      name_en: 'Laboratory chemicals',
      name_ar: 'الكيماويات المعملية',
      icon: FlaskConical,
    },
    {
      id: 2,
      name_en: 'Industrial chemicals',
      name_ar: 'الكيماويات الصناعية',
      icon: Factory,
    },
    {
      id: 3,
      name_en: 'Laboratory Glassware',
      name_ar: 'الزجاجيات المعملية',
      icon: FlaskRound,
    },
    {
      id: 4,
      name_en: 'Laboratory Equipment',
      name_ar: 'المعدات المعملية',
      icon: Microscope,
    },
    {
      id: 5,
      name_en: 'Laboratory Plasticware',
      name_ar: 'البلاستيكيات المعملية',
      icon: TestTube,
    },
    {
      id: 6,
      name_en: 'Laboratory in Oil & Gas',
      name_ar: 'معامل النفط والغاز',
      icon: Fuel,
    },
  ];

  return (
    <section className="relative w-full py-20 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/custom.jpeg"
          alt=""
          className="w-full h-full object-cover blur-[2px]"
        />
        <div className="absolute inset-0 bg-white/20 dark:bg-slate-900/20"></div>
      </div>
      {/* Background Geometric Shapes */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        {/* Top Left Teal Triangle */}
        <div 
            className="absolute top-0 left-0 w-0 h-0 border-t-[150px] border-r-[150px] border-t-[#0e7490] border-r-transparent" 
            aria-hidden="true"
        />
        {/* Large Diagonal Shape */}
        <div 
            className="absolute top-0 right-0 w-[80%] h-full bg-slate-50 transform skew-x-[-20deg] origin-top-right z-[-1] opacity-50"
        />
        {/* Bottom Right Blue Accents */}
        <div 
            className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"
        />
        <div 
            className="absolute top-0 -left-4 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"
        />
         {/* Bottom Overlay Gradient */}
         <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="mb-16">
          <div className="flex flex-col items-start">
             {/* Logo / Title */}
            <div className={`flex flex-col ${lang === 'ar' ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2">
                     {/* Hexagon Logo Placeholder - implied from image if needed, or just text */}
                    <div className="relative">
                         <h2 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight">
                            Arkan <span className="text-[#0e7490]">Labtech</span>
                  </h2>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12">
          {divisions.map((division) => {
            const Icon = division.icon;
            return (
              <div 
                key={division.id} 
                className="group flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300"
              >
                {/* Icon Container */}
                <div className="mb-4 relative">
                    <Icon 
                        strokeWidth={1.5} 
                    className="w-16 h-16 text-slate-800 dark:text-white group-hover:text-[#0e7490] dark:group-hover:text-[#0e7490] transition-colors duration-300" 
                    />
                    {/* Subtle glow on hover */}
                     <div className="absolute inset-0 bg-[#0e7490]/10 rounded-full scale-0 group-hover:scale-150 transition-transform duration-300 opacity-0 group-hover:opacity-100 -z-10 blur-md"></div>
                </div>
                
                {/* Text */}
                <h3 className="text-xl md:text-2xl font-medium text-slate-900 dark:text-white leading-snug max-w-[200px]">
                  {lang === 'en' ? division.name_en : division.name_ar}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
