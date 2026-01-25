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
    const paddingY = content?.paddingY || '64'; // default py-16 = 64px

    const containerStyle: React.CSSProperties = {
        backgroundColor: bgColor,
        color: textColor,
        position: 'relative',
        overflow: 'hidden',
        minHeight: sectionHeight === 'auto' ? 'auto' : sectionHeight,
        paddingTop: `${paddingY}px`,
        paddingBottom: `${paddingY}px`,
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

    return (
        <div id={section.id} className="w-full px-4" style={containerStyle}>
            {/* Background Image Layer with Opacity */}
            {bgImage && <div style={bgImageStyle} />}

            {/* Content Layer */}
            <div className="container mx-auto prose dark:prose-invert max-w-4xl relative z-10">
                {/* Render HTML content safely */}
                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </div>
        </div>
    );
};
