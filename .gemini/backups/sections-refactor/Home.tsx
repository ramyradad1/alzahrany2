import React from 'react';
import { Section, Product, Partner, Translations, Language } from '../types';
import { Hero } from './Hero';
import { ProductCard } from './ProductCard';
import { Partners } from './Partners';
import { About } from './About';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// Simple RevealOnScroll component if not already exported or shared
// For now, I'll inline a simple version or assume it's available.
// Since it's small, I'll redefine it to avoid export issues or move it to a shared file later.
// Actually, App.tsx had it inline. I should probably create a shared component file but to save steps, I'll inline it here.

const RevealOnScroll: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className = "" }) => {
    const [isVisible, setIsVisible] = React.useState(false);
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
            className={`transition-all duration-700 ease-out transform ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
                } ${className}`}
        >
            {children}
        </div>
    );
};

interface HomeProps {
    sections: Section[];
    products: Product[];
    partners: Partner[];
    t: Translations;
    lang: Language;
    onProductClick: (product: Product) => void;
}

export const Home: React.FC<HomeProps> = ({ sections, products, partners, t, lang, onProductClick }) => {
    const navigate = useNavigate();

    return (
        <>
            {sections
                .filter(section => section.is_visible)
                .sort((a, b) => a.order - b.order)
                .map(section => {
                    switch (section.id) {
                        case 'hero':
                            return (
                                <div key="hero" id="hero">
                                    <Hero t={t} lang={lang} onShopNow={() => navigate('/catalog')} content={section.content} />
                                </div>
                            );
                        case 'catalog':
                            return (
                                <div key="catalog" className="container mx-auto px-4 py-24">
                                    <RevealOnScroll>
                                        <div className="flex justify-between items-end mb-12">
                                            <div>
                                                <h2 className="text-3xl font-black mb-2">{t.catalog}</h2>
                                                <p className="text-slate-500 dark:text-slate-400">Latest additions to our inventory</p>
                                            </div>
                                            <Link
                                                to="/catalog"
                                                className="text-cyan-600 font-bold hover:text-cyan-500 flex items-center gap-2 group"
                                            >
                                                {t.viewAll}
                                                {lang === 'en' ? <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> : <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />}
                                            </Link>
                                        </div>
                                    </RevealOnScroll>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {products.slice(0, 3).map((p, idx) => (
                                            <RevealOnScroll key={p.id} delay={idx * 100}>
                                                <ProductCard product={p} onClick={onProductClick} t={t} />
                                            </RevealOnScroll>
                                        ))}
                                    </div>
                                </div>
                            );
                        case 'partners':
                            return (
                                <div key="partners" id="partners">
                                    <Partners partners={partners} title={t.trustedPartners} />
                                </div>
                            );
                        case 'about':
                            return <About key="about" t={t} />;
                        default:
                            return null;
                    }
                })}
        </>
    );
};
