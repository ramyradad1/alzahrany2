import React from 'react';
import { Section } from '../types';

interface CustomSectionProps {
    section: Section;
}

export const CustomSection: React.FC<CustomSectionProps> = ({ section }) => {
    const { content } = section;

    // Default to empty if no content
    const htmlContent = content?.html || '';
    const bgColor = content?.bgColor || 'transparent';
    const bgImage = content?.bgImage || '';
    const textColor = content?.textColor || 'inherit';
    const bgPosition = content?.bgPosition || 'center';
    const bgSize = content?.bgSize || 'cover';
    const bgOpacity = content?.bgOpacity ?? 1;
    const sectionHeight = content?.sectionHeight || 'auto';
    const paddingY = content?.paddingY || '64';

    // Convert height for mobile responsiveness
    const getResponsiveHeight = (height: string): string => {
        if (height === 'auto') return 'auto';
        // For viewport-based heights, keep them as is (they're already responsive)
        if (height.includes('vh')) return height;
        // For fixed pixel heights, return auto on mobile (CSS will handle it)
        return height;
    };

    // Calculate responsive padding (reduce on mobile)
    const basePadding = parseInt(paddingY) || 64;
    const mobilePadding = Math.max(Math.floor(basePadding * 0.5), 16); // At least 16px on mobile

    const containerStyle: React.CSSProperties = {
        backgroundColor: bgColor,
        color: textColor,
        position: 'relative',
        overflow: 'hidden',
    };

    const bgImageStyle: React.CSSProperties = bgImage ? {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url(${bgImage})`,
        backgroundSize: bgSize,
        backgroundPosition: bgPosition,
        backgroundRepeat: 'no-repeat',
        opacity: bgOpacity,
        zIndex: 0,
    } : {};

    // Generate unique ID for responsive styles
    const styleId = `section-style-${section.id}`;
    const responsiveHeight = getResponsiveHeight(sectionHeight);

    return (
        <>
            {/* Responsive Styles */}
            <style>{`
                #${section.id} {
                    min-height: ${responsiveHeight};
                    padding-top: ${basePadding}px;
                    padding-bottom: ${basePadding}px;
                }
                @media (max-width: 768px) {
                    #${section.id} {
                        min-height: ${responsiveHeight === 'auto' ? 'auto' : responsiveHeight.includes('vh') ? responsiveHeight : 'auto'};
                        padding-top: ${mobilePadding}px;
                        padding-bottom: ${mobilePadding}px;
                    }
                    #${section.id} .prose {
                        font-size: 0.95rem;
                    }
                    #${section.id} .prose h1 {
                        font-size: 1.75rem;
                    }
                    #${section.id} .prose h2 {
                        font-size: 1.5rem;
                    }
                    #${section.id} .prose h3 {
                        font-size: 1.25rem;
                    }
                }
                @media (max-width: 480px) {
                    #${section.id} {
                        padding-top: ${Math.max(mobilePadding - 8, 12)}px;
                        padding-bottom: ${Math.max(mobilePadding - 8, 12)}px;
                    }
                    #${section.id} .prose {
                        font-size: 0.9rem;
                    }
                    #${section.id} .prose h1 {
                        font-size: 1.5rem;
                    }
                    #${section.id} .prose h2 {
                        font-size: 1.25rem;
                    }
                }
            `}</style>

            <div id={section.id} className="w-full px-4 sm:px-6 lg:px-8" style={containerStyle}>
                {/* Background Image Layer with Opacity */}
                {bgImage && <div style={bgImageStyle} />}

                {/* Content Layer */}
                <div className="container mx-auto prose prose-sm sm:prose dark:prose-invert max-w-4xl relative z-10 
                    prose-headings:text-center prose-p:text-center sm:prose-p:text-left sm:prose-headings:text-left
                    prose-img:mx-auto prose-img:max-w-full prose-img:h-auto">
                    {/* Render HTML content safely */}
                    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                </div>
            </div>
        </>
    );
};
