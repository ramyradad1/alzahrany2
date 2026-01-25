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
    const paddingY = content?.paddingY || '48';

    const basePadding = parseInt(paddingY) || 48;

    const containerStyle: React.CSSProperties = {
        backgroundColor: bgColor,
        color: textColor,
        position: 'relative',
        overflow: 'hidden',
        minHeight: sectionHeight === 'auto' ? 'auto' : sectionHeight,
        paddingTop: `${basePadding}px`,
        paddingBottom: `${basePadding}px`,
        width: '100%',
        zIndex: 1,
    };

    const bgImageStyle: React.CSSProperties = bgImage ? {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `url(${bgImage})`,
        backgroundSize: bgSize,
        backgroundPosition: bgPosition,
        backgroundRepeat: 'no-repeat',
        opacity: bgOpacity,
        zIndex: 0,
    } : {};

    return (
        <section id={section.id} style={containerStyle}>
            {/* Background Image Layer */}
            {bgImage && <div style={bgImageStyle} aria-hidden="true" />}

            {/* Content Layer */}
            <div
                className="container mx-auto px-4 sm:px-6 relative"
                style={{ zIndex: 10 }}
            >
                <div
                    className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert mx-auto max-w-4xl"
                    style={{
                        color: textColor,
                        textAlign: 'center',
                    }}
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
            </div>
        </section>
    );
};
