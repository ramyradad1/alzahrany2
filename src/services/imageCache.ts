
import { db, CachedImage } from '../db';

/**
 * Fetches an image from the network and stores it in Dexie.
 * @param url The URL of the image to cache.
 * @returns The cached Blob or null if failed.
 */
export const cacheImage = async (url: string): Promise<Blob | null> => {
  if (!url) return null;

  try {
    // Check if already cached
    const existing = await db.images.get(url);
    if (existing) {
      return existing.data;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${url}`);

    const blob = await response.blob();
    const mimeType = blob.type;

    const cachedImage: CachedImage = {
      id: url,
      data: blob,
      mimeType,
      timestamp: Date.now(),
    };

    await db.images.put(cachedImage);
    console.log(`Cached image: ${url}`);
    return blob;
  } catch (error) {
    console.error(`Error caching image ${url}:`, error);
    return null;
  }
};

/**
 * Retrieves a cached image as a Blob URL.
 * Falls back to the original URL if not found in cache.
 * @param url The URL of the image.
 * @returns A promise that resolves to a Blob URL or the original URL.
 */
export const getCachedImageSrc = async (url: string): Promise<string> => {
  if (!url) return '';

  try {
    const cached = await db.images.get(url);
    if (cached) {
      return URL.createObjectURL(cached.data);
    }
  } catch (error) {
    console.error(`Error retrieving cached image ${url}:`, error);
  }

  // Trigger background caching if not found (lazy caching)
  cacheImage(url).catch(e => console.error('Background cache failed manually triggered', e));
  
  return url;
};

/**
 * Batch processes a list of image URLs to ensure they are cached.
 * Good for calling after a data sync.
 * @param urls Array of image URLs to sync.
 */
export const syncImages = async (urls: (string | undefined | null)[]) => {
  const uniqueUrls = [...new Set(urls.filter(u => !!u))] as string[];
  console.log(`Checking ${uniqueUrls.length} images for caching...`);
  
  let newCachedCount = 0;

  // Process in chunks to avoid overwhelming the network
  const CHUNK_SIZE = 5;
  for (let i = 0; i < uniqueUrls.length; i += CHUNK_SIZE) {
    const chunk = uniqueUrls.slice(i, i + CHUNK_SIZE);
    
    await Promise.all(chunk.map(async (url) => {
      const exists = await db.images.get(url);
      if (!exists) {
        await cacheImage(url);
        newCachedCount++;
      }
    }));
  }

  if (newCachedCount > 0) {
    console.log(`Synced ${newCachedCount} new images to local cache.`);
  }
};
