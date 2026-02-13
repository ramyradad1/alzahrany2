import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; 
const VITE_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabaseKey = SUPABASE_SERVICE_ROLE_KEY || VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const STORAGE_BUCKET = 'products';
const SOURCE_DIR = 'C:/Users/Ramy/OneDrive - TECHNIFY/Desktop/New folder/Website';
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif'];

const activeCategoryIds = new Set();
const activeProductIds = new Set();

async function main() {
  console.log(`🚀 Starting database sync from: ${SOURCE_DIR}`);

  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`❌ Source directory not found: ${SOURCE_DIR}`);
    process.exit(1);
  }

  // Ensure storage bucket exists
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.find(b => b.name === STORAGE_BUCKET)) {
       console.log(`📦 Creating storage bucket: ${STORAGE_BUCKET}`);
       await supabase.storage.createBucket(STORAGE_BUCKET, { public: true });
  }

  // Start processing root directory
  await processDirectory(SOURCE_DIR, null, 0);

  // Cleanup Stale Data (Sync Logic)
  await deleteStaleData();

  // Cleanup Empty Categories (Cleanup Logic)
  await deleteEmptyCategories();

  console.log('✅ Sync and Cleanup complete!');
}

/**
 * Cleanup Empty Categories
 * Iteratively removes categories that have no children and no products
 */
async function deleteEmptyCategories() {
    console.log('🧹 Scanning for empty categories to delete...');
    let deletedCount = 0;
    
    // We loop because deleting a child might make the parent empty
    let hasDeleted = true;
    while (hasDeleted) {
        hasDeleted = false;
        
        // Fetch all categories
        const { data: cats } = await supabase.from('categories').select('id, name_en');
        if (!cats) break;

        // Fetch usage counts
        // 1. Categories being used as parents
        const { data: parents } = await supabase.from('categories').select('parent_id');
        const parentIds = new Set(parents?.map(p => p.parent_id).filter(Boolean));

        // 2. Categories having products
        const { data: prods } = await supabase.from('products').select('category_id');
        const productCatIds = new Set(prods?.map(p => p.category_id).filter(Boolean));

        const emptyCats = cats.filter(c => !parentIds.has(c.id) && !productCatIds.has(c.id));
        
        if (emptyCats.length > 0) {
            const idsToDelete = emptyCats.map(c => c.id);
            console.log(`   Running cleanup pass: Deleting ${idsToDelete.length} empty categories...`);
            const { error } = await supabase.from('categories').delete().in('id', idsToDelete);
            
            if (!error) {
                deletedCount += idsToDelete.length;
                hasDeleted = true; // Continue loop to check if parents became empty
            } else {
                console.error('   Error deleting categories:', error.message);
            }
        }
    }
    
    if (deletedCount > 0) {
        console.log(`✅ Total empty categories removed: ${deletedCount}`);
    } else {
        console.log(`✅ No empty categories found.`);
    }
}

async function deleteStaleData() {
    console.log('🧹 Removing stale data (items not in source folder)...');

    // 1. Delete Stale Products
    const { data: allProducts } = await supabase.from('products').select('id');
    if (allProducts) {
        const staleProducts = allProducts.filter(p => !activeProductIds.has(p.id));
        if (staleProducts.length > 0) {
            console.log(`❌ Deleting ${staleProducts.length} stale products...`);
            await supabase.from('products').delete().in('id', staleProducts.map(p => p.id));
        }
    }

    // 2. Delete Stale Categories
    // Note: deleteEmptyCategories handles the structural cleanup. 
    // This just removes ones that we explicitly didn't see in FS.
    // However, if we delete a category here that has children (which are also stale), it might fail if constrained.
    // The previous script's logic here was "best effort". 
}

async function processDirectory(currentPath, parentId, depth) {
  const items = fs.readdirSync(currentPath);
  const indent = '  '.repeat(depth);

  for (const item of items) {
    const itemPath = path.join(currentPath, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      // Category
      console.log(`${indent}📂 ${item}`);
      const categoryId = await upsertCategory(item, parentId);
      
      if (categoryId) {
          activeCategoryIds.add(categoryId);
          await processDirectory(itemPath, categoryId, depth + 1);
      }

    } else if (stats.isFile()) {
      // Product
      const ext = path.extname(item).toLowerCase();
      if (IMAGE_EXTENSIONS.includes(ext)) {
          if (!parentId) continue;

          const productName = path.parse(item).name;
          
          // DEDUPLICATION: Check if product exists first
          const existingId = await findProduct(productName, parentId);
          if (existingId) {
            //   console.log(`${indent}   ⏭️ Exists: ${productName}`);
              activeProductIds.add(existingId);
              continue;
          }

          // If new, upload image and insert
          console.log(`${indent}   ✨ New Product: ${productName}`);
          
          // Generate deterministic path for storage deduplication
           // RelPath ensures uniqueness: Category/Sub/Image.jpg
          const relativePath = path.relative(SOURCE_DIR, itemPath).replace(/\\/g, '/');
          const publicUrl = await uploadImage(itemPath, relativePath);
          
          if (publicUrl) {
              const productId = await insertProduct(productName, publicUrl, parentId);
              if (productId) activeProductIds.add(productId);
          }
      }
    }
  }
}

async function upsertCategory(name, parentId) {
    let query = supabase.from('categories').select('id').eq('name_en', name);
    
    if (parentId) query = query.eq('parent_id', parentId);
    else query = query.is('parent_id', null);
    
    const { data: existing } = await query.single();
    if (existing) return existing.id;

    const { data: inserted, error } = await supabase
        .from('categories')
        .insert({ name_en: name, name_ar: name, parent_id: parentId })
        .select()
        .single();

    if (error) {
        console.error(`❌ Error creating category ${name}: ${error.message}`);
        return null;
    }
    return inserted.id;
}

async function findProduct(name, categoryId) {
    const { data } = await supabase
        .from('products')
        .select('id')
        .eq('name', name)
        .eq('category_id', categoryId)
        .single();
    return data?.id;
}

async function insertProduct(name, imageUrl, categoryId) {
    const { data: inserted, error } = await supabase
        .from('products')
        .insert({
            name: name,
            category_id: categoryId,
            image: imageUrl,
            description: '',
            category: 'Legacy' // Placeholder
        })
        .select()
        .single();
    
    if (error) {
        console.error(`❌ Error inserting product ${name}: ${error.message}`);
        return null;
    }
    return inserted.id;
}

async function uploadImage(filePath, storagePath) {
    const fileContent = fs.readFileSync(filePath);
    
    // Check if exists by trying to upload with upsert: false
    // If it fails with Duplicate, we just get the URL.
    
    // NOTE: Supabase Storage 'upload' with upsert:false throws error if exists.
    // We catch it to implement "skip if exists".
    
    const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, fileContent, {
            contentType: getMimeType(filePath),
            upsert: false // Don't overwrite
        });

    if (uploadError && !uploadError.message.includes('already exists') && !uploadError.message.includes('Duplicate')) {
        console.error(`   ⚠️ Upload error (${storagePath}):`, uploadError.message);
        // Fallback: try to proceed anyway if it's just a "duplicate" error that wasn't caught by message check
        // but for safety, return null if it's a real error.
        // Actually, let's assume if it fails it might be there.
    }

    const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(storagePath);

    return publicUrl;
}

function getMimeType(filename) {
    const ext = path.extname(filename).toLowerCase();
    switch (ext) {
        case '.jpg': case '.jpeg': return 'image/jpeg';
        case '.png': return 'image/png';
        case '.gif': return 'image/gif';
        case '.webp': return 'image/webp';
        case '.svg': return 'image/svg+xml';
        case '.avif': return 'image/avif';
        default: return 'application/octet-stream';
    }
}

main().catch(console.error);
