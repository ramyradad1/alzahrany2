import React, { useState, useEffect } from 'react';
import { Lock, Moon, Sun, Globe, Search, Menu, X, FlaskConical } from 'lucide-react';
import { Language, Translations } from '../types';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

interface NavbarConfig {
  logo_url: string;
  site_name: string;
  site_name_ar: string;
  menu_items: { id: string; label: string; labelAr: string; href: string; order: number }[];
}

interface NavbarProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  lang: Language;
  toggleLang: () => void;
  t: Translations;
  onSearch: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isDarkMode,
  toggleTheme,
  lang,
  toggleLang,
  t,
  onSearch
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [config, setConfig] = useState<NavbarConfig | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Fetch navbar config from database
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('navbar_config')
          .select('*')
          .eq('id', 'main')
          .single();

        if (!error && data) {
          setConfig(data);
        }
      } catch (e) {
        console.log('Using default navbar config');
      }
    };
    fetchConfig();
  }, []);

  // Handle search on Enter key
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(searchTerm);

      // Auto-navigate to catalog if searching from another page
      if (searchTerm.trim().length > 0 && location.pathname !== '/catalog' && !location.pathname.startsWith('/admin')) {
        navigate('/catalog');
        window.scrollTo(0, 0);
      }

      setIsMobileMenuOpen(false);
    }
  };

  // Default nav links fallback
  const defaultNavLinks = [
    { path: '/', label: t.navHome, labelAr: 'الرئيسية', id: 'hero' },
    { path: '/catalog', label: t.navProducts, labelAr: 'المنتجات', id: null },
    { path: '/', label: t.navPartners, labelAr: 'الشركاء', id: 'partners' },
    { path: '/about', label: t.navAbout, labelAr: 'من نحن', id: null },
  ];

  // Use database config or fallback to defaults
  const navLinks = config?.menu_items?.length
    ? config.menu_items.sort((a, b) => a.order - b.order).map(item => ({
      path: item.href.includes('#') ? item.href.split('#')[0] || '/' : item.href,
      label: lang === 'en' ? item.label : item.labelAr,
      id: item.href.includes('#') ? item.href.split('#')[1] : null,
    }))
    : defaultNavLinks.map(link => ({
      ...link,
      label: lang === 'en' ? link.label : link.labelAr,
    }));

  // Get site name from config
  const siteName = config
    ? (lang === 'en' ? config.site_name : config.site_name_ar)
    : (lang === 'en' ? 'Alzahrany Trading' : 'الزهراني للتجارة');

  const handleNavigation = (path: string, id?: string | null) => {
    setIsMobileMenuOpen(false);

    if (id) {
      if (location.pathname !== '/') {
        navigate(path);
        // Wait for navigation then scroll
        setTimeout(() => {
          const element = document.getElementById(id);
          element?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const element = document.getElementById(id);
        if (element) {
          const navHeight = 64;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navHeight;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
      }
    } else {
      navigate(path);
      window.scrollTo(0, 0);
    }
  };

  const isActive = (path: string, id?: string | null) => {
    if (location.pathname === '/admin') return false;
    if (id) return location.pathname === path && location.hash === `#${id}`;
    return location.pathname === path;
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        {/* 1. Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
          onClick={() => handleNavigation('/')}
          title={t.tooltipHome}
        >
          {/* Logo - custom image or default icon */}
          {config?.logo_url ? (
            <img src={config.logo_url} alt="Logo" className="h-10 w-10 object-contain group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-xl shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
              <FlaskConical className="h-6 w-6 text-white" strokeWidth={2.5} />
            </div>
          )}
          <span className="font-black text-xl tracking-tight hidden sm:block text-slate-800 dark:text-white">
            {siteName}
          </span>
        </div>

        {/* 2. Desktop Navigation (Center) */}
        <div className="hidden md:flex items-center space-x-1 rtl:space-x-reverse bg-slate-100/50 dark:bg-slate-800/50 rounded-full px-1 py-1 border border-slate-200/50 dark:border-slate-700/50">
          {navLinks.map((link, index) => (
            <button
              key={index}
              onClick={() => handleNavigation(link.path, link.id)}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${isActive(link.path, link.id)
                ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* 3. Actions (Right) */}
        <div className="flex items-center gap-3 flex-shrink-0">

          {/* Search (Only visible when Public view is active) */}
          {!location.pathname.startsWith('/admin') && (
            <div className="relative hidden lg:block w-48 transition-all focus-within:w-64">
              <div className="absolute inset-y-0 left-0 rtl:right-0 rtl:left-auto pl-3 rtl:pr-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-full text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all"
                placeholder={t.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch}
                title={t.tooltipSearch}
              />
            </div>
          )}

          {/* Admin Lock */}
          <Link
            to="/admin"
            className={`p-2 rounded-full transition-colors ${location.pathname.startsWith('/admin')
              ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            title={t.tooltipAdmin}
          >
            <Lock className="w-4 h-4" />
          </Link>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

          {/* Lang Toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-bold text-xs uppercase tracking-wide"
            title={t.tooltipLang}
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === 'en' ? 'AR' : 'EN'}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-cyan-400 transition-colors"
            title={t.tooltipTheme}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-slate-600 dark:text-slate-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            title={t.tooltipMenu}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Search & Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 ${isMobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 py-3 space-y-3">
          {!location.pathname.startsWith('/admin') && (
            <div className="relative mb-4">
              <Search className="absolute left-3 rtl:right-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                className="block w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                placeholder={t.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
          )}
          <div className="flex flex-col space-y-1">
            {navLinks.map((link, index) => (
              <button
                key={index}
                onClick={() => handleNavigation(link.path, link.id)}
                className={`text-left rtl:text-right px-4 py-2 rounded-lg font-medium ${isActive(link.path, link.id)
                  ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400'
                  : 'text-slate-600 dark:text-slate-300'
                  }`}
              >
                {link.label}
              </button>
            ))}
            <Link
              to="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-left rtl:text-right px-4 py-2 rounded-lg font-medium ${location.pathname.startsWith('/admin')
                ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400'
                : 'text-slate-600 dark:text-slate-300'
                }`}
            >
              {t.admin}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
