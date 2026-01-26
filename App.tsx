import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { supabase } from './utils/supabase';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { ProductCatalog } from './components/ProductCatalog';
import { Partners } from './components/Partners';
import { CustomSection } from './components/CustomSection';
import { ScrollToTop } from './components/ScrollToTop';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { SocialLinksWidget } from './components/SocialLinksWidget';
import { AdminPanel } from './components/AdminPanel';
import { AdminProducts } from './components/admin/AdminProducts';
import { AdminPartners } from './components/admin/AdminPartners';
import { AdminSections } from './components/admin/AdminSections';
import { ProductModal } from './components/ProductModal';
import { AboutPage } from './components/AboutPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { BackgroundAnimation } from './components/BackgroundAnimation';
import { translations } from './translations';
import { Product, Partner, Section, Language, ProductFormData } from './types';
import { FlaskConical } from 'lucide-react';

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    return false;
  });
  const [lang, setLang] = useState<Language>(() => (typeof window !== 'undefined' ? (localStorage.getItem('lang') as Language) || 'en' : 'en'));
  const [products, setProducts] = useState<Product[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [sections, setSections] = useState<Section[]>([
    { id: 'hero', label: 'Hero Section', order: 0, is_visible: true, content: {} },
    { id: 'about', label: 'About Us', order: 1, is_visible: true, content: {} },
    { id: 'catalog', label: 'Product Catalog', order: 2, is_visible: true, content: {} },
    { id: 'partners', label: 'Partners', order: 3, is_visible: true, content: {} },
    { id: 'footer', label: 'Footer', order: 4, is_visible: true, content: {} }
  ]);
  const [loading, setLoading] = useState(true);
  const [productModalOpen, setProductModalOpen] = useState<Product | null>(null);

  const t = translations[lang];

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem('lang', lang);
  }, [lang]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    // Step 1: Load cached data immediately for instant display
    try {
      const cachedProducts = localStorage.getItem('cached_products');
      const cachedPartners = localStorage.getItem('cached_partners');
      const cachedSections = localStorage.getItem('cached_sections');

      if (cachedProducts) setProducts(JSON.parse(cachedProducts));
      if (cachedPartners) setPartners(JSON.parse(cachedPartners));
      if (cachedSections) setSections(JSON.parse(cachedSections));
    } catch (e) {
      console.warn('Error loading cached data:', e);
    }

    // Step 2: Fetch fresh data from Supabase in background
    try {
      const [prodRes, partRes, sectRes] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('partners').select('*'),
        supabase.from('sections').select('*').order('order', { ascending: true })
      ]);

      if (prodRes.data) {
        setProducts(prodRes.data);
        localStorage.setItem('cached_products', JSON.stringify(prodRes.data));
      }
      if (partRes.data) {
        setPartners(partRes.data);
        localStorage.setItem('cached_partners', JSON.stringify(partRes.data));
      }

      if (sectRes.data && sectRes.data.length > 0) {
        // Check if footer section exists, if not add it
        const hasFooter = sectRes.data.some(s => s.id === 'footer');
        if (!hasFooter) {
          const footerSection = {
            id: 'footer',
            label: 'Footer',
            order: sectRes.data.length,
            is_visible: true,
            content: {}
          };
          // Insert footer into database
          await supabase.from('sections').insert([footerSection]);
          const newSections = [...sectRes.data, footerSection];
          setSections(newSections);
          localStorage.setItem('cached_sections', JSON.stringify(newSections));
        } else {
          setSections(sectRes.data);
          localStorage.setItem('cached_sections', JSON.stringify(sectRes.data));
        }
      } else {
        // Initialize default sections if empty
        const defaults: Section[] = [
          { id: 'hero', label: 'Hero Section', order: 0, is_visible: true, content: {} },
          { id: 'about', label: 'About Us', order: 1, is_visible: true, content: {} },
          { id: 'catalog', label: 'Product Catalog', order: 2, is_visible: true, content: {} },
          { id: 'partners', label: 'Partners', order: 3, is_visible: true, content: {} },
          { id: 'footer', label: 'Footer', order: 4, is_visible: true, content: {} }
        ];
        setSections(defaults);
      }
    } catch (e) {
      console.error('Error fetching data:', e);
    } finally {
      setLoading(false);
    }
  }

  // --- CRUD Handlers ---
  const handleAddProduct = async (productData: ProductFormData) => {
    const { data, error } = await supabase.from('products').insert([productData]).select();
    if (error) { alert('Failed to add product'); return; }
    if (data) { setProducts(prev => [...prev, data[0]]); }
  };

  const handleEditProduct = async (id: number, productData: ProductFormData) => {
    const { error } = await supabase.from('products').update(productData).eq('id', id);
    if (error) { alert('Failed to update product'); return; }
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...productData } : p)));
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) { alert('Failed to delete product'); return; }
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleAddPartner = async (name: string, logo: string) => {
    const { data, error } = await supabase.from('partners').insert([{ name, logo }]).select();
    if (error) { alert('Failed to add partner'); return; }
    if (data) { setPartners(prev => [...prev, data[0]]); }
  };

  const handleDeletePartner = async (id: number) => {
    if (window.confirm('Delete this partner?')) {
      const { error } = await supabase.from('partners').delete().eq('id', id);
      if (error) { alert('Failed to delete partner'); return; }
      setPartners(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleUpdateSections = (newSections: Section[]) => {
    setSections(newSections);
  };


  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const toggleLang = () => setLang(prev => prev === 'en' ? 'ar' : 'en');
  const getSection = (id: string) => sections.find(s => s.id === id);

  return (
    <ErrorBoundary>
      <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} font-sans`}>
        {/* Animated Background */}
        <BackgroundAnimation />

        {productModalOpen && <ProductModal product={productModalOpen} onClose={() => setProductModalOpen(null)} t={t} />}

        <Routes>
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminPanel t={t} lang={lang} />}>
            <Route index element={<Navigate to="products" replace />} />
            <Route path="products" element={<AdminProducts products={products} onAdd={handleAddProduct} onEdit={handleEditProduct} onDelete={handleDeleteProduct} t={t} lang={lang} />} />
            <Route path="partners" element={<AdminPartners partners={partners} onAddPartner={handleAddPartner} onDeletePartner={handleDeletePartner} t={t} />} />
            <Route path="sections" element={<AdminSections sections={sections} onUpdateSections={handleUpdateSections} t={t} />} />
          </Route>

          {/* Public Routes */}
          <Route element={
            <>
              <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} lang={lang} toggleLang={toggleLang} t={t} onSearch={() => { }} />
              <main className="pt-16">
                <Outlet />
              </main>
              <Footer t={t} lang={lang} content={getSection('footer')?.content} />
              <ScrollToTop />
              <ScrollToTopButton />
              <SocialLinksWidget />
            </>
          }>
            <Route path="/" element={
              <>
                {sections.filter(s => s.is_visible).map((section) => {
                  try {
                    switch (section.id) {
                      case 'hero':
                        return <Hero key={section.id} t={t} lang={lang} onShopNow={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })} content={section.content} />;
                      case 'about':
                        return <About key={section.id} t={t} lang={lang} content={section.content} />;
                      case 'catalog':
                        return <ProductCatalog key={section.id} products={products} t={t} searchQuery="" onProductClick={setProductModalOpen} content={section.content} lang={lang} />;
                      case 'partners':
                        return <Partners key={section.id} partners={partners} title={t.partners} content={section.content} lang={lang} />;
                      case 'footer':
                        return null; // Footer is rendered separately in layout wrapper
                      default:
                        return <CustomSection key={section.id} section={section} />;
                    }
                  } catch (err) {
                    console.error(`Error rendering section ${section.id}:`, err);
                    return <div key={section.id} className="p-4 text-red-500">Error rendering section {section.id}</div>;
                  }
                })}
              </>
            } />
            <Route path="/about" element={<AboutPage t={t} content={getSection('about')?.content} lang={lang} />} />
            <Route path="/catalog" element={<div className="pt-8"><ProductCatalog products={products} t={t} searchQuery="" onProductClick={setProductModalOpen} content={getSection('catalog')?.content} lang={lang} /></div>} />
          </Route>
        </Routes>
      </div>
    </ErrorBoundary>
  );
};

export default App;