import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowRight, ArrowLeft, Filter, FlaskConical, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin
} from 'lucide-react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';

import { Navbar } from './components/Navbar';
import { Home } from './components/Home';
import { ProductCatalog } from './components/ProductCatalog';
import { ProductModal } from './components/ProductModal';
import { AdminPanel } from './components/AdminPanel';
import { AdminProducts } from './components/admin/AdminProducts';
import { AdminPartners } from './components/admin/AdminPartners';
import { AdminSections } from './components/admin/AdminSections';
import { AboutPage } from './components/AboutPage';
import { ScrollToTop } from './components/ScrollToTop';
import { BackgroundAnimation } from './components/BackgroundAnimation';
import { translations } from './translations';
import {
  Product, ProductFormData, Language, Partner, Section
} from './types';
import { supabase } from './supabase';

// --- DATA ---
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Quantum Series Microscope",
    price: 1250.00,
    category: "Optics",
    image: "https://images.unsplash.com/photo-1581093583449-ed2521344db5?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1581093583449-ed2521344db5?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1516382799247-87df95d790b7?auto=format&fit=crop&q=80&w=800"
    ],
    description: "High-fidelity compound microscope with 4K digital interface, designed for molecular biology and crystallography. Features automated focus and integrated image analysis software.",
    specifications: [
      { label: "Magnification", value: "40x - 2500x" },
      { label: "Sensor", value: "Sony IMX 12MP" },
      { label: "Illumination", value: "Kohler LED" },
      { label: "Interface", value: "USB-C / HDMI" }
    ]
  },
  {
    id: 2,
    name: "Borosilicate Reactor v2",
    price: 0, // Price on Request
    category: "Glassware",
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=800"],
    description: "Double-jacketed reaction vessel for exothermic synthesis. Reinforced borosilicate 3.3 construction with high thermal shock resistance.",
    specifications: [
      { label: "Volume", value: "5000ml" },
      { label: "Temp Range", value: "-80°C to 250°C" },
      { label: "Pressure", value: "Vacuum to 2 bar" },
      { label: "Joints", value: "DN100 / GL45" }
    ]
  },
  {
    id: 3,
    name: "Analytical Centrifuge Pro",
    price: 899.00,
    category: "Machinery",
    image: "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=800"],
    description: "Silent operation centrifuge with active cooling and rotor recognition technology. Ideal for clinical and research applications.",
    specifications: [
      { label: "Max Speed", value: "18,000 RPM" },
      { label: "RCF", value: "30,000 x g" },
      { label: "Cooling", value: "CFC-free Refrigerant" },
      { label: "Noise", value: "< 56 dB" }
    ]
  },
  {
    id: 4,
    name: "Precision Digital Balance",
    price: 450.00,
    category: "Measurement",
    image: "https://images.unsplash.com/photo-1622353381015-6850c952b963?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1622353381015-6850c952b963?auto=format&fit=crop&q=80&w=800"],
    description: "Analytical balance with electromagnetic force compensation technology for ultra-high precision measurements.",
    specifications: [
      { label: "Capacity", value: "220g" },
      { label: "Readability", value: "0.1mg" },
      { label: "Calibration", value: "Internal / Auto" }
    ]
  }
];

const INITIAL_PARTNERS: Partner[] = [
  { id: 1, name: 'ThermoFisher', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Thermo_Fisher_Scientific_logo.svg/2560px-Thermo_Fisher_Scientific_logo.svg.png' },
  { id: 2, name: 'Zeiss', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Carl_Zeiss_logo.svg/2560px-Carl_Zeiss_logo.svg.png' },
  { id: 3, name: 'Sartorius', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Sartorius_Logo.svg/1200px-Sartorius_Logo.svg.png' },
  { id: 4, name: 'Mettler Toledo', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Mettler_Toledo_logo.svg/2560px-Mettler_Toledo_logo.svg.png' }
];

// --- APP CONTENT COMPONENT ---
// Separated to allow using hooks like useNavigate inside
const AppContent = () => {
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Language>('en');
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [products, setProducts] = useState<Product[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const t = translations[lang];

  // Data Fetching
  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Products
      let loadedProducts = [];
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: true });

      if (productsError) {
        console.warn('Products fetch error (using fallback):', productsError);
        loadedProducts = INITIAL_PRODUCTS;
      } else {
        loadedProducts = productsData || [];
      }
      setProducts(loadedProducts);

      // 2. Fetch Partners
      let loadedPartners = [];
      const { data: partnersData, error: partnersError } = await supabase
        .from('partners')
        .select('*')
        .order('created_at', { ascending: true });

      if (partnersError) {
        console.warn('Partners fetch error (using fallback):', partnersError);
        loadedPartners = INITIAL_PARTNERS;
      } else {
        loadedPartners = partnersData || [];
      }
      setPartners(loadedPartners);

      // 3. Fetch Sections
      let loadedSections: Section[] = [];
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('sections')
        .select('*')
        .order('order', { ascending: true });

      if (sectionsError) {
        console.warn('Sections fetch error (using fallback):', sectionsError);
        // Fallback below
      } else if (sectionsData && sectionsData.length > 0) {
        loadedSections = sectionsData;
      }

      // If no valid sections from DB (error or empty), use defaults
      if (loadedSections.length === 0) {
        loadedSections = [
          { id: 'hero', label: 'Hero Section', is_visible: true, order: 0 },
          { id: 'catalog', label: 'Catalog Preview', is_visible: true, order: 1 },
          { id: 'partners', label: 'Trusted Partners', is_visible: true, order: 2 },
          { id: 'about', label: 'About Section', is_visible: true, order: 3 },
        ];
      }
      setSections(loadedSections);

    } catch (error) {
      console.error('Critical error fetching data:', error);
      // Emergency fallback
      setProducts(INITIAL_PRODUCTS);
      setPartners(INITIAL_PARTNERS);
      setSections([
        { id: 'hero', label: 'Hero Section', is_visible: true, order: 0 },
        { id: 'catalog', label: 'Catalog Preview', is_visible: true, order: 1 },
        { id: 'partners', label: 'Trusted Partners', is_visible: true, order: 2 },
        { id: 'about', label: 'About Section', is_visible: true, order: 3 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Theme & Lang Effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [isDark, lang]);

  // Product Handlers
  const handleAddProduct = async (data: ProductFormData) => {
    let price = 0;
    if (data.price !== '' && data.price !== undefined && data.price !== null) {
      price = parseFloat(data.price.toString());
      if (isNaN(price)) price = 0;
    }

    const payload = {
      name: data.name,
      price,
      category: data.category,
      image: data.image,
      images: (data.images && data.images.length > 0) ? data.images : (data.image ? [data.image] : []),
      description: data.description,
      specifications: data.specifications
    };

    const { data: newProduct, error } = await supabase
      .from('products')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Error adding product:', error);
      alert(`Failed to add product: ${error.message || JSON.stringify(error)}`);
      return;
    }

    if (newProduct) {
      setProducts(prev => [...prev, newProduct]);
    }
  };

  const handleEditProduct = async (id: number, data: ProductFormData) => {
    const price = (data.price === '' || data.price === undefined) ? 0 : Number(data.price);

    const payload = {
      name: data.name,
      price,
      category: data.category,
      image: data.image,
      images: (data.images && data.images.length > 0) ? data.images : (data.image ? [data.image] : []),
      description: data.description,
      specifications: data.specifications
    };

    const { error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
      return;
    }

    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...payload, id } : p));
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm(translations[lang].cancel + "?")) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
        return;
      }

      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  // Partner Handlers
  const handleAddPartner = async (name: string, logo: string) => {
    const { data: newPartner, error } = await supabase
      .from('partners')
      .insert([{ name, logo }])
      .select()
      .single();

    if (error) {
      console.error('Error adding partner:', error);
      alert('Failed to add partner');
      return;
    }

    if (newPartner) {
      setPartners(prev => [...prev, newPartner]);
    }
  };

  const handleDeletePartner = async (id: number) => {
    if (confirm(translations[lang].cancel + "?")) {
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting partner:', error);
        alert('Failed to delete partner');
        return;
      }

      setPartners(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleUpdateSections = async (updatedSections: Section[]) => {
    setSections(updatedSections);
    const updates = updatedSections.map(s => ({
      id: s.id,
      label: s.label,
      is_visible: s.is_visible,
      order: s.order
    }));

    const { error } = await supabase
      .from('sections')
      .upsert(updates);

    if (error) {
      console.error('Error updating sections:', error);
      alert('Failed to save section order');
    }
  };

  return (
    <div className="min-h-screen text-slate-900 dark:text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden flex flex-col">
      <ScrollToTop />
      <BackgroundAnimation />

      <Navbar
        isDarkMode={isDark}
        toggleTheme={() => setIsDark(!isDark)}
        lang={lang}
        toggleLang={() => setLang(l => l === 'en' ? 'ar' : 'en')}
        t={t}
        onSearch={setSearchQuery}
      />

      <main className="transition-all duration-500 ease-in-out pt-16 flex-grow">
        <Routes>
          <Route path="/" element={<Home sections={sections} products={products} partners={partners} t={t} lang={lang} onProductClick={setSelectedProduct} />} />
          <Route path="/catalog" element={<ProductCatalog products={products} t={t} searchQuery={searchQuery} onProductClick={setSelectedProduct} />} />
          <Route path="/about" element={<AboutPage t={t} />} />

          <Route path="/admin" element={<AdminPanel t={t} lang={lang} />}>
            <Route index element={<Navigate to="products" replace />} />
            <Route path="products" element={<AdminProducts products={products} onAdd={handleAddProduct} onEdit={handleEditProduct} onDelete={handleDeleteProduct} t={t} lang={lang} />} />
            <Route path="partners" element={<AdminPartners partners={partners} onAddPartner={handleAddPartner} onDeletePartner={handleDeletePartner} t={t} />} />
            <Route path="sections" element={<AdminSections sections={sections} onUpdateSections={handleUpdateSections} />} />
          </Route>
        </Routes>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-300 py-16 mt-24 border-t border-slate-800 text-left rtl:text-right relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

            {/* Column 1: Brand & Social */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="p-1.5 bg-slate-800 rounded-lg border border-slate-700">
                  <FlaskConical className="h-6 w-6 text-cyan-500" />
                </div>
                <span className="font-black text-2xl text-white tracking-tight">Alzah<span className="text-cyan-500">rany</span></span>
              </div>
              <p className="text-slate-400 mb-6 leading-relaxed text-sm">
                Empowering scientific discovery with precision instruments and cutting-edge laboratory solutions since 2010.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-cyan-600 hover:text-white transition-all border border-slate-700 hover:border-cyan-500">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-cyan-600 hover:text-white transition-all border border-slate-700 hover:border-cyan-500">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-cyan-600 hover:text-white transition-all border border-slate-700 hover:border-cyan-500">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-cyan-600 hover:text-white transition-all border border-slate-700 hover:border-cyan-500">
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6 relative inline-block">
                {t.footerLinks}
                <span className="absolute -bottom-2 left-0 w-12 h-1 bg-cyan-500 rounded-full rtl:right-0"></span>
              </h4>
              <ul className="space-y-3">
                <li><Link to="/" className="hover:text-cyan-400 transition-colors flex items-center gap-2 text-sm"><ArrowRight className="w-3 h-3 rtl:hidden" /><ArrowLeft className="w-3 h-3 hidden rtl:block" /> {t.home}</Link></li>
                <li><Link to="/catalog" className="hover:text-cyan-400 transition-colors flex items-center gap-2 text-sm"><ArrowRight className="w-3 h-3 rtl:hidden" /><ArrowLeft className="w-3 h-3 hidden rtl:block" /> {t.catalog}</Link></li>
                <li><a href="/#partners" className="hover:text-cyan-400 transition-colors flex items-center gap-2 text-sm"><ArrowRight className="w-3 h-3 rtl:hidden" /><ArrowLeft className="w-3 h-3 hidden rtl:block" /> {t.navPartners}</a></li>
                <li><Link to="/about" className="hover:text-cyan-400 transition-colors flex items-center gap-2 text-sm"><ArrowRight className="w-3 h-3 rtl:hidden" /><ArrowLeft className="w-3 h-3 hidden rtl:block" /> {t.aboutTitle}</Link></li>
                <li><Link to="/admin" className="hover:text-cyan-400 transition-colors flex items-center gap-2 text-sm"><ArrowRight className="w-3 h-3 rtl:hidden" /><ArrowLeft className="w-3 h-3 hidden rtl:block" /> {t.admin}</Link></li>
              </ul>
            </div>

            {/* Column 3: Contact Info */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6 relative inline-block">
                {t.footerContact}
                <span className="absolute -bottom-2 left-0 w-12 h-1 bg-cyan-500 rounded-full rtl:right-0"></span>
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 group">
                  <div className="mt-1 p-2 rounded-full bg-slate-800 text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-sm leading-relaxed">123 Science Park District,<br />King Abdullah Rd, Jeddah, KSA</span>
                </li>
                <li className="flex items-center gap-3 group">
                  <div className="p-2 rounded-full bg-slate-800 text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="text-sm">+966 12 345 6789</span>
                </li>
                <li className="flex items-center gap-3 group">
                  <div className="p-2 rounded-full bg-slate-800 text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-sm">info@alzahrany-lab.com</span>
                </li>
              </ul>
            </div>

            {/* Column 4: Newsletter */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6 relative inline-block">
                {t.footerNewsletter}
                <span className="absolute -bottom-2 left-0 w-12 h-1 bg-cyan-500 rounded-full rtl:right-0"></span>
              </h4>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">{t.newsletterDesc}</p>
              <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500 rtl:right-3 rtl:left-auto" />
                  <input
                    type="email"
                    placeholder={t.emailPlaceholder}
                    className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all text-sm"
                  />
                </div>
                <button type="submit" className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-cyan-900/20 text-sm">
                  {t.subscribe}
                </button>
              </form>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} Alzahrany Scientific Instruments. {t.rightsReserved}</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-cyan-400 transition-colors">{t.privacyPolicy}</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">{t.termsOfService}</a>
            </div>
          </div>
        </div>
      </footer>

      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} t={t} />}

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
        .animate-fade-in-right { animation: fadeInRight 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .cursor-wait { cursor: wait; }
      `}</style>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}