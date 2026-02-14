import React, { useState } from 'react';
import { MessageCircle, Phone, Mail, FileText, ChevronUp, ChevronDown } from 'lucide-react';

export const SocialLinksWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  // Default links - can be customized or fetched from settings
  const socialLinks = [
    { icon: <MessageCircle className="w-5 h-5" />, label: 'WhatsApp', href: 'https://wa.me/966575818827', color: 'bg-green-500' },
    { icon: <Phone className="w-5 h-5" />, label: 'Call', href: 'tel:+966575818827', color: 'bg-blue-500' },
    { icon: <Mail className="w-5 h-5" />, label: 'Email', href: 'mailto:Sales@arkan-labtech.com', color: 'bg-red-500' },
  ];

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-center gap-3">
      {/* Expanded Links (Animate Upwards) */}
      <div className={`flex flex-col-reverse gap-3 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        {socialLinks.map((link, index) => (
          <a
            key={index}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-10 h-10 flex items-center justify-center rounded-full text-white shadow-lg hover:scale-110 transition-transform ${link.color}`}
            title={link.label}
          >
            {link.icon}
          </a>
        ))}
      </div>

      {/* Main FAB Toggle Button */}
      <button
        onClick={toggleOpen}
        className="w-12 h-12 flex items-center justify-center rounded-full bg-cyan-600 text-white shadow-lg hover:bg-cyan-700 transition-colors"
        aria-label="Toggle Social Links"
      >
        {isOpen ? <ChevronDown className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
};
