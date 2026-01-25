import React from 'react';
import { Facebook, Twitter, Linkedin, Instagram, MapPin, Phone, Mail, FlaskConical } from 'lucide-react';
import { Section, Language } from '../types';

interface FooterProps {
    t: any;
    lang: Language;
    content?: any;
}

export const Footer: React.FC<FooterProps> = ({ t, lang, content }) => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800 relative z-10">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    {/* Brand Column */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-white">
                            <div className="p-2 bg-slate-800 rounded-lg">
                                <FlaskConical className="w-6 h-6 text-cyan-400" />
                            </div>
                            <span className="font-bold text-xl tracking-tight">Alzahrany</span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Empowering scientific discovery with precision instruments and cutting-edge laboratory solutions since 2010.
                        </p>
                        <div className="flex gap-4">
                            <SocialIcon icon={<Facebook className="w-4 h-4" />} href="#" />
                            <SocialIcon icon={<Twitter className="w-4 h-4" />} href="#" />
                            <SocialIcon icon={<Linkedin className="w-4 h-4" />} href="#" />
                            <SocialIcon icon={<Instagram className="w-4 h-4" />} href="#" />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-bold mb-6 text-lg">{lang === 'ar' ? 'روابط سريعة' : 'Quick Links'}</h3>
                        <ul className="space-y-4 text-sm">
                            <FooterLink label={lang === 'ar' ? 'الرئيسية' : 'Home'} href="/" />
                            <FooterLink label={t.catalog} href="/catalog" />
                            <FooterLink label={t.partners} href="/#partners" />
                            <FooterLink label={lang === 'ar' ? 'تمكين الاكتشاف' : 'Empowering Discovery'} href="/about" />
                            <FooterLink label={lang === 'ar' ? 'لوحة التحكم' : 'Admin'} href="/admin" />
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-white font-bold mb-6 text-lg">{lang === 'ar' ? 'معلومات التواصل' : 'Contact Info'}</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex gap-3 items-start">
                                <MapPin className="w-5 h-5 text-cyan-500 shrink-0" />
                                <span>123 Science Park District,<br />King Abdullah Rd, Jeddah, KSA</span>
                            </li>
                            <li className="flex gap-3 items-center">
                                <Phone className="w-5 h-5 text-cyan-500 shrink-0" />
                                <span dir="ltr">+966 12 345 6789</span>
                            </li>
                            <li className="flex gap-3 items-center">
                                <Mail className="w-5 h-5 text-cyan-500 shrink-0" />
                                <a href="mailto:info@alzahrany-lab.com" className="hover:text-cyan-400 transition-colors">info@alzahrany-lab.com</a>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-white font-bold mb-6 text-lg">{lang === 'ar' ? 'النشرة البريدية' : 'Newsletter'}</h3>
                        <p className="text-slate-400 text-sm mb-4">
                            {lang === 'ar' ? 'اشترك للحصول على آخر التحديثات في التكنولوجيا.' : 'Subscribe to receive updates on new technology.'}
                        </p>
                        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder={lang === 'ar' ? 'بريدك الإلكتروني' : 'Your email address'}
                                className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-500"
                            />
                            <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2.5 rounded transition-all active:scale-[0.98]">
                                {lang === 'ar' ? 'اشترك' : 'Subscribe'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <p>© {currentYear} Alzahrany Scientific Instruments. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-slate-300 transition-colors">{lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</a>
                        <a href="#" className="hover:text-slate-300 transition-colors">{lang === 'ar' ? 'شروط الخدمة' : 'Terms of Service'}</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const SocialIcon = ({ icon, href }) => (
    <a
        href={href}
        className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition-all transform hover:-translate-y-1"
    >
        {icon}
    </a>
);

const FooterLink = ({ label, href }) => (
    <li>
        <a href={href} className="hover:text-cyan-400 transition-colors flex items-center gap-2 group">
            <span className="opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-cyan-500">→</span>
            {label}
        </a>
    </li>
);
