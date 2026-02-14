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
        paddingTop: (sectionHeight === 'auto' && content.images?.length && content.layoutMode !== 'row') ? 0 : `${basePadding}px`,
        paddingBottom: (sectionHeight === 'auto' && content.images?.length && content.layoutMode !== 'row') ? 0 : `${basePadding}px`,
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

            {/* Custom Images Layer */}
            {/* Custom Images Layer */}
            {/* Custom Images Layer */}
            {/* Custom Images Layer - Conditionally Rendered based on Layout Mode */}
            {sectionHeight === 'auto' && content.layoutMode === 'row' ? (
                // --- ROW LAYOUT MODE ---
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap', // Responsive wrapping
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: content.gap || '24px', // Use configurable gap or default
                    position: 'relative',
                    zIndex: 5,
                    width: '100%'
                }}>
                    {content.images?.map((img) => (
                        <img
                            key={img.id}
                            src={img.url}
                            alt=""
                            style={{
                                width: img.size && img.size !== 'auto'
                                    ? (['cover', 'contain', 'stretch'].includes(img.size) ? '100%' : img.size)
                                    : img.width || 'auto',
                                height: 'auto',
                                maxWidth: '100%', // Ensure responsiveness
                                objectFit: (['cover', 'contain'].includes(img.size || '') ? img.size as any : undefined),
                                flexBasis: img.size && !['cover', 'contain', 'stretch', 'auto'].includes(img.size) ? img.size : undefined,
                                minHeight: img.minHeight && img.minHeight !== 'auto' ? img.minHeight : undefined,
                                paddingTop: img.paddingY ? `${img.paddingY}px` : undefined,
                                paddingBottom: img.paddingY ? `${img.paddingY}px` : undefined,
                                boxSizing: 'border-box', // Ensure padding is included in size
                                opacity: img.opacity ?? 1,
                                transform: `rotate(${img.rotation || 0}deg)`,
                                zIndex: img.zIndex || 5,
                            }}
                        />
                    ))}
                </div>
            ) : (
                // --- ABSOLUTE / DEFAULT LAYOUT MODE ---
                content.images?.map((img, index) => {
                    // If sectionHeight is 'auto', the first image drives the layout (relative)
                    // All other images are absolute
                    const isMainImage = sectionHeight === 'auto' && index === 0 && content.layoutMode !== 'row';

                    let imgStyle: React.CSSProperties = {
                        position: isMainImage ? 'relative' : 'absolute',
                        zIndex: img.zIndex || 5,
                        opacity: img.opacity ?? 1,
                        pointerEvents: 'none',
                        transform: `rotate(${img.rotation || 0}deg)`,
                        display: 'block', // Ensure no bottom gap
                        minHeight: img.minHeight && img.minHeight !== 'auto' ? img.minHeight : undefined,
                        paddingTop: img.paddingY ? `${img.paddingY}px` : undefined,
                        paddingBottom: img.paddingY ? `${img.paddingY}px` : undefined,
                        boxSizing: 'border-box',
                    };

                    // Position Logic (Only for absolute images)
                    if (!isMainImage) {
                        if (img.position) {
                            switch (img.position) {
                                case 'center':
                                    imgStyle.top = '50%';
                                    imgStyle.left = '50%';
                                    imgStyle.transform += ' translate(-50%, -50%)';
                                    break;
                                case 'top':
                                    imgStyle.top = 0;
                                    imgStyle.left = '50%';
                                    imgStyle.transform += ' translate(-50%, 0)';
                                    break;
                                case 'bottom':
                                    imgStyle.bottom = 0;
                                    imgStyle.left = '50%';
                                    imgStyle.transform += ' translate(-50%, 0)';
                                    break;
                                case 'left':
                                    imgStyle.top = '50%';
                                    imgStyle.left = 0;
                                    imgStyle.transform += ' translate(0, -50%)';
                                    break;
                                case 'right':
                                    imgStyle.top = '50%';
                                    imgStyle.right = 0;
                                    imgStyle.transform += ' translate(0, -50%)';
                                    break;
                                case 'top left':
                                    imgStyle.top = 0;
                                    imgStyle.left = 0;
                                    break;
                                case 'top right':
                                    imgStyle.top = 0;
                                    imgStyle.right = 0;
                                    break;
                                case 'bottom left':
                                    imgStyle.bottom = 0;
                                    imgStyle.left = 0;
                                    break;
                                case 'bottom right':
                                    imgStyle.bottom = 0;
                                    imgStyle.right = 0;
                                    break;
                                default: // 'custom' or undefined fallback
                                    imgStyle.top = img.top || '50%';
                                    imgStyle.left = img.left || '50%';
                                    if (!img.top && !img.left) imgStyle.transform += ' translate(-50%, -50%)';
                            }
                        } else {
                            // Fallback to manual top/left
                            imgStyle.top = img.top || '50%';
                            imgStyle.left = img.left || '50%';
                            imgStyle.transform += ' translate(-50%, -50%)';
                        }
                    } else {
                        // Main Image Styling
                        imgStyle.width = '100%';
                        imgStyle.height = 'auto'; // Maintain aspect ratio
                    }

                    // Size Logic (Only for absolute images)
                    if (!isMainImage) {
                        if (img.size) {
                            if (['cover', 'contain'].includes(img.size)) {
                                imgStyle.width = '100%';
                                imgStyle.height = '100%';
                                imgStyle.objectFit = img.size as 'cover' | 'contain';
                            } else if (img.size === 'auto') {
                                imgStyle.width = 'auto';
                                imgStyle.height = 'auto';
                            } else if (img.size === 'stretch') {
                                imgStyle.width = '100%';
                                imgStyle.height = '100%';
                            } else {
                                imgStyle.width = img.size;
                                imgStyle.height = 'auto';
                            }
                        } else {
                            imgStyle.width = img.width || 'auto';
                            imgStyle.height = img.height || 'auto';
                        }
                    }

                    return (
                        <img
                            key={img.id}
                            src={img.url}
                            alt=""
                            style={imgStyle}
                        />
                    );
                })
            )}

            {/* Content Layer */}
            {/* Content Layer - Absolute if we have a main image driving height */}
            <div
                className="container mx-auto px-4 sm:px-6 relative"
                style={{
                    zIndex: 10,
                    position: sectionHeight === 'auto' && content.images?.length && content.layoutMode !== 'row' ? 'absolute' : 'relative',
                    top: sectionHeight === 'auto' && content.images?.length && content.layoutMode !== 'row' ? '50%' : 'auto',
                    left: sectionHeight === 'auto' && content.images?.length && content.layoutMode !== 'row' ? '50%' : 'auto',
                    transform: sectionHeight === 'auto' && content.images?.length && content.layoutMode !== 'row' ? 'translate(-50%, -50%)' : 'none',
                    width: '100%'
                }}
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
