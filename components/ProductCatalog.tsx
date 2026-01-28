import React, { useMemo, useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Product, Translations, CatalogContent, Language } from '../types';
import { ProductCard } from './ProductCard';

const RevealOnScroll: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className = "" }) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            style={{ transitionDelay: `${delay}ms` }}
            className={`transition-all duration-400 ease-out transform ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-98'
                } ${className}`}
        >
            {children}
        </div>
    );
};

interface ProductCatalogProps {
    products: Product[];
    t: Translations;
    searchQuery: string;
    onProductClick: (product: Product) => void;
    content?: CatalogContent;
    lang?: Language;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ products, t, searchQuery, onProductClick, content, lang = 'en' }) => {
    const [activeCategory, setActiveCategory] = useState<string>('All');

    // START CHANGE: Sync category with URL
    const location = useLocation();
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const catParam = params.get('category');
        if (catParam) {
            setActiveCategory(catParam);
        }
    }, [location.search]);
    // END CHANGE

    const categories = useMemo(() => {
        const cats = new Set(products.map(p => p.category));
        return ['All', ...Array.from(cats)];
    }, [products]);

    const filteredProducts = useMemo(() => {
        let result = products;
        if (activeCategory !== 'All') {
            result = result.filter(p => p.category === activeCategory);
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p =>
                (p.name?.toLowerCase() || '').includes(q) ||
                (p.description?.toLowerCase() || '').includes(q) ||
                (p.category?.toLowerCase() || '').includes(q)
            );
        }
        return result;
    }, [products, activeCategory, searchQuery]);

    const title = (lang === 'en' ? content?.title_en : content?.title_ar) || t.catalog;
    const subtitle = (lang === 'en' ? content?.subtitle_en : content?.subtitle_ar);

    return (
        <div id="catalog" className="container mx-auto px-4 py-12 min-h-screen">
            <div className="mb-12 text-center pt-8">
                <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-6 flex items-center justify-center gap-3">
                    {title}
                    <span className="text-lg bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 px-3 py-1 rounded-full shadow-inner">{filteredProducts.length}</span>
                </h2>
                {subtitle && (
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-4">
                        {subtitle}
                    </p>
                )}

                {searchQuery && (
                    <div className="mb-8 animate-fade-in">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium">
                            {t.search}: <span className="font-bold text-cyan-600 dark:text-cyan-400">"{searchQuery}"</span>
                        </span>
                    </div>
                )}

                <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 border ${activeCategory === cat
                                ? 'bg-cyan-600 text-white border-cyan-600 shadow-lg shadow-cyan-500/30'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-cyan-500/50 hover:text-cyan-600 dark:hover:text-cyan-400'
                                }`}
                        >
                            {cat === 'All' ? t.allCategories : cat}
                        </button>
                    ))}
                </div>
            </div>

            <div key={activeCategory} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((p) => (
                    <ProductCard key={p.id} product={p} onClick={onProductClick} t={t} />
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-20 text-slate-500 dark:text-slate-400 animate-fade-in-up">
                    <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Filter className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No instruments found</h3>
                    <p className="text-slate-500 mb-6">{t.noProducts}</p>
                    <button
                        onClick={() => { setActiveCategory('All'); }}
                        className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold hover:opacity-90"
                    >
                        Clear Filters
                    </button>
                </div>
            )}
        </div>
    );
};
