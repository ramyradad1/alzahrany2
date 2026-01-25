import React, { useState } from 'react';
import { X, MessageCircle, CheckCircle2, ShieldCheck, Truck, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product, Translations } from '../types';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  t: Translations;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, t }) => {
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const phoneNumber = "15551234567";
  const hasPrice = typeof product.price === 'number' && product.price > 0;

  // Determine list of images to display
  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const formattedPrice = hasPrice ? new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.price!) : '';

  const handleWhatsAppClick = () => {
    const message = hasPrice
      ? `Hello, I would like to place an order/inquiry for the ${product.name} (${formattedPrice}).`
      : `Hello, I would like to inquire about the price and details for the ${product.name}.`;
      
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const isLongDescription = product.description.length > 150;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-fade-in-up border border-slate-200 dark:border-slate-700 max-h-[90vh] md:max-h-[800px] text-left rtl:text-right">
        
        {/* Close Button Mobile */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 rtl:left-4 rtl:right-auto z-20 md:hidden p-2 bg-white/80 dark:bg-slate-800/80 rounded-full text-slate-500"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Left Side: Image Carousel */}
        <div className="w-full md:w-1/2 bg-slate-100 dark:bg-slate-950 relative group h-64 md:h-auto overflow-hidden select-none">
          {/* Image Container */}
          <div className="w-full h-full relative">
            {images.map((img, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                  index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <img 
                  src={img} 
                  alt={`${product.name} view ${index + 1}`} 
                  className="w-full h-full object-cover object-center"
                />
              </div>
            ))}
          </div>

          {/* Navigation Controls (Only if multiple images) */}
          {images.length > 1 && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 rtl:right-4 rtl:left-auto top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
              >
                <ChevronLeft className="w-6 h-6 rtl:hidden" />
                <ChevronRight className="w-6 h-6 hidden rtl:block" />
              </button>
              
              <button 
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 rtl:left-4 rtl:right-auto top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
              >
                <ChevronRight className="w-6 h-6 rtl:hidden" />
                <ChevronLeft className="w-6 h-6 hidden rtl:block" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                    className={`h-2 rounded-full transition-all duration-300 shadow-sm ${
                      idx === currentImageIndex 
                        ? 'bg-white w-6' 
                        : 'bg-white/50 w-2 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent md:bg-gradient-to-r pointer-events-none z-10" />
          
          <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 rtl:left-auto rtl:right-8 z-20 pointer-events-none">
            <span className="inline-block px-3 py-1 bg-cyan-600 text-white text-xs font-bold uppercase tracking-wider rounded-full mb-2 shadow-lg">
              {product.category}
            </span>
          </div>
        </div>

        {/* Right Side: Details */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-900">
          <div className="hidden md:flex justify-end rtl:justify-start mb-4">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
            {product.name}
          </h2>
          
          {hasPrice && (
            <div className="flex items-baseline gap-4 mb-6">
              <span key={product.price} className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 font-mono animate-pop-in">
                {formattedPrice}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Excl. VAT & Shipping
              </span>
            </div>
          )}

          <div className={`mb-8 ${!hasPrice ? 'mt-4' : ''}`}>
            <p className={`text-slate-600 dark:text-slate-300 leading-relaxed ${!isDescExpanded && isLongDescription ? 'line-clamp-3' : ''}`}>
              {product.description}
            </p>
            {isLongDescription && (
              <button 
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className="mt-2 text-cyan-600 dark:text-cyan-400 text-sm font-medium hover:underline flex items-center gap-1"
              >
                {isDescExpanded ? (
                  <>{t.readLess} <ChevronUp className="w-3 h-3" /></>
                ) : (
                  <>{t.readMore} <ChevronDown className="w-3 h-3" /></>
                )}
              </button>
            )}
          </div>

          {/* Premium Tech Specs Card */}
          {product.specifications && product.specifications.length > 0 && (
            <div 
              className="mb-8 bg-slate-900 rounded-xl p-6 border border-slate-700/50 shadow-xl overflow-hidden relative animate-fade-in-up" 
              style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
            >
              {/* Subtle accent glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 bg-cyan-500 rounded-full"></div>
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-widest">
                  {t.techSpecs}
                </h3>
              </div>
              
              <div className="space-y-0">
                {product.specifications.map((spec, index) => (
                  <div key={index} className="flex justify-between items-center border-b border-slate-800 py-3 last:border-0 last:pb-0 first:pt-0 group hover:bg-white/5 transition-colors px-2 -mx-2 rounded">
                    <span className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">{spec.label}</span>
                    <span className="text-sm font-bold text-white text-right rtl:text-left">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trust Badges - High Fidelity */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-green-500/30 transition-all duration-300">
              <ShieldCheck className="w-6 h-6 text-green-500 mb-2" />
              <span className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-300 text-center leading-tight">{t.warranty}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all duration-300">
              <CheckCircle2 className="w-6 h-6 text-blue-500 mb-2" />
              <span className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-300 text-center leading-tight">{t.certified}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-purple-500/30 transition-all duration-300">
              <Truck className="w-6 h-6 text-purple-500 mb-2" />
              <span className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-300 text-center leading-tight">{t.shipping}</span>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800 relative group">
             {/* Tooltip */}
             <div className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform translate-y-2 group-hover:translate-y-0 shadow-xl whitespace-nowrap z-50">
                {phoneNumber}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900 dark:border-t-white"></div>
             </div>

             <button 
                onClick={handleWhatsAppClick}
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-slate-900 dark:bg-cyan-600 text-white rounded-xl font-bold text-lg hover:bg-slate-800 dark:hover:bg-cyan-500 transition-all shadow-lg hover:shadow-cyan-500/25 active:scale-[0.98]"
              >
                <MessageCircle className="w-6 h-6" />
                <span>{t.inquireWhatsApp}</span>
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};