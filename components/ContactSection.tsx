import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { Translations, Language, SectionContent } from '../types';

interface ContactSectionProps {
  t: Translations;
  lang: Language;
  content?: SectionContent;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ t, lang, content }) => {
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
    const messageText = `*Name:* ${name}\n*Email:* ${email}\n*Subject:* ${subject}\n*Message:* ${message}`;
    const whatsappUrl = `https://wa.me/966575818827?text=${encodeURIComponent(messageText)}`;

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

  return (
    <div id="contact_form" className="container mx-auto px-4 py-16 animate-fade-in-up text-left rtl:text-right">
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
                  <p className="font-medium group-hover:text-cyan-400 transition-colors">Sales@arkan-labtech.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="w-1 h-12 bg-purple-500 rounded-full group-hover:h-16 transition-all duration-300"></div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Phone</p>
                  <p className="font-medium group-hover:text-purple-400 transition-colors" dir="ltr">+966 57 581 8827</p>
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
                <label htmlFor="contact-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.contactName}</label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  required
                  value={formState.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.contactEmail}</label>
                <input
                  id="contact-email"
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
              <label htmlFor="contact-subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.contactSubject}</label>
              <input
                id="contact-subject"
                type="text"
                name="subject"
                required
                value={formState.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="contact-message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.contactMessage}</label>
              <textarea
                id="contact-message"
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
              className={`w-full py-4 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 ${isSent
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
