import React from 'react';
import { CachedImage } from '../components/common/CachedImage';
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
    const phoneNumber = "966575808772";
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
      className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(6,182,212,0.25)] hover:border-cyan-100 dark:hover:border-cyan-900/30 flex flex-col h-full cursor-pointer perspective-1000"
    >
      {/* Image Container */}
      <div className="relative aspect-[5/4] overflow-hidden bg-slate-50 dark:bg-slate-950">
        {product.image ? (
          <CachedImage
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-in-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600">
            <ImageIcon className="w-12 h-12" />
          </div>
        )}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Category Badge */}
        <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 z-10">
          <span className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm uppercase tracking-wider">
            {product.category}
          </span>
        </div>

        {/* Quick Actions (Appear on Hover) */}
        <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0 rtl:-translate-x-4 rtl:group-hover:translate-x-0">
          <div className="bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2 rounded-full flex items-center space-x-2 text-white font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg hover:bg-white/30">
            <button aria-label={t.quickView || 'Quick View'} className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>{t.quickView}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow relative bg-white dark:bg-slate-900 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/20 transition-colors duration-300">

        <div className="mb-4">
          {/* Title & Arrow */}
          <div className="flex justify-between items-start gap-4 mb-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-300 line-clamp-2">
              {product.name}
            </h3>
            <ArrowUpRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-cyan-500 transition-colors transform group-hover:translate-x-1 group-hover:-translate-y-1 rtl:group-hover:-translate-x-1 flex-shrink-0" />
          </div>

          <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed mb-4">
            {product.description}
          </p>

          {/* Specs Tags */}
          {previewSpecs.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {previewSpecs.map((spec, i) => (
                  <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {spec.label}: {spec.value}
                  </span>
                ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          {hasPrice ? (
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Price</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
                {formattedPrice}
              </span>
            </div>
          ) : (
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 italic">
              {t.priceOnRequest || 'Price on Request'}
            </span>
          )}

          <button
            onClick={handleWhatsAppClick}
            className={`flex items-center justify-center p-2.5 rounded-xl transition-all duration-300 ${hasPrice
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-cyan-500 hover:text-white dark:hover:bg-cyan-500'
                : 'w-full bg-slate-900 dark:bg-cyan-600 text-white hover:bg-cyan-600 dark:hover:bg-cyan-500 shadow-lg hover:shadow-cyan-500/20'
              }`}
            title={t.inquire}
            aria-label={t.inquire}
          >
            <MessageCircle className="w-5 h-5" />
            {!hasPrice && <span className="ml-2 font-bold text-sm">{t.inquire}</span>}
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