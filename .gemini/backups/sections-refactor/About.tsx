import React, { useState } from 'react';
import { ShieldCheck, Globe, Microscope, Send, CheckCircle2 } from 'lucide-react';
import { Translations } from '../types';
import { StatsSection } from './StatsSection';

interface AboutProps {
  t: Translations;
}

export const About: React.FC<AboutProps> = ({ t }) => {
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
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      setFormState({ name: '', email: '', subject: '', message: '' });
      
      // Reset success message after 3 seconds
      setTimeout(() => setIsSent(false), 3000);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  // Timeline Data
  const TIMELINE_EVENTS = [
    { year: '2010', title: t.history2010, desc: t.history2010Desc },
    { year: '2015', title: t.history2015, desc: t.history2015Desc },
    { year: '2020', title: t.history2020, desc: t.history2020Desc },
    { year: '2024', title: t.history2024, desc: t.history2024Desc },
  ];

  return (
    <div id="about" className="container mx-auto px-4 py-16 animate-fade-in-up text-left rtl:text-right">
      
      {/* Header */}
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
          {t.aboutTitle}
        </h2>
        <div className="h-1.5 w-24 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto rounded-full mb-8"></div>
        <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
           Since 2010, Alzahrany has been at the forefront of laboratory innovation, bridging the gap between traditional chemistry and modern digital precision.
        </p>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        
        {/* Card 1: Mission */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 hover:border-cyan-500/50 transition-all duration-300 group">
          <div className="w-14 h-14 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Microscope className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t.aboutMission}</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {t.aboutMissionText}
          </p>
        </div>

        {/* Card 2: Quality */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 hover:border-cyan-500/50 transition-all duration-300 group">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t.aboutQuality}</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {t.aboutQualityText}
          </p>
        </div>

        {/* Card 3: Global */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 hover:border-cyan-500/50 transition-all duration-300 group">
          <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Globe className="w-7 h-7 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t.aboutGlobal}</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {t.aboutGlobalText}
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

      {/* Contact Form Section */}
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row">
        
        {/* Contact Info (Left Side) */}
        <div className="md:w-5/12 bg-slate-900 text-white p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 pointer-events-none"></div>
          
          {/* Decorative Window Controls (Top) */}
          <div className="relative z-10 mb-8 flex gap-2">
             <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-400 transition-colors"></div>
             <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-400 transition-colors"></div>
             <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-400 transition-colors"></div>
          </div>

          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-6">{t.contactUs}</h3>
            <p className="text-slate-300 mb-8 leading-relaxed">
              Have questions about our equipment or need a custom quote? Fill out the form and our team will get back to you within 24 hours.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 group">
                <div className="w-1 h-12 bg-cyan-500 rounded-full group-hover:h-16 transition-all duration-300"></div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Email</p>
                  <p className="font-medium group-hover:text-cyan-400 transition-colors">sales@alzahrany.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="w-1 h-12 bg-purple-500 rounded-full group-hover:h-16 transition-all duration-300"></div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Phone</p>
                  <p className="font-medium group-hover:text-purple-400 transition-colors">+1 (800) LAB-GEAR</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form (Right Side) */}
        <div className="md:w-7/12 p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.contactName}</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  value={formState.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.contactEmail}</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formState.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.contactSubject}</label>
              <input 
                type="text" 
                name="subject"
                required
                value={formState.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.contactMessage}</label>
              <textarea 
                name="message"
                required
                rows={4}
                value={formState.message}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none transition-all resize-none text-slate-900 dark:text-white"
              ></textarea>
            </div>
            
            <button 
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 ${
                isSent 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:-translate-y-1'
              } disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : isSent ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  {t.messageSent}
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  {t.sendMessage}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
