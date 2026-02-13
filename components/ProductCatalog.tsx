import React, { useMemo, useState, useEffect } from 'react';
import { Filter, ChevronRight, ChevronLeft } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../src/db';
import { Product, Translations, CatalogContent, Language } from '../types';
import { ProductCard } from './ProductCard';
// import { supabase } from '../utils/supabase'; // Not used currently

interface ProductCatalogProps {
    t: Translations;
    searchQuery: string;
    onProductClick: (product: Product) => void;
    content?: CatalogContent;
    lang?: Language;
}

const ITEMS_PER_PAGE = 12;

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ t, searchQuery: propSearchQuery, onProductClick, content, lang = 'en' }) => {
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [page, setPage] = useState(0);

    // Sync category with URL
    const location = useLocation();
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const catParam = params.get('category');
        if (catParam) {
            setActiveCategory(catParam);
        }
    }, [location.search]);

    const availableCategories = useLiveQuery(async () => {
        const cats = await db.categories.orderBy('name_en').toArray();
        const catNames = cats.map(c => (lang === 'ar' && c.name_ar ? c.name_ar : c.name_en).trim());
        // Deduplicate categories using Set
        return ['All', ...Array.from(new Set(catNames))];
    }, [lang]) || ['All'];

    // Query Products from Local DB
    const { products, totalCount } = useLiveQuery(async () => {
        let collection = db.products.toCollection();

        if (activeCategory !== 'All') {
            const category = await db.categories
                .filter(c => (lang === 'ar' && c.name_ar === activeCategory) || c.name_en === activeCategory)
                .first();

            if (category) {
                collection = db.products.where('category_id').equals(category.id);
            } else {
                collection = db.products.where('category').equals(activeCategory);
            }
        }

        if (propSearchQuery) {
            const lowerQuery = propSearchQuery.toLowerCase();
            collection = collection.filter(p =>
                p.name.toLowerCase().includes(lowerQuery) ||
                (p.description && p.description.toLowerCase().includes(lowerQuery))
            );
        }

        const count = await collection.count();
        const data = await collection
            .offset(page * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)
            .toArray();

        return {
            products: data,
            totalCount: count
        };
    }, [activeCategory, propSearchQuery, page]) || { products: [], totalCount: 0 };

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    // Reset page when filters change
    useEffect(() => {
        setPage(0);
    }, [activeCategory, propSearchQuery]);

    // Determine title/subtitle
    const title = (lang === 'en' ? content?.title_en : content?.title_ar) || t.catalog;
    const subtitle = (lang === 'en' ? content?.subtitle_en : content?.subtitle_ar);

    return (
        <div id="catalog" className="container mx-auto px-4 py-8 min-h-screen">

            {/* Header Section */}
            <div className="mb-8 text-center pt-8">
                <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-3">
                    {title}
                    <span className="text-lg bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 px-3 py-1 rounded-full shadow-inner">
                        {totalCount}
                    </span>
                </h2>

                {subtitle && (
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-4">
                        {subtitle}
                    </p>
                )}

                {propSearchQuery && (
                    <div className="mb-4 animate-fade-in">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium">
                            {t.search}: <span className="font-bold text-cyan-600 dark:text-cyan-400">"{propSearchQuery}"</span>
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-8 relative items-start">

                {/* Sidebar / Category Filter */}
                <aside className="w-full md:w-64 flex-shrink-0 z-20">

                    {/* Mobile: Horizontal Scroll */}
                    <div className="md:hidden relative group/scroll mb-6">
                        {/* Gradient Masks */}
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent z-10 pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent z-10 pointer-events-none" />

                        <div className="flex overflow-x-auto gap-3 py-2 px-1 scrollbar-hide snap-x snap-mandatory">
                            {availableCategories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                     className={`
                                        flex-shrink-0 snap-center px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border
                                        ${activeCategory === cat
                                             ? 'bg-cyan-600 text-white border-cyan-600 shadow-lg'
                                             : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                         }
                                    `}
                                 >
                                     {cat === 'All' ? t.allCategories : cat}
                                 </button>
                             ))}
                        </div>
                    </div>

                    {/* Desktop: Sticky Sidebar */}
                    <div className="hidden md:block sticky top-24">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-cyan-500" />
                                    {t.categories}
                                </h3>
                            </div>
                            <div className="p-2 space-y-1 max-h-[70vh] overflow-y-auto section-scrollbar">
                                {availableCategories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`
                                            w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-between group
                                            ${activeCategory === cat
                                                ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 shadow-sm border border-cyan-100 dark:border-cyan-900/30'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                                            }
                                        `}
                                    >
                                        <span>{cat === 'All' ? t.allCategories : cat}</span>
                                        {activeCategory === cat && (
                                            <ChevronRight className="w-4 h-4 text-cyan-500" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 w-full min-w-0">

                    {/* Products Grid */}
                    <div key={activeCategory} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {products.length > 0 ? products.map((p) => (
                            <ProductCard key={p.id} product={p} onClick={onProductClick} t={t} />
                        )) : (
                            // Empty State
                            <div className="col-span-full py-20 text-center text-slate-500 dark:text-slate-400 animate-fade-in-up">
                                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Filter className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{t.noProducts}</h3>
                                    <button
                                        onClick={() => setActiveCategory('All')}
                                        className="mt-4 px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold hover:opacity-90 transition-all"
                                    >
                                    {t.viewAll}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-12 flex-wrap">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                aria-label="Previous Page"
                                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i)}
                                    className={`
                                        w-10 h-10 rounded-lg font-bold transition-all
                                        ${page === i
                                            ? 'bg-cyan-600 text-white shadow-lg scale-105'
                                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500'
                                        }
                                    `}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page === totalPages - 1}
                                aria-label="Next Page"
                                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
