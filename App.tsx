import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { supabase } from './utils/supabase';
import { db } from './src/db';
import { syncAll } from './src/services/dbSync';
import { useSync } from './src/hooks/useSync';
import { addToSyncQueue } from './src/services/syncQueue';
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
import { NavbarController } from './components/admin/NavbarController';
import { SyncIndicator } from './components/admin/SyncIndicator';
import { ProductModal } from './components/ProductModal';
import { AboutPage } from './components/AboutPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { BackgroundAnimation } from './components/BackgroundAnimation';
import TodoPage from './components/TodoPage';
import { translations } from './translations';
import { Product, Partner, Section, Language, ProductFormData } from './types';

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    return false;
  });
  const [lang, setLang] = useState<Language>(() => (typeof window !== 'undefined' ? (localStorage.getItem('lang') as Language) || 'en' : 'en'));

  const products = useLiveQuery(() => db.products.toArray(), []) || [];
  const partners = useLiveQuery(() => db.partners.toArray(), []) || [];

  const sections = useLiveQuery(() => db.sections.orderBy('order').toArray(), []) || [];
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
    syncAll();
  }, []);

  useSync();

  async function fetchData() {
    // Step 1: Load cached data immediately for instant display
    try {
      const cachedNavbar = localStorage.getItem('cached_navbar');

      if (cachedNavbar) {
        const cfg = JSON.parse(cachedNavbar);
        if (cfg.favicon_url) updateFavicon(cfg.favicon_url);
        if (cfg.site_name) document.title = cfg.site_name;
      }
    } catch (e) {
      console.warn('Error loading cached data:', e);
    }

    // Step 2: Fetch fresh data from Supabase in background
    try {
      const { data: navData, error: navError } = await supabase.from('navbar_config').select('*').eq('id', 'main').single();

      if (navData) {
        localStorage.setItem('cached_navbar', JSON.stringify(navData));
        if (navData.favicon_url) updateFavicon(navData.favicon_url);
        if (navData.site_name) document.title = navData.site_name;
      }

      // Check if we need to initialize defaults (if DB is empty)
      const count = await db.sections.count();
      if (count === 0) {
        const defaults: Section[] = [
          { id: 'hero', label: 'Hero Section', order: 0, is_visible: true, content: {} },
          { id: 'about', label: 'About Us', order: 1, is_visible: true, content: {} },
          { id: 'catalog', label: 'Product Catalog', order: 2, is_visible: true, content: {} },
          { id: 'partners', label: 'Partners', order: 3, is_visible: true, content: {} },
          { id: 'footer', label: 'Footer', order: 4, is_visible: true, content: {} }
        ];
        await db.sections.bulkPut(defaults);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  const updateFavicon = (url: string) => {
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = url;
  };

  // --- CRUD Handlers ---

  const handleAddProduct = async (productData: ProductFormData) => {
    try {
      const tempId = Date.now(); // Temporary ID for local DB

      const price = productData.price === '' || productData.price === undefined
        ? undefined
        : Number(productData.price);

      const newProduct: Product = {
        ...productData,
        id: tempId,
        price,
        specifications: productData.specifications || [],
        images: productData.images || []
      };

      // Optimistic Update: Add to Dexie first
      await db.products.put(newProduct);

      // Add to Sync Queue
      await addToSyncQueue('products', 'CREATE', newProduct, tempId);

    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product');
      throw error;
    }
  };


  const handleEditProduct = async (id: number, productData: ProductFormData) => {
    try {
      const updates = { ...productData };
      if (updates.price) updates.price = Number(updates.price);
      else if (updates.price === '') updates.price = undefined;

      // Optimistic Update
      await db.products.update(id, updates as Partial<Product>);

      // Add to Sync Queue
      await addToSyncQueue('products', 'UPDATE', { id, ...updates });

    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
      throw error;
    }
  };


  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await db.products.delete(id);
        await addToSyncQueue('products', 'DELETE', { id });
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
        throw error;
      }
    }
  };


  const handleAddPartner = async (name: string, logo: string) => {
    try {
      const tempId = Date.now();
      const newPartner = { id: tempId, name, logo } as Partner;

      await db.partners.put(newPartner);
      await addToSyncQueue('partners', 'CREATE', { name, logo }, tempId);
    } catch (error) {
      console.error('Error adding partner:', error);
      alert('Failed to add partner');
      throw error;
    }
  };


  const handleDeletePartner = async (id: number) => {
    if (window.confirm('Delete this partner?')) {
      try {
        await db.partners.delete(id);
        await addToSyncQueue('partners', 'DELETE', { id });
      } catch (error) {
        console.error('Error deleting partner:', error);
        alert('Failed to delete partner');
      }
    }
  };

  const handleUpdateSections = async (newSections: Section[]) => {
    // Optimistic update for reordering (from AdminSections)
    // We need to persist this to Dexie/Queue
    // AdminSections usually handles this, but if it passes back here:
    try {
      // Batch update orders? 
      // Implementation should likely be in AdminSections to have access to addToSyncQueue usually
      // But we can do it here if we want App to be the controller.
      // For now, let's assume AdminSections handles the DB write and we just ignore local state update
      // since useLiveQuery will reflect it.
      // However, for drag smoothness, AdminSections has local state.
    } catch (e) {
      console.error(e);
    }
  };


  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const toggleLang = () => setLang(prev => prev === 'en' ? 'ar' : 'en');
  const getSection = (id: string) => sections.find(s => s.id === id);

  return (
    <ErrorBoundary>
      <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} font-sans`}>
        {/* Animated Background */}
        <BackgroundAnimation />

        <SyncIndicator />

        {productModalOpen && <ProductModal product={productModalOpen} onClose={() => setProductModalOpen(null)} t={t} />}

        <Routes>
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminPanel t={t} lang={lang} />}>
            <Route index element={<Navigate to="products" replace />} />
            <Route path="products" element={<AdminProducts products={products} onAdd={handleAddProduct} onEdit={handleEditProduct} onDelete={handleDeleteProduct} t={t} lang={lang} />} />
            <Route path="partners" element={<AdminPartners partners={partners} onAddPartner={handleAddPartner} onDeletePartner={handleDeletePartner} t={t} />} />
            <Route path="sections" element={<AdminSections sections={sections} onUpdateSections={handleUpdateSections} t={t} />} />
            <Route path="navbar" element={<NavbarController t={t} />} />
          </Route>

          {/* Public Routes */}
          <Route element={
            <>
              <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} lang={lang} toggleLang={toggleLang} t={t} onSearch={() => { }} products={products} partners={partners} setProductModalOpen={setProductModalOpen} />
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
                        return <ProductCatalog key={section.id} t={t} searchQuery="" onProductClick={setProductModalOpen} content={section.content} lang={lang} />;
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
            <Route path="/catalog" element={<div className="pt-8"><ProductCatalog t={t} searchQuery="" onProductClick={setProductModalOpen} content={getSection('catalog')?.content} lang={lang} /></div>} />
            <Route path="/todos" element={<TodoPage />} />
          </Route>
        </Routes>
      </div>
    </ErrorBoundary>
  );
};

export default App;