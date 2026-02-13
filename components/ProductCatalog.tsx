import React, { useState, useEffect } from 'react';
import { Filter, ChevronRight, ChevronLeft } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../src/db';
import { Product, Translations, CatalogContent, Language } from '../types';
import { ProductCard } from './ProductCard';
import { CategorySidebar } from './CategorySidebar';
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Sync category with URL or Content Config
    const location = useLocation();
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const catParam = params.get('category');

        if (catParam) {
            setActiveCategory(catParam);
        } else if (content?.selectedCategory) {
            setActiveCategory(content.selectedCategory);
        }
    }, [location.search, content?.selectedCategory]);

    // Query Products from Local DB with Enhanced Search
    const { products, totalCount } = useLiveQuery(async () => {
        let collection = db.products.toCollection();

        // 1. Filter by Active Category (Recursive)
        if (activeCategory !== 'All') {
            const category = await db.categories
                .filter(c => (lang === 'ar' && c.name_ar === activeCategory) || c.name_en === activeCategory)
                .first();

            if (category) {
                // Fetch all category IDs in the subtree
                const allCategories = await db.categories.toArray();
                const getSubtreeIds = (parentId: number): number[] => {
                    const children = allCategories.filter(c => c.parent_id === parentId);
                    let ids = [parentId];
                    children.forEach(c => {
                        ids = [...ids, ...getSubtreeIds(c.id)];
                    });
                    return ids;
                };

                const categoryIds = getSubtreeIds(category.id);
                collection = db.products.where('category_id').anyOf(categoryIds);
            } else {
                // Fallback for legacy string-based categories
                collection = db.products.where('category').equals(activeCategory);
            }
        }

        // 2. Apply Search Filter (Context-Aware: Name, Desc, Category, Parent Category)
        if (propSearchQuery) {
            const lowerQuery = propSearchQuery.toLowerCase();
            const allCategories = await db.categories.toArray();

            // Helper to check if a category or its parents match the query
            const categoryMatches = (categoryId: number | undefined): boolean => {
                if (!categoryId) return false;
                let current = allCategories.find(c => c.id === categoryId);
                while (current) {
                    if (current.name_en?.toLowerCase().includes(lowerQuery) ||
                        current.name_ar?.toLowerCase().includes(lowerQuery)) {
                        return true;
                    }
                    current = allCategories.find(c => c.id === current.parent_id);
                }
                return false;
            };

            collection = collection.filter(p => {
                // Match Name
                if (p.name?.toLowerCase().includes(lowerQuery)) return true;

                // Match Description
                if (p.description?.toLowerCase().includes(lowerQuery)) return true;

                // Match Category Field (Legacy/Fallback)
                if (p.category?.toLowerCase().includes(lowerQuery)) return true;

                // Match Category Hierarchy (Deep Search)
                if (p.category_id && categoryMatches(p.category_id)) return true;

                return false;
            });
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
    }, [activeCategory, propSearchQuery, page, lang]) || { products: [], totalCount: 0 };

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    // Reset page when filters change
    useEffect(() => {
        setPage(0);
        setIsSidebarOpen(false); // Close sidebar on mobile on selection
    }, [activeCategory, propSearchQuery]);

    // Determine title/subtitle
    const title = (lang === 'en' ? content?.title_en : content?.title_ar) || t.catalog;
    const subtitle = (lang === 'en' ? content?.subtitle_en : content?.subtitle_ar);

    return (
        <div id="catalog" className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">

            {/* Header Section */}
            <div className="mb-8 text-center pt-8">
                <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-3">
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

            <div className="flex flex-col lg:flex-row gap-8 relative items-start">

                {/* Mobile Filter Button */}
                <div className="lg:hidden w-full mb-4">
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm text-slate-700 dark:text-slate-200 font-medium"
                    >
                        <span className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-cyan-500" />
                            {t.categories}
                        </span>
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Sidebar Component */}
                <CategorySidebar
                    activeCategory={activeCategory}
                    onSelectCategory={setActiveCategory}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    t={t}
                    lang={lang}
                />

                {/* Main Content Area */}
                <div className="flex-1 w-full min-w-0">

                    {/* Products Grid */}
                    <div key={activeCategory} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
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
                            {/* First Page */}
                            <button
                                onClick={() => setPage(0)}
                                disabled={page === 0}
                                aria-label="First Page"
                                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors hidden sm:flex"
                            >
                                <span className="font-bold">{t.paginationFirst}</span>
                            </button>

                            {/* Previous */}
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                aria-label="Previous Page"
                                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            {/* Page Numbers Window */}
                            {(() => {
                                const windowSize = 5;
                                let startPage = Math.max(0, page - Math.floor(windowSize / 2));
                                let endPage = startPage + windowSize;

                                if (endPage > totalPages) {
                                    endPage = totalPages;
                                    startPage = Math.max(0, endPage - windowSize);
                                }

                                const pages = [];
                                if (startPage > 0) {
                                    pages.push('...'); 
                                }

                                for (let i = startPage; i < endPage; i++) {
                                    pages.push(i);
                                }

                                if (endPage < totalPages) {
                                    pages.push('...');
                                }

                                return pages.map((p, idx) => (
                                    typeof p === 'number' ? (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={`
                                                w-10 h-10 rounded-lg font-bold transition-all
                                                ${page === p
                                                    ? 'bg-cyan-600 text-white shadow-lg scale-105'
                                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500'
                                                }
                                            `}
                                        >
                                            {p + 1}
                                        </button>
                                    ) : (
                                            <span key={`ellipsis-${idx}`} className="px-1 text-slate-400">...</span>
                                    )
                                ));
                            })()}

                            {/* Next */}
                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page === totalPages - 1}
                                aria-label="Next Page"
                                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>

                            {/* Last Page */}
                            <button
                                onClick={() => setPage(totalPages - 1)}
                                disabled={page === totalPages - 1}
                                aria-label="Last Page"
                                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors hidden sm:flex"
                            >
                                <span className="font-bold">{t.paginationLast}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
