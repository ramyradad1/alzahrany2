import React, { useState, useEffect } from 'react';
import { MessageCircle, Facebook, Twitter, Instagram, Linkedin, X, Share2 } from 'lucide-react';

interface SocialLink {
    name: string;
    icon: React.ReactNode;
    url: string;
    color: string;
    hoverColor: string;
}

// Default social links - can be made configurable via admin
const DEFAULT_LINKS: SocialLink[] = [
    {
        name: 'WhatsApp',
        icon: <MessageCircle className="w-5 h-5" />,
        url: 'https://wa.me/966575808772',
        color: 'bg-green-500',
        hoverColor: 'hover:bg-green-600',
    },
    {
        name: 'Facebook',
        icon: <Facebook className="w-5 h-5" />,
        url: 'https://facebook.com/alzahrany',
        color: 'bg-blue-600',
        hoverColor: 'hover:bg-blue-700',
    },
    {
        name: 'Twitter',
        icon: <Twitter className="w-5 h-5" />,
        url: 'https://twitter.com/alzahrany',
        color: 'bg-sky-500',
        hoverColor: 'hover:bg-sky-600',
    },
    {
        name: 'Instagram',
        icon: <Instagram className="w-5 h-5" />,
        url: 'https://instagram.com/alzahrany',
        color: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400',
        hoverColor: 'hover:opacity-90',
    },
    {
        name: 'LinkedIn',
        icon: <Linkedin className="w-5 h-5" />,
        url: 'https://linkedin.com/company/alzahrany',
        color: 'bg-blue-700',
        hoverColor: 'hover:bg-blue-800',
    },
];

interface SocialLinksWidgetProps {
    links?: SocialLink[];
}

export const SocialLinksWidget: React.FC<SocialLinksWidgetProps> = ({ links = DEFAULT_LINKS }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Show widget only after scrolling past hero section (300px)
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
                setIsOpen(false); // Close menu when hidden
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div
            className={`
                fixed left-4 bottom-6 z-50 flex flex-col-reverse items-start gap-3
                transition-all duration-500 ease-out
                ${isVisible
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-20 pointer-events-none'
                }
            `}
        >
            {/* Social Links - Animate in/out */}
            <div className={`flex flex-col gap-2 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                {links.map((link, index) => (
                    <a
                        key={link.name}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`
                            w-12 h-12 rounded-full ${link.color} ${link.hoverColor}
                            text-white shadow-lg
                            flex items-center justify-center
                            transition-all duration-300 ease-out
                            hover:scale-110 hover:shadow-xl
                            active:scale-95
                        `}
                        style={{
                            transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
                            transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.8)',
                            opacity: isOpen ? 1 : 0,
                        }}
                        title={link.name}
                    >
                        {link.icon}
                    </a>
                ))}
            </div>

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-14 h-14 rounded-full
                    bg-gradient-to-br from-cyan-500 to-blue-600
                    text-white shadow-lg
                    flex items-center justify-center
                    transition-all duration-300 ease-out
                    hover:shadow-cyan-500/50 hover:shadow-xl
                    hover:scale-110
                    active:scale-95
                    ${isOpen ? 'rotate-45' : 'rotate-0'}
                `}
                aria-label={isOpen ? 'Close social links' : 'Open social links'}
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <Share2 className="w-6 h-6" />
                )}
            </button>

            {/* Pulse effect when closed */}
            {!isOpen && isVisible && (
                <span className="absolute bottom-0 left-0 w-14 h-14 rounded-full bg-cyan-400/30 animate-ping" />
            )}
        </div>
    );
};

export default SocialLinksWidget;
