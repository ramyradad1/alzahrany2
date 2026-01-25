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

    const style: React.CSSProperties = {
        backgroundColor: bgColor,
        backgroundImage: bgImage ? `url(${bgImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: textColor,
    };

    return (
        <div id={section.id} className="w-full py-16 px-4" style={style}>
            <div className="container mx-auto prose dark:prose-invert max-w-4xl">
                {/* Render HTML content safely */}
                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </div>
        </div>
    );
};
