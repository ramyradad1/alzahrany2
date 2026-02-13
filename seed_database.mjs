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

// Track active IDs to clean up stale data later
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
    // null parentId means root categories
  await processDirectory(SOURCE_DIR, null, 0);

    // Cleanup Stale Data
  await deleteStaleData();

    // Cleanup Empty Categories
  await deleteEmptyCategories();

  console.log('✅ Sync and Cleanup complete!');
}

/**
 * Recursively process directories and files
 * @param {string} currentPath - Absolute path on disk
 * @param {number|null} parentId - Database ID of the parent category
 * @param {number} depth - Recursion depth for logging indentation
 */
async function processDirectory(currentPath, parentId, depth) {
  const items = fs.readdirSync(currentPath);
  const indent = '  '.repeat(depth);

  for (const item of items) {
    const itemPath = path.join(currentPath, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
        // It's a Category (or Subcategory)
        console.log(`${indent}📂 Processing Category: ${item}`);

      const categoryId = await upsertCategory(item, parentId);
      
      if (categoryId) {
          activeCategoryIds.add(categoryId);
          // Recursively process children
          await processDirectory(itemPath, categoryId, depth + 1);
      }

    } else if (stats.isFile()) {
        // It's a potential Product
      const ext = path.extname(item).toLowerCase();
      if (IMAGE_EXTENSIONS.includes(ext)) {
          // If we are at root (depth 0), files might not belong to a category?
          // Usually products are inside a category folder.
          // If parentId is null, it means the image is at the root of 'Website' folder.
          // Depending on logic, we might skip or assign to a default.
          // For now, let's assume valid products must have a category (parentId).
          if (!parentId) {
              console.warn(`${indent}⚠️ Skipping file at root (no category): ${item}`);
              continue;
          }

          const productName = path.parse(item).name;
          
          console.log(`${indent}   🖼️ Found Product Image: ${item}`);

          // 1. DEDUPLICATION: Check if product already exists in DB
          // We check by name AND category_id to allow same name in different categories
          let productId = await findProduct(productName, parentId);

          if (productId) {
              console.log(`${indent}      Example: Product entry exists in DB. Linking ID...`);
          } else {
              console.log(`${indent}      ✨ Creating new Product entry...`);
          }

          // 2. Prepare for Storage Upload / Dedup
          // RelPath: Category/Subcategory/Image.jpg
          const relativePath = path.relative(SOURCE_DIR, itemPath).replace(/\\/g, '/');

          // Check if image exists in storage BEFORE uploading
          const publicUrl = await ensureImageInStorage(itemPath, relativePath, indent);
          
          if (publicUrl) {
              // Upsert/Insert product
              if (!productId) {
                  productId = await insertProduct(productName, publicUrl, parentId);
              } else {
                  // Optional: Update image URL if it changed? 
                  // For now, assuming name matches, we keep it. 
                  // But if we want to ensure URL is correct:
                  // await updateProductImage(productId, publicUrl);
              }

              if (productId) activeProductIds.add(productId);
          }
      }
    }
  }
}

async function upsertCategory(name, parentId) {
    // Check existing by name AND parent_id to distinguish subcategories with same name
    let query = supabase.from('categories').select('id').eq('name_en', name);
    
    if (parentId) query = query.eq('parent_id', parentId);
    else query = query.is('parent_id', null);
    
    const { data: existing } = await query.single();
    if (existing) return existing.id;

    const { data: inserted, error } = await supabase
        .from('categories')
        .insert({
            name_en: name,
            name_ar: name,
            parent_id: parentId
        })
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
            category: 'Legacy' // Placeholder to satisfy constraints if any
        })
        .select()
        .single();
    
    if (error) {
        console.error(`❌ Error inserting product ${name}: ${error.message}`);
        return null;
    }
    return inserted.id;
}

/**
 * Checks if image exists in storage. If not, uploads it.
 * Returns public URL.
 */
async function ensureImageInStorage(localPath, storagePath, indent) {
    // Check existence by listing the folder in bucket
    const folder = path.dirname(storagePath).replace(/\\/g, '/');
    const filename = path.basename(storagePath);

    // List files in the folder (bucket, path, options)
    // Note: 'path' in list() acts as a prefix folder
    const { data: files, error: listError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .list(folder === '.' ? '' : folder, {
            limit: 1000,
            search: filename
        });

    let exists = false;
    if (files && files.length > 0) {
        // Exact match check
        exists = files.some(f => f.name === filename);
    }

    if (exists) {
        console.log(`${indent}      ⏭️ Image exists in Storage. Skipping upload.`);
    } else {
        console.log(`${indent}      ⬆️ Uploading new image...`);
        const fileContent = fs.readFileSync(localPath);
        const { error: uploadError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(storagePath, fileContent, {
                contentType: getMimeType(localPath),
                upsert: false
            });

        if (uploadError) {
            console.error(`${indent}      ❌ Upload failed: ${uploadError.message}`);
            return null;
        }
    }

    const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(storagePath);

    return publicUrl;
}

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
            // console.log(`   Running cleanup pass: Deleting ${idsToDelete.length} empty categories...`);
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

    // 1. Delete Stale Products (items in DB but not seen in this run)
    // Note: This logic assumes we crawled EVERYTHING. If we only crawled a subfolder, 
    // be careful. user said "comprehensive, system-wide update" so safe to assume full crawl.

    const { data: allProducts } = await supabase.from('products').select('id');
    if (allProducts) {
        const staleProducts = allProducts.filter(p => !activeProductIds.has(p.id));
        if (staleProducts.length > 0) {
            console.log(`❌ Deleting ${staleProducts.length} stale products...`);
            await supabase.from('products').delete().in('id', staleProducts.map(p => p.id));
        } else {
            console.log(`   No stale products found.`);
        }
    }

    // 2. Stale Categories are handled by deleteEmptyCategories mostly, 
    // but we could strictly check activeCategoryIds if we wanted to be more aggressive.
    // For now, the structural cleanup is safer.
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
