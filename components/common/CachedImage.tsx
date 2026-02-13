
import React, { useState, useEffect } from 'react';
import { getCachedImageSrc, cacheImage } from '../../src/services/imageCache';

interface CachedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null;
  fallbackSrc?: string;
  onImageLoad?: () => void;
  className?: string; // Explicitly included, though React.ImgHTMLAttributes has it, just to be sure
}

/**
 * A wrapper around the <img> tag that attempts to load the image from the local Dexie cache first.
 * If not found, it falls back to the network URL and triggers a background cache operation.
 */
export const CachedImage: React.FC<CachedImageProps> = ({ src, fallbackSrc, className, ...props }) => {
  const [imgSrc, setImgSrc] = useState<string>(''); // Initially empty to prevent flickering
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      if (!src) {
        setImgSrc(fallbackSrc || '');
        setIsLoading(false);
        return;
      }

      try {
        // 1. Try to get blob URL from cache
        const cachedUrl = await getCachedImageSrc(src);
        
        if (isMounted) {
            if (cachedUrl) {
                setImgSrc(cachedUrl);
            } else {
                // If getCachedImageSrc returns original URL (cache miss), it triggers background cache.
                // But specifically it returns "" (empty string) if url is empty.
                // Accessing cacheImage directly can be useful here if we want to force check.
                // But getCachedImageSrc implementation already handles fallback to original URL + background caching.
                // Wait, getCachedImageSrc returns the original URL if cache miss.
                
                // Let's verify:
                // If cache hit -> returns blob:url
                // If cache miss -> triggers cacheImage() and returns original url.
                setImgSrc(src);
            }
        }
      } catch (error) {
        console.error('Error loading cached image:', error);
        if (isMounted) setImgSrc(src);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [src, fallbackSrc]);

  return (
    <img
      src={imgSrc || fallbackSrc}
      className={`${className} ${isLoading ? 'opacity-50' : 'opacity-100'} transition-opacity duration-300`}
      {...props}
      onError={(e) => {
          if (fallbackSrc && imgSrc !== fallbackSrc) {
              setImgSrc(fallbackSrc);
          }
           if (props.onError) props.onError(e);
      }}
    />
  );
};
