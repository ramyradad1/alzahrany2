import React from 'react';
import { MessageCircle, ArrowUpRight, Eye, Image as ImageIcon } from 'lucide-react';
import { Product, Translations } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  t: Translations;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, t }) => {
  const hasPrice = typeof product.price === 'number' && product.price > 0;

  const formattedPrice = hasPrice ? new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.price!) : '';

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent modal opening
    const phoneNumber = "15551234567"; 
    const message = hasPrice 
      ? `Hello, I am interested in the ${product.name} listed for ${formattedPrice}. Could you provide more details?`
      : `Hello, I am interested in the ${product.name}. Could you please provide a price quote and more details?`;
      
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const previewSpecs = product.specifications ? product.specifications.slice(0, 2) : [];

  return (
    <div 
      onClick={() => onClick(product)}
      className="group relative bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(6,182,212,0.4)] dark:hover:shadow-[0_20px_40px_-15px_rgba(6,182,212,0.3)] flex flex-col h-full cursor-pointer text-left rtl:text-right"
    >
      
      {/* Glow Effect on Hover */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500 group-hover:duration-200 pointer-events-none"></div>

      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-900 z-10">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600">
             <ImageIcon className="w-12 h-12" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* View Details Overlay Text */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
           <div className="bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2 rounded-full flex items-center space-x-2 text-white font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg hover:bg-white/30">
              <Eye className="w-4 h-4" />
              <span>{t.quickView}</span>
           </div>
        </div>

        {/* Category Badge */}
        <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4">
            <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-cyan-700 dark:text-cyan-400 border border-slate-200 dark:border-slate-700 shadow-sm uppercase tracking-wide">
              {product.category}
            </span>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow relative z-10 bg-white dark:bg-slate-850 transition-colors duration-300">
        <div className="mb-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-300">
              {product.name}
            </h3>
            <ArrowUpRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-cyan-500 transition-colors transform group-hover:translate-x-1 group-hover:-translate-y-1 rtl:group-hover:-translate-x-1" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed mb-3">
            {product.description}
          </p>

          {/* Specs Preview */}
          {previewSpecs.length > 0 && (
            <div className="space-y-1 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              {previewSpecs.map((spec, i) => (
                <div key={i} className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">{spec.label}:</span>
                  <span>{spec.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Conditional Footer Layout */}
        <div className={`mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center ${hasPrice ? 'justify-between' : 'justify-center'}`}>
          {hasPrice && (
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight animate-pop-in">
              {formattedPrice}
            </span>
          )}
          
          <button 
            onClick={handleWhatsAppClick}
            className={`flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-cyan-600 text-white rounded-xl font-bold text-sm hover:bg-cyan-600 dark:hover:bg-cyan-500 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] ${!hasPrice ? 'w-full justify-center' : ''}`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>{t.inquire}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const ProductSkeleton = () => (
  <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden h-full flex flex-col relative">
    {/* Shimmer Effect */}
    <div className="absolute inset-0 z-20 bg-gradient-to-r from-transparent via-white/40 dark:via-slate-700/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
    
    <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-800" />
    <div className="p-6 flex flex-col flex-grow space-y-4">
      {/* Title */}
      <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
      
      {/* Description */}
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
      </div>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-24" />
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-32" />
      </div>
    </div>
  </div>
);