import React, { useState, useEffect } from 'react';
import { Lock, Moon, Sun, Globe, Search, Menu, X, ChevronDown, ChevronRight, Package, Box, Users, ArrowRight } from 'lucide-react';
import { Language, Translations, MenuItem, NavbarConfig, Product, Partner } from '../types';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

interface NavbarProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  lang: Language;
  toggleLang: () => void;
  t: Translations;
  onSearch: (query: string) => void;
  products?: Product[];
  partners?: Partner[];
  setProductModalOpen?: (product: Product | null) => void;
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
      className={`absolute ${depth === 0 ? 'top-full left-0 pt-2' : 'left-full top-0 pl-1'} z-[60]`}
    >
      {/* The actual dropdown card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 min-w-[200px] animate-fadeIn max-h-[75vh] overflow-y-auto custom-scrollbar">
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
              <span className="flex items-center gap-2">
                {item.icon && <img src={item.icon} alt="" className="w-5 h-5 object-contain" />}
                {lang === 'en' ? item.label : item.labelAr}
              </span>
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
  currentPath: string;
}> = ({ items, lang, onNavigate, depth = 0, currentPath }) => {
  const [openId, setOpenId] = useState<string | null>(null);

  const isActive = (href: string) => {
    if (currentPath === '/admin') return false;
    if (href.includes('#')) {
      const [path] = href.split('#');
      return currentPath === (path || '/');
    }
    return currentPath === href;
  };

  return (
    <div className={`space-y-1 ${depth > 0 ? 'ml-4 pl-4 border-l-2 border-slate-100 dark:border-slate-800' : ''}`}>
      {items.sort((a, b) => a.order - b.order).map(item => {
        const active = isActive(item.href);
        const hasChildren = item.children && item.children.length > 0;

        return (
          <div key={item.id} className="overflow-hidden">
            <div className={`flex items-center justify-between rounded-xl transition-all duration-200 ${active
              ? 'bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/10 text-cyan-700 dark:text-cyan-400'
              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
              }`}>
              <button
                onClick={() => onNavigate(item.href)}
                className="flex-1 text-left px-4 py-3 font-medium flex items-center gap-3"
              >
                {item.icon ? (
                  <img src={item.icon} alt="" className="w-5 h-5 object-contain" />
                ) : (
                  <div className={`w-1.5 h-1.5 rounded-full transition-colors ${active ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                )}
                {lang === 'en' ? item.label : item.labelAr}
              </button>

              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenId(openId === item.id ? null : item.id);
                  }}
                  className={`p-3 transition-colors ${active ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openId === item.id ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>

            {/* Nested accordion with smooth height transition */}
            <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${openId === item.id ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}>
              <div className="overflow-hidden">
                <div className="pt-2 pb-1">
                  {hasChildren && (
                    <MobileAccordion
                      items={item.children!}
                      lang={lang}
                      onNavigate={onNavigate}
                      depth={depth + 1}
                      currentPath={currentPath}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const Navbar: React.FC<NavbarProps> = ({
  isDarkMode,
  toggleTheme,
  lang,
  toggleLang,
  t,
  onSearch,
  products,
  partners,
  setProductModalOpen
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [config, setConfig] = useState<NavbarConfig | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [searchResults, setSearchResults] = useState<{ products: Product[], categories: string[], partners: Partner[], menuItems: MenuItem[] } | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Default menu items (Move up for search access)
  const defaultMenuItems: MenuItem[] = [
    { id: '1', label: 'Home', labelAr: 'الرئيسية', href: '/', order: 0 },
    { id: '2', label: 'Products', labelAr: 'المنتجات', href: '/catalog', order: 1 },
    { id: '3', label: 'Partners', labelAr: 'الشركاء', href: '/#partners', order: 2 },
    { id: '4', label: 'About', labelAr: 'من نحن', href: '/about', order: 3 },
  ];

  const menuItems = config?.menu_items?.length ? config.menu_items : defaultMenuItems;

  // Helper to recursively search menu items
  const searchMenuRecursive = (items: MenuItem[], query: string): MenuItem[] => {
    let results: MenuItem[] = [];
    items.forEach(item => {
      const matchEn = item.label?.toLowerCase().includes(query);
      const matchAr = item.labelAr?.toLowerCase().includes(query);

      if (matchEn || matchAr) {
        results.push(item);
      }

      if (item.children && item.children.length > 0) {
        results = [...results, ...searchMenuRecursive(item.children, query)];
      }
    });
    return results;
  };

  // Search Logic
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults(null);
      return;
    }

    const query = searchTerm.toLowerCase();

    // Filter Products
    const matchedProducts = (products || []).filter(p =>
      p.name?.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query) ||
      p.category?.toLowerCase().includes(query)
    ).slice(0, 5); // Limit to 5

    // Filter Categories (from matched products to ensure relevance)
    const matchedCategories = Array.from(new Set(
      (products || [])
        .filter(p => p.category.toLowerCase().includes(query))
        .map(p => p.category)
    )).slice(0, 3);

    // Filter Partners
    const matchedPartners = (partners || []).filter(p =>
      p.name.toLowerCase().includes(query)
    ).slice(0, 2);

    // Filter Menu Items (Sections)
    const matchedMenuItems = searchMenuRecursive(menuItems, query).slice(0, 4);

    if (matchedProducts.length > 0 || matchedCategories.length > 0 || matchedPartners.length > 0 || matchedMenuItems.length > 0) {
      setSearchResults({
        products: matchedProducts,
        categories: matchedCategories,
        partners: matchedPartners,
        menuItems: matchedMenuItems
      });
      setShowSearchResults(true);
    } else {
      setSearchResults(null);
      setShowSearchResults(false);
    }
  }, [searchTerm, products, partners, config]);

  // Click outside to close search
  useEffect(() => {
    const handleClickOutside = () => setShowSearchResults(false);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

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
  // Handle search on Enter key or Click
  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    onSearch(searchTerm);
    setShowSearchResults(false);
    if (searchTerm.trim().length > 0 && location.pathname !== '/catalog' && !location.pathname.startsWith('/admin')) {
      navigate(`/catalog`); // Just go to catalog, let it handle search via prop or context if needed. 
      // Actually typically we might want to pass search query via URL param
      // But for now let's keep existing behavior
      // A better approach: navigate(`/catalog?search=${encodeURIComponent(searchTerm)}`)
    }
    setIsMobileMenuOpen(false);
  };

  const handleResultClick = (type: 'product' | 'category' | 'partner' | 'menu', data: any) => {
    console.log('Result clicked:', type, data);
    setShowSearchResults(false);
    setSearchTerm('');

    if (type === 'product') {
      if (setProductModalOpen) setProductModalOpen(data);
    } else if (type === 'category') {
      navigate(`/catalog?category=${encodeURIComponent(data)}`);
    } else if (type === 'partner') {
      navigate('/#partners'); // Simplification
      setTimeout(() => {
        const el = document.getElementById('partners');
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (type === 'menu') {
      handleNavigation(data.href);
    }
  };

  // Default menu items definition removed (moved up)
  // const menuItems definition removed (moved up)

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
    // Don't highlight placeholders or empty links
    if (href === '#' || href === '') return false;

    // For hash links (e.g. /#partners), only highlight if we're technically just on that section? 
    // Actually, for a cleaner look, let's only highlight the EXACT current path match, 
    // or strictly avoid highlighting hash links if they just point to current page to avoid clutter.
    // BUT, the user might want "Partners" highlighted if they clicked it. 
    // Let's assume for now we only want to highlight if it's a REAL page navigation, not just a scroll anchor on Home.
    // So 'Home' (/) gets highlighted. 'Partners' (/#partners) does NOT, unless we are strictly tracking scroll.
    // Given the clutter, it's safer to only highlight non-hash links, OR ensure hash links don't match base path blindly.

    if (href === '/') return location.pathname === '/';

    if (href.includes('#')) {
      // If it's a hash link, generally don't treat it as "Active Page" to avoid "Home" + "Partners" + "Sections" all being active.
      return false;
    }

    return location.pathname === href;
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="relative w-full px-6 lg:px-8 h-20 flex items-center justify-between mx-auto max-w-[1920px]">

        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
          onClick={() => handleNavigation('/')}
          title={t.tooltipHome}
        >
          {config?.logo_url && (
            <img
              src={config.logo_url}
              alt="Logo"
              style={{ width: config.logo_size || 40, height: 'auto' }}
              className="object-contain group-hover:scale-105 transition-transform duration-300"
            />
          )}
          <span className="font-black text-xl tracking-tight hidden sm:block text-slate-800 dark:text-white">
            {siteName}
          </span>
        </div>

        {/* Desktop Navigation - Absolutely Centered */}
        <div className="hidden lg:flex items-center space-x-6 rtl:space-x-reverse absolute left-1/2 top-0 h-full transform -translate-x-1/2">
          {menuItems.sort((a, b) => a.order - b.order).map(item => (
            <div
              key={item.id}
              className="relative h-full flex items-center"
              onMouseEnter={() => {
                if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                if (item.children?.length) setOpenDropdown(item.id);
              }}
              onMouseLeave={() => {
                hoverTimeoutRef.current = setTimeout(() => {
                  setOpenDropdown(null);
                }, 150); // 150ms delay to prevent flickering
              }}
            >
              <button
                onClick={() => handleNavigation(item.href)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[15px] font-medium transition-all duration-200 ${isActive(item.href)
                  ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
              >
                {item.icon && <img src={item.icon} alt="" className="w-4 h-4 object-contain" />}
                {lang === 'en' ? item.label : item.labelAr}
                {item.children && item.children.length > 0 && (
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === item.id ? 'rotate-180' : ''}`} />
                )}
              </button>

              {/* Desktop Dropdown */}
              {openDropdown === item.id && item.children && item.children.length > 0 && (
                <div
                  onMouseEnter={() => {
                    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                  }}
                  onMouseLeave={() => {
                    hoverTimeoutRef.current = setTimeout(() => {
                      setOpenDropdown(null);
                    }, 150);
                  }}
                >
                  <DesktopDropdown
                    items={item.children}
                    lang={lang}
                    onNavigate={handleNavigation}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Search */}
          {!location.pathname.startsWith('/admin') && (
            <div className="relative hidden lg:block w-48 transition-all focus-within:w-80 group" onClick={e => e.stopPropagation()}>
              <div className="absolute inset-y-0 left-0 rtl:right-0 rtl:left-auto pl-3 rtl:pr-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-2 border border-slate-200 dark:border-slate-700 rounded-full text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all shadow-sm"
                placeholder={t.search}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (e.target.value.length > 1) setShowSearchResults(true);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                onFocus={() => {
                  if (searchTerm.length > 1 && searchResults) setShowSearchResults(true);
                }}
                title={t.tooltipSearch}
              />

              {/* Smart Search Dropdown */}
              {showSearchResults && searchResults && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fadeIn z-[100]">
                  {/* Categories */}
                  {searchResults.categories.length > 0 && (
                    <div className="p-2 border-b border-slate-100 dark:border-slate-700/50">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1">{t.categories || 'Categories'}</h4>
                      {searchResults.categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => handleResultClick('category', cat)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-900/20 text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors"
                        >
                          <Box className="w-3.5 h-3.5 text-cyan-500" />
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Configured Menu Items (Sections) */}
                  {searchResults.menuItems && searchResults.menuItems.length > 0 && (
                    <div className="p-2 border-b border-slate-100 dark:border-slate-700/50">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1">{t.sections || 'Sections'}</h4>
                      {searchResults.menuItems.map(item => (
                        <button
                          key={item.id}
                          onClick={() => handleResultClick('menu', item)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-900/20 text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors"
                        >
                          {/* Use provided icon or default based on depth/type implies logic but simpler to just use generic or item icon */}
                          {item.icon ? <img src={item.icon} className="w-4 h-4 object-contain" alt="" /> : <ArrowRight className="w-3.5 h-3.5 text-cyan-500" />}
                          <span>{lang === 'en' ? item.label : item.labelAr}</span>
                          <span className="text-[10px] text-slate-400 ml-auto">{item.href}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Products */}
                  {searchResults.products.length > 0 && (
                    <div className="p-2 border-b border-slate-100 dark:border-slate-700/50">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1">{t.products || 'Products'}</h4>
                      {searchResults.products.map(prod => (
                        <button
                          key={prod.id}
                          onClick={() => handleResultClick('product', prod)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-900/20 text-sm text-slate-700 dark:text-slate-200 flex items-center gap-3 group/item transition-colors"
                        >
                          {prod.images?.[0] ? (
                            <img src={prod.images[0]} alt={prod.name} className="w-8 h-8 rounded bg-white object-contain border border-slate-200" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-400">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate text-slate-800 dark:text-slate-200 group-hover/item:text-cyan-600 dark:group-hover/item:text-cyan-400">{prod.name}</div>
                            <div className="text-[10px] text-slate-400 truncate">{prod.category}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Partners */}
                  {searchResults.partners.length > 0 && (
                    <div className="p-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1">{t.partners || 'Partners'}</h4>
                      {searchResults.partners.map(partner => (
                        <button
                          key={partner.id}
                          onClick={() => handleResultClick('partner', partner)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-900/20 text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors"
                        >
                          <Users className="w-3.5 h-3.5 text-purple-500" />
                          {partner.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* View All */}
                  <div className="p-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleSearchSubmit()}
                      className="w-full py-1.5 text-xs font-bold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 flex items-center justify-center gap-1"
                    >
                      View All Results <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
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

          {/* Mobile Menu Button - Show on md and below since we moved nav to lg */}
          <button
            className="lg:hidden p-2 text-slate-600 dark:text-slate-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            title={t.tooltipMenu}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden transition-all duration-300 ease-in-out border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 ${isMobileMenuOpen ? 'max-h-[85vh] opacity-100 overflow-y-auto' : 'max-h-0 opacity-0 overflow-hidden'}`}>
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
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
              />
            </div>
          )}

          {/* Mobile Navigation with Accordions */}
          <MobileAccordion
            items={menuItems}
            lang={lang}
            onNavigate={handleNavigation}
            currentPath={location.pathname}
          />

          {/* Admin Link */}
          <Link
            to="/admin"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${location.pathname.startsWith('/admin')
              ? 'bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/10 text-cyan-700 dark:text-cyan-400'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full transition-colors ${location.pathname.startsWith('/admin') ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
            {t.admin}
          </Link>
        </div>
      </div>
    </nav>
  );
};
