import React, { useState, useEffect } from 'react';
import { Lock, Moon, Sun, Globe, Search, Menu, X, FlaskConical, ChevronDown, ChevronRight } from 'lucide-react';
import { Language, Translations } from '../types';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

interface MenuItem {
  id: string;
  label: string;
  labelAr: string;
  href: string;
  order: number;
  children?: MenuItem[];
}

interface NavbarConfig {
  logo_url: string;
  site_name: string;
  site_name_ar: string;
  menu_items: MenuItem[];
}

interface NavbarProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  lang: Language;
  toggleLang: () => void;
  t: Translations;
  onSearch: (query: string) => void;
}

// Desktop Dropdown Component (recursive)
const DesktopDropdown: React.FC<{
  items: MenuItem[];
  lang: Language;
  onNavigate: (href: string) => void;
  depth?: number;
}> = ({ items, lang, onNavigate, depth = 0 }) => {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div
      className={`absolute ${depth === 0 ? 'top-full left-0 pt-2' : 'left-full top-0 pl-1'} z-50`}
    >
      {/* The actual dropdown card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 min-w-[200px] animate-fadeIn">
        {items.sort((a, b) => a.order - b.order).map(item => (
          <div
            key={item.id}
            className="relative"
            onMouseEnter={() => item.children?.length ? setOpenId(item.id) : null}
            onMouseLeave={() => setOpenId(null)}
          >
            <button
              onClick={() => onNavigate(item.href)}
              className="w-full px-4 py-2.5 text-left flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              <span>{lang === 'en' ? item.label : item.labelAr}</span>
              {item.children && item.children.length > 0 && (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Nested dropdown */}
            {openId === item.id && item.children && item.children.length > 0 && (
              <DesktopDropdown
                items={item.children}
                lang={lang}
                onNavigate={onNavigate}
                depth={depth + 1}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Mobile Accordion Component (recursive)
const MobileAccordion: React.FC<{
  items: MenuItem[];
  lang: Language;
  onNavigate: (href: string) => void;
  depth?: number;
}> = ({ items, lang, onNavigate, depth = 0 }) => {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className={`${depth > 0 ? 'ml-4 border-l-2 border-slate-200 dark:border-slate-600 pl-2' : ''}`}>
      {items.sort((a, b) => a.order - b.order).map(item => (
        <div key={item.id}>
          <div className="flex items-center">
            <button
              onClick={() => onNavigate(item.href)}
              className={`flex-1 text-left px-4 py-2 rounded-lg font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700`}
            >
              {lang === 'en' ? item.label : item.labelAr}
            </button>
            {item.children && item.children.length > 0 && (
              <button
                onClick={() => setOpenId(openId === item.id ? null : item.id)}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${openId === item.id ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>

          {/* Nested accordion */}
          {openId === item.id && item.children && item.children.length > 0 && (
            <MobileAccordion
              items={item.children}
              lang={lang}
              onNavigate={onNavigate}
              depth={depth + 1}
            />
          )}
        </div>
      ))}
    </div>
  );
};

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
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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
      if (searchTerm.trim().length > 0 && location.pathname !== '/catalog' && !location.pathname.startsWith('/admin')) {
        navigate('/catalog');
        window.scrollTo(0, 0);
      }
      setIsMobileMenuOpen(false);
    }
  };

  // Default menu items
  const defaultMenuItems: MenuItem[] = [
    { id: '1', label: 'Home', labelAr: 'الرئيسية', href: '/', order: 0 },
    { id: '2', label: 'Products', labelAr: 'المنتجات', href: '/catalog', order: 1 },
    { id: '3', label: 'Partners', labelAr: 'الشركاء', href: '/#partners', order: 2 },
    { id: '4', label: 'About', labelAr: 'من نحن', href: '/about', order: 3 },
  ];

  const menuItems = config?.menu_items?.length ? config.menu_items : defaultMenuItems;

  const siteName = config
    ? (lang === 'en' ? config.site_name : config.site_name_ar)
    : (lang === 'en' ? 'Alzahrany Trading' : 'الزهراني للتجارة');

  const handleNavigation = (href: string) => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);

    if (href.includes('#')) {
      const [path, hash] = href.split('#');
      const targetPath = path || '/';

      if (location.pathname !== targetPath) {
        navigate(targetPath);
        setTimeout(() => {
          const element = document.getElementById(hash);
          element?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const element = document.getElementById(hash);
        if (element) {
          const navHeight = 64;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navHeight;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
      }
    } else {
      navigate(href);
      window.scrollTo(0, 0);
    }
  };

  const isActive = (href: string) => {
    if (location.pathname === '/admin') return false;
    if (href.includes('#')) {
      const [path] = href.split('#');
      return location.pathname === (path || '/');
    }
    return location.pathname === href;
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
          onClick={() => handleNavigation('/')}
          title={t.tooltipHome}
        >
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

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1 rtl:space-x-reverse bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-sm px-1.5 py-1.5 rounded-full border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          {menuItems.sort((a, b) => a.order - b.order).map(item => (
            <div
              key={item.id}
              className="relative h-16 flex items-center"
              onMouseEnter={() => item.children?.length ? setOpenDropdown(item.id) : null}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                onClick={() => handleNavigation(item.href)}
                className={`relative px-5 py-2.5 rounded-full text-[15px] font-bold transition-all duration-300 flex items-center gap-1.5 ${isActive(item.href)
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                  : 'text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-white/80 dark:hover:bg-slate-700/50'
                  }`}
              >
                {lang === 'en' ? item.label : item.labelAr}
                {item.children && item.children.length > 0 && (
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${openDropdown === item.id ? 'rotate-180' : ''}`} />
                )}
              </button>

              {/* Desktop Dropdown */}
              {openDropdown === item.id && item.children && item.children.length > 0 && (
                <DesktopDropdown
                  items={item.children}
                  lang={lang}
                  onNavigate={handleNavigation}
                />
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Search */}
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

          {/* Admin */}
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

      {/* Mobile Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 ${isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 py-3 space-y-3">
          {/* Mobile Search */}
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

          {/* Mobile Navigation with Accordions */}
          <MobileAccordion
            items={menuItems}
            lang={lang}
            onNavigate={handleNavigation}
          />

          {/* Admin Link */}
          <Link
            to="/admin"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`block text-left rtl:text-right px-4 py-2 rounded-lg font-medium ${location.pathname.startsWith('/admin')
              ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400'
              : 'text-slate-600 dark:text-slate-300'
              }`}
          >
            {t.admin}
          </Link>
        </div>
      </div>
    </nav>
  );
};
