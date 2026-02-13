import React, { useState } from 'react';
import { ShieldCheck, Globe, Microscope, Send, CheckCircle2 } from 'lucide-react';
import { Translations, AboutContent, Language } from '../types';
import { StatsSection } from './StatsSection';

interface AboutProps {
  t: Translations;
  content?: AboutContent;
  lang?: Language;
}

export const About: React.FC<AboutProps> = ({ t, content, lang = 'en' }) => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { name, email, subject, message } = formState;
    const whatsappMessage = `*Name:* ${name}%0a*Email:* ${email}%0a*Subject:* ${subject}%0a*Message:* ${message}`;
    const whatsappUrl = `https://wa.me/966575818827?text=${whatsappMessage}`;

    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');

    setIsSubmitting(false);
    setIsSent(true);
    setFormState({ name: '', email: '', subject: '', message: '' });

    // Reset success message
    setTimeout(() => setIsSent(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  // Resolve Content
  const mainTitle = (lang === 'en' ? content?.title_en : content?.title_ar) || t.aboutTitle;

  const missionTitle = (lang === 'en' ? content?.mission_title_en : content?.mission_title_ar) || t.aboutMission;
  const missionText = (lang === 'en' ? content?.mission_text_en : content?.mission_text_ar) || t.aboutMissionText;

  const qualityTitle = (lang === 'en' ? content?.quality_title_en : content?.quality_title_ar) || t.aboutQuality;
  const qualityText = (lang === 'en' ? content?.quality_text_en : content?.quality_text_ar) || t.aboutQualityText;

  const globalTitle = (lang === 'en' ? content?.global_title_en : content?.global_title_ar) || t.aboutGlobal;
  const globalText = (lang === 'en' ? content?.global_text_en : content?.global_text_ar) || t.aboutGlobalText;


  // Timeline Data
  const TIMELINE_EVENTS = [
    { year: '2010', title: t.history2010, desc: t.history2010Desc },
    { year: '2015', title: t.history2015, desc: t.history2015Desc },
    { year: '2020', title: t.history2020, desc: t.history2020Desc },
    { year: '2024', title: t.history2024, desc: t.history2024Desc },
  ];

  return (
    <div id="about" className="container mx-auto px-4 py-10 md:py-16 animate-fade-in-up text-left rtl:text-right">

      {/* Header */}
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
          {mainTitle}
        </h2>
        <div className="h-1.5 w-24 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto rounded-full mb-8"></div>
        <div className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed space-y-4">
          <p>
            It is a pleasure to introduce Arkan. As a pioneer distributor in the field of Chemicals, Laboratory, and Medical Instruments as well as Consumables & Diagnostics with pertaining instruments. Our highly qualified Sales team at our central office covered the whole area market of Saudi Arabia. We have created an excellent business relationship with all customers whether at common or private sectors.
          </p>
          <p>
            The healthcare and laboratory industry has undergone significant changes as well as consumer expectations, Arkan has been able to attain market leadership in providing Laboratory technology and solutions in the Kingdom of Saudi Arabia.
          </p>
          <p>
            Arkan has been able to support public and private sectors including various institutions in the industrial, medical, and other industries in the country as well as the Saudi Arabian government in its many projects. Unlike its other competitors in the same sector, Arkan is revitalizing itself to adapt to the changing economic and political situation in the country while continuously probing the market to maintain its current leadership and to promote itself to be distinguished as an advanced and innovative company in its sector.
          </p>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">

        {/* Card 1: Mission */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 hover:border-cyan-500/50 transition-all duration-300 group">
          <div className="w-14 h-14 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Microscope className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Mission</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Guaranteed production performance and offering end-to-end solutions that would exceed expectations of clients, maintaining the product quality and not quantity, aim to convey our client's investment for every product we offer with the best value at all times. To all of our clients, we provide all of the laboratory and process requirements under one roof.
          </p>
        </div>

        {/* Card 2: Quality */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 hover:border-cyan-500/50 transition-all duration-300 group">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Vision</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            To be a major supplier for laboratories, Analytical, Scientific and process solutions in the Saudi Arabian market.
          </p>
        </div>

        {/* Card 3: Global */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 hover:border-cyan-500/50 transition-all duration-300 group">
          <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Globe className="w-7 h-7 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{globalTitle}</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {globalText}
          </p>
        </div>
      </div>

      {/* History Timeline Section */}
      <div className="mb-24 relative">
        <h3 className="text-3xl font-bold text-center mb-16 text-slate-900 dark:text-white">{t.aboutHistory}</h3>

        <div className="max-w-3xl mx-auto relative px-4">
          {/* Vertical Center Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent md:-translate-x-1/2"></div>

          <div className="space-y-12">
            {TIMELINE_EVENTS.map((event, index) => (
              <div key={index} className={`relative flex flex-col md:flex-row gap-8 md:gap-0 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''} items-start md:items-center group`}>

                {/* Timeline Dot */}
                <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-white dark:bg-slate-900 border-4 border-cyan-500 rounded-full md:-translate-x-1/2 z-10 shadow-[0_0_15px_rgba(6,182,212,0.5)] group-hover:scale-125 transition-transform duration-300 mt-1.5 md:mt-0"></div>

                {/* Content Spacer */}
                <div className="w-full md:w-1/2"></div>

                {/* Content Box */}
                <div className="w-full md:w-1/2 pl-12 md:pl-0 md:px-10">
                  <div className={`p-6 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 relative ${index % 2 === 0 ? 'md:text-left' : 'md:text-right rtl:md:text-left'}`}>
                    <span className="inline-block px-3 py-1 mb-2 text-sm font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 rounded-full">
                      {event.year}
                    </span>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{event.title}</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                      {event.desc}
                    </p>

                    {/* Arrow connecting to line */}
                    <div className={`hidden md:block absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-slate-800/50 border-t border-r border-slate-100 dark:border-slate-700 rotate-45 ${index % 2 === 0 ? '-right-2 border-r border-t bg-inherit' : '-left-2 border-l border-b bg-inherit rotate-[225deg]'}`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section Integrated */}
      <div className="mb-20">
        <StatsSection t={t} />
      </div>

    </div>
  );
};
