import React from 'react';
import { Facebook, Twitter, Linkedin, Instagram, MapPin, Phone, Mail } from 'lucide-react';
import { Section, Language } from '../types';

interface FooterProps {
    t: any;
    lang: Language;
    content?: any;
}

export const Footer: React.FC<FooterProps> = ({ t, lang, content }) => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 pt-20 pb-10 border-t border-slate-200 dark:border-slate-900 relative z-10">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">

                    {/* Brand Column */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                            <span className="font-bold text-2xl tracking-tighter">Arkan<span className="text-cyan-600 dark:text-cyan-400">Lab</span></span>
                        </div>
                        <p className="text-sm leading-relaxed max-w-sm font-medium">
                            Empowering scientific discovery with precision instruments, glassmorphic design, and cutting-edge laboratory solutions since 2010.
                        </p>
                        <div className="flex gap-3">
                            <SocialIcon icon={<Facebook className="w-4 h-4" />} href="#" />
                            <SocialIcon icon={<Twitter className="w-4 h-4" />} href="#" />
                            <SocialIcon icon={<Linkedin className="w-4 h-4" />} href="#" />
                            <SocialIcon icon={<Instagram className="w-4 h-4" />} href="#" />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="lg:col-span-2 lg:col-start-6">
                        <h3 className="text-slate-900 dark:text-white font-bold mb-6 text-sm uppercase tracking-wider">{lang === 'ar' ? 'روابط سريعة' : 'Quick Links'}</h3>
                        <ul className="space-y-3 text-sm">
                            <FooterLink label={lang === 'ar' ? 'الرئيسية' : 'Home'} href="/" />
                            <FooterLink label={t.catalog} href="/catalog" />
                            <FooterLink label={t.partners} href="/#partners" />
                            <FooterLink label={lang === 'ar' ? 'تمكين الاكتشاف' : 'Empowering Discovery'} href="/about" />
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div className="lg:col-span-2">
                        <h3 className="text-slate-900 dark:text-white font-bold mb-6 text-sm uppercase tracking-wider">{lang === 'ar' ? 'قانوني' : 'Legal'}</h3>
                        <ul className="space-y-3 text-sm">
                            <FooterLink label={lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'} href="#" />
                            <FooterLink label={lang === 'ar' ? 'شروط الخدمة' : 'Terms of Service'} href="#" />
                            <FooterLink label={lang === 'ar' ? 'لوحة التحكم' : 'Admin Panel'} href="/admin" />
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="lg:col-span-3">
                        <h3 className="text-slate-900 dark:text-white font-bold mb-6 text-sm uppercase tracking-wider">{lang === 'ar' ? 'تواصل معنا' : 'Contact Us'}</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex gap-4 items-start group">
                                <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg group-hover:bg-cyan-50 dark:group-hover:bg-cyan-900/20 transition-colors">
                                    <MapPin className="w-5 h-5 text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
                                </div>
                                <span>123 Science Park District,<br />King Abdullah Rd, Jeddah, KSA</span>
                            </li>
                            <li className="flex gap-4 items-center group">
                                <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg group-hover:bg-cyan-50 dark:group-hover:bg-cyan-900/20 transition-colors">
                                    <Phone className="w-5 h-5 text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
                                </div>
                                <span dir="ltr" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer">+966 57 581 8827</span>
                            </li>
                            <li className="flex gap-4 items-center group">
                                <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg group-hover:bg-cyan-50 dark:group-hover:bg-cyan-900/20 transition-colors">
                                    <Mail className="w-5 h-5 text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
                                </div>
                                <a href="mailto:Sales@arkan-labtech.com" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Sales@arkan-labtech.com</a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-200 dark:border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
                    <p>© {currentYear} Arkan Lab. All rights reserved.</p>
                    <p className="flex items-center gap-2">
                        Designed with
                        <span className="text-red-500">♥</span>
                        for Science
                    </p>
                </div>
            </div>
        </footer>
    );
};

const SocialIcon = ({ icon, href }: { icon: React.ReactNode; href: string }) => (
    <a
        href={href}
        className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-cyan-600 hover:text-white dark:hover:bg-cyan-500 transition-all transform hover:-translate-y-1 shadow-sm hover:shadow-cyan-500/30"
    >
        {icon}
    </a>
);

const FooterLink = ({ label, href }: { label: string; href: string }) => (
    <li>
        <a href={href} className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-2 group text-slate-600 dark:text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-cyan-500 transition-colors"></span>
            {label}
        </a>
    </li>
);
