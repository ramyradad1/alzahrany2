import { supabase } from '../../supabase';

/**
 * Uploads a base64 image string to Supabase Storage.
 * @param base64Data The base64 string (should start with data:image...)
 * @param bucket The storage bucket name (e.g., 'products')
 * @param path The folder path within the bucket (e.g., 'uploads/products')
 * @returns The public URL of the uploaded image, or null if failed/invalid.
 */
export const uploadImageToSupabase = async (base64Data: string, bucket: string, path: string): Promise<string | null> => {
  try {
    // Check if it's actually base64
    if (!base64Data || !base64Data.startsWith('data:image')) {
      return base64Data; // Already a URL or empty
    }

    // Use fetch to convert base64 to Blob - works in all modern browsers
    const res = await fetch(base64Data);
    const blob = await res.blob();
    
    // Extract extension from mime type
    const type = blob.type;
    const ext = type.split('/')[1] || 'png';
    const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    const fullPath = `${path}/${filename}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fullPath, blob, {
        contentType: type,
        upsert: false
      });

    if (error) {
        // If bucket doesn't exist, we might get an error.
        console.error(`Upload error to ${bucket}/${fullPath}:`, error);
        throw error;
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(fullPath);

    return data.publicUrl;
  } catch (error) {
    console.error('Upload failed:', error);
    return null;
  }
};
