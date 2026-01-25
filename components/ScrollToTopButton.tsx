import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTopButton: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            // Show button when page is scrolled down 300px
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <button
            onClick={scrollToTop}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`
                fixed bottom-6 right-6 z-50
                w-14 h-14 rounded-full
                bg-gradient-to-br from-cyan-500 to-blue-600
                text-white shadow-lg
                flex items-center justify-center
                transition-all duration-500 ease-out
                hover:shadow-cyan-500/50 hover:shadow-xl
                hover:scale-110
                active:scale-95
                ${isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-16 pointer-events-none'
                }
            `}
            aria-label="Scroll to top"
            style={{
                backdropFilter: 'blur(10px)',
            }}
        >
            {/* Animated Arrow */}
            <ArrowUp
                className={`
                    w-6 h-6 
                    transition-transform duration-300
                    ${isHovered ? '-translate-y-1 animate-bounce' : ''}
                `}
            />

            {/* Pulse Ring Animation */}
            <span
                className={`
                    absolute inset-0 rounded-full
                    bg-cyan-400/30
                    transition-all duration-500
                    ${isHovered ? 'animate-ping' : 'opacity-0'}
                `}
            />

            {/* Outer Glow Ring */}
            <span
                className={`
                    absolute -inset-1 rounded-full
                    bg-gradient-to-br from-cyan-400/20 to-blue-500/20
                    blur-sm
                    transition-opacity duration-300
                    ${isHovered ? 'opacity-100' : 'opacity-0'}
                `}
            />
        </button>
    );
};

export default ScrollToTopButton;
