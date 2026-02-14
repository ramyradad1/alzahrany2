import React, { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../src/db';
import { Category, Language, Translations, MenuItem } from '../types';
import { ChevronDown, ChevronRight, Filter, X, Folder, FolderOpen } from 'lucide-react';
import { supabase } from '../utils/supabase';

interface CategoryNode {
  id: string | number;
  name_en: string;
  name_ar: string;
  children?: CategoryNode[];
  href?: string;
  // Computed for display
  displayName?: string;
}

interface CategorySidebarProps {
  activeCategory: string;
  onSelectCategory: (categoryName: string) => void;
  isOpen: boolean;
  onClose: () => void;
  t: Translations;
  lang: Language;
}

const CategoryItem: React.FC<{
  node: CategoryNode;
  activeCategory: string;
  onSelectCategory: (name: string) => void;
  level: number;
  lang: Language;
}> = ({ node, activeCategory, onSelectCategory, level, lang }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const name = lang === 'en' ? node.name_en : node.name_ar;

  // Auto-expand if a child is active or self is active
  const isActive = activeCategory === name || (node.href && activeCategory === node.href);
  
  useEffect(() => {
     if (isActive) setIsExpanded(true);
  }, [isActive]);

  return (
    <div className="select-none">
      <div 
        className={`
          flex items-center justify-between px-3 py-2 rounded-lg mb-0.5 transition-colors
          ${isActive 
                  ? 'bg-cyan-50 dark:bg-cyan-900/20'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800'
          }
        `}
        style={{ paddingLeft: `${level * 12 + 12}px` }}
          >
              <div
                  role="button"
                  tabIndex={0}
                  className={`flex-1 flex items-center gap-2 overflow-hidden text-left ${isActive ? 'text-cyan-700 dark:text-cyan-400 font-bold' : 'text-slate-600 dark:text-slate-400'}`}
                  onClick={(e) => {
                      e.stopPropagation();
                      let categoryToSelect = name;
                      if (node.href && node.href.includes('category=')) {
                          const params = new URLSearchParams(node.href.split('?')[1]);
                          const cat = params.get('category');
                          if (cat) categoryToSelect = cat;
                      }
                      onSelectCategory(categoryToSelect);
                      if (hasChildren) setIsExpanded(!isExpanded);
                  }}
              >
          {hasChildren ? (
            isExpanded ? <FolderOpen className="w-4 h-4 text-cyan-500 flex-shrink-0" /> : <Folder className="w-4 h-4 text-slate-400 flex-shrink-0" />
          ) : (
                          <div className="w-4 h-4" />
          )}
          <span className="truncate">{name}</span>
              </div>
        
        {hasChildren && (
          <button 
                      type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
                      className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full text-slate-400"
                      aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />}
          </button>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="animate-slideDown overflow-hidden">
          {node.children!.map(child => (
            <CategoryItem 
              key={child.id} 
              node={child} 
              activeCategory={activeCategory} 
              onSelectCategory={onSelectCategory} 
              level={level + 1}
              lang={lang}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CategorySidebar: React.FC<CategorySidebarProps> = ({ 
  activeCategory, 
  onSelectCategory, 
  isOpen, 
  onClose,
  t,
  lang 
}) => {
  const [navItems, setNavItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const fetchConfig = async () => {
      // Check cache first
      const cached = localStorage.getItem('cached_navbar');
      if (cached) {
        try {
          const cfg = JSON.parse(cached);
          if (cfg.menu_items) {
             setNavItems(cfg.menu_items);
             return;
          }
        } catch (e) { /* ignore */ }
      }

      // Fetch from Supabase if not cached or empty
      const { data } = await supabase
        .from('navbar_config')
        .select('menu_items')
        .eq('id', 'main')
        .single();
      
      if (data?.menu_items) {
        setNavItems(data.menu_items);
      }
    };
    fetchConfig();
  }, []);

  const categoryTree = useMemo(() => {
    // Recursive mapper from MenuItem to CategoryNode
    const mapItemToNode = (item: MenuItem): CategoryNode => {
      return {
        id: item.id,
        name_en: item.label,
        name_ar: item.labelAr,
        href: item.href,
        children: item.children?.map(mapItemToNode) || []
      };
    };

    // Filter logic: Exclude standard nav items
    // We want only "Categories" essentially.
    // Based on user request, anything in the Navbar that ISN'T Home/About/Partners/Admin is likely a category root.
    // OR, specific items like "Product Catalog" might be the root?
    // User said: "Everything in navbar should be in categories sidebar". 
    // Usually "Equipments", "Chemicals" are top level items.
    
    // items to exclude
    const excludeIds = ['1', '3', '4']; // Home, Partners, About (IDs from default)
    const excludeHrefs = ['/', '/about', '/#partners', '/admin'];

    // Also exclude "Products" main link if it just goes to catalog root without children?
    // Actually, "Products" (id: 2) might contain the categories as children!
    // Let's check if the user put categories inside "Products" or as top level items.
    // IF top level: filter by href/id.
    
    // If the user modified the navbar to have "Equipments", "Chemicals" etc. at top level.
    
    return navItems
      .filter(item => !excludeIds.includes(item.id) && !excludeHrefs.includes(item.href) && !item.href.startsWith('/admin'))
      .map(mapItemToNode);

  }, [navItems]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed lg:sticky lg:top-24 top-0 left-0 rtl:right-0 rtl:left-auto h-full lg:h-[calc(100vh-8rem)] 
          w-72 lg:w-64 bg-white dark:bg-slate-900 
          border-r rtl:border-l lg:border border-slate-200 dark:border-slate-800 
          shadow-2xl lg:shadow-sm rounded-none lg:rounded-2xl 
          z-50 lg:z-0 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 lg:rounded-t-2xl">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Filter className="w-4 h-4 text-cyan-500" />
            {t.categories}
          </h3>
          <button 
            onClick={onClose}
            className="lg:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {/* 'All Categories' Option */}
          <button
            onClick={() => onSelectCategory('All')}
            className={`
              w-full text-left px-3 py-2 rounded-lg mb-2 font-medium transition-colors flex items-center gap-2
              ${activeCategory === 'All'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }
            `}
          >
             <span className="w-4 flex justify-center">•</span>
             {t.allCategories}
          </button>
          
          <div className="border-t border-slate-100 dark:border-slate-800 my-2 mx-2" />

          {/* Recursive Tree */}
          {categoryTree.map(node => (
            <CategoryItem 
              key={node.id} 
              node={node} 
              activeCategory={activeCategory} 
              onSelectCategory={onSelectCategory} 
              level={0}
              lang={lang}
            />
          ))}
          
          {categoryTree.length === 0 && (
             <div className="px-4 py-8 text-center text-slate-400 text-sm">
                No categories found.
             </div>
          )}
        </div>
      </aside>
    </>
  );
};
