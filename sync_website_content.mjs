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
const SOURCE_DIR = 'C:/Users/Ramy/OneDrive - TECHNIFY/Desktop/New folder/Website/Website'; // Target the inner 'Website' folder
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
  // Note: We only delete stale products for now to be safe. 
  // Stale categories are harder because they might contain other things not in this sync.
  // await deleteStaleData();

  // Cleanup Empty Categories
  // await deleteEmptyCategories();

  console.log('✅ Sync and Cleanup complete!');
}

/**
 * Recursively process directories and files
 */
async function processDirectory(currentPath, parentId, depth) {
  const items = fs.readdirSync(currentPath);
  const indent = '  '.repeat(depth);

  for (const item of items) {
    const itemPath = path.join(currentPath, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
        // It's a Category (or Subcategory)
        // Special processing for 'chemical' or 'chemicals' if needed, but generic recursion handles it naturally.
        // We will just capitalization normalize if needed, but usually we keep folder name.
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
          console.log(`${indent}   🖼️ Found Product Image: ${item}`);
          const productName = path.parse(item).name;

          // 1. Check if product already exists in DB
          let productId = await findProduct(productName, parentId);

          // 2. Upload Image (Deduplicated by filename in storage)
          const relativePath = path.relative(SOURCE_DIR, itemPath).replace(/\\/g, '/');
          const publicUrl = await ensureImageInStorage(itemPath, relativePath, indent);
          
          if (publicUrl) {
              // Upsert/Insert product
              if (!productId) {
                  productId = await insertProduct(productName, publicUrl, parentId);
                  console.log(`${indent}      ✨ Created new Product: ${productName}`);
              } else {
                  // Update existing product to ensure image URL is correct (and maybe other fields)
                  await updateProduct(productId, publicUrl);
                  console.log(`${indent}      🔄 Updated Product: ${productName}`);
              }

              if (productId) activeProductIds.add(productId);
          }
      }
    }
  }
}

async function upsertCategory(name, parentId) {
    // Check existing by name AND parent_id to distinguish subcategories with same name
    // Matches case-insensitive to handle "Chemicals" vs "chemicals"
    let query = supabase.from('categories')
        .select('id')
        .ilike('name_en', name); // Case insensitive check
    
    if (parentId) query = query.eq('parent_id', parentId);
    else query = query.is('parent_id', null);
    
    const { data: existing } = await query.maybeSingle(); // Use maybeSingle to avoid error on 0 rows
    
    if (existing) {
        // Update name to match current folder casing (e.g. if DB has "chemicals" and folder is "Chemicals")
        // preventing duplicate case variations.
        await supabase.from('categories').update({ name_en: name, name_ar: name }).eq('id', existing.id);
        return existing.id;
    }

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
        .maybeSingle();
    return data?.id;
}

// Sanitize storage path to avoid "Invalid key" errors with special chars
function sanitizeStoragePath(originalPath) {
    const dir = path.dirname(originalPath);
    const ext = path.extname(originalPath);
    const name = path.basename(originalPath, ext);
    
    // Replace non-ASCII or special chars with safe ones
    // Keep alphanumeric, spaces, hyphens, underscores, dots
    const safeName = name.replace(/[^a-zA-Z0-9\s\-_.]/g, '_').replace(/\s+/g, '_');
    
    return path.join(dir, safeName + ext).replace(/\\/g, '/');
}

async function insertProduct(name, imageUrl, categoryId) {
    // Check if 'price' or 'stock' are actually required. 
    // Based on previous errors, 'stock' column doesn't exist.
    const productPayload = {
        name: name,
        category_id: categoryId,
        image: imageUrl,
        description: '',
        category: 'Custom', // Changed from Legacy
        price: 0
    };

    const { data: inserted, error } = await supabase
        .from('products')
        .insert(productPayload)
        .select()
        .single();
    
    if (error) {
        console.error(`❌ Error inserting product ${name}: ${error.message}`);
        return null;
    }
    return inserted.id;
}

async function updateProduct(productId, imageUrl) {
    const { error } = await supabase
        .from('products')
        .update({ image: imageUrl })
        .eq('id', productId);
    
    if (error) console.error(`❌ Error updating product ${productId}: ${error.message}`);
}

/**
 * Checks if image exists in storage. If not, uploads it.
 * Returns public URL.
 */
async function ensureImageInStorage(localPath, storagePath, indent) {
    // Sanitize the target storage path
    const targetPath = sanitizeStoragePath(storagePath);
    
    const folder = path.dirname(targetPath).replace(/\\/g, '/');
    const filename = path.basename(targetPath);

    const { data: files } = await supabase.storage
        .from(STORAGE_BUCKET)
        .list(folder === '.' ? '' : folder, {
            limit: 100,
            search: filename
        });

    const exists = files?.some(f => f.name === filename);

    if (exists) {
        // console.log(`${indent}      ⏭️ Image exists in Storage.`);
    } else {
        console.log(`${indent}      ⬆️ Uploading new image... (${filename})`);
        
        try {
            const fileContent = fs.readFileSync(localPath);
            const { error: uploadError } = await supabase.storage
                .from(STORAGE_BUCKET)
                .upload(targetPath, fileContent, {
                    contentType: getMimeType(localPath),
                    upsert: true 
                });

            if (uploadError) {
                console.error(`${indent}      ❌ Upload failed: ${uploadError.message}`);
                return null;
            }
        } catch (err) {
            console.error(`${indent}      ❌ File read error: ${err.message}`);
            return null;
        }
    }

    const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(targetPath);

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
        const { data: cats } = await supabase.from('categories').select('id');
        if (!cats) break;
        
        // Fetch usage
        const { data: parents } = await supabase.from('categories').select('parent_id');
        const parentIds = new Set(parents?.map(p => p.parent_id).filter(Boolean));
        
        const { data: prods } = await supabase.from('products').select('category_id');
        const productCatIds = new Set(prods?.map(p => p.category_id).filter(Boolean));
        
        const emptyCats = cats.filter(c => !parentIds.has(c.id) && !productCatIds.has(c.id));
        
        if (emptyCats.length > 0) {
            const idsToDelete = emptyCats.map(c => c.id);
            const { error } = await supabase.from('categories').delete().in('id', idsToDelete);
            
            if (!error) {
                deletedCount += idsToDelete.length;
                hasDeleted = true; 
            }
        }
    }
    console.log(`✅ Total empty categories removed: ${deletedCount}`);
}

async function deleteStaleData() {
    console.log('🧹 Removing stale products (not in source folder)...');
    
    // Get ALL products from DB
    const { data: allProducts } = await supabase.from('products').select('id, category_id, name');
    
    if (allProducts) {
        // We only want to delete products that belong to categories we processed?
        // Or globally? "Remove duplicate images/products". 
        // If we processed everything, we can safely delete anything not in activeProductIds.
        // But wait, what if there are products added manually in Admin?
        // The user said "update ALL from folder". It implies folder is source of truth.
        // However, manual products might exist. 
        // Let's filter by only products that fall under the categories we touched (activeCategoryIds).
        // If a product is in a category we synced, but wasn't in the folder, delete it.
        
        const staleProducts = allProducts.filter(p => 
            activeCategoryIds.has(p.category_id) && !activeProductIds.has(p.id)
        );

        if (staleProducts.length > 0) {
            console.log(`❌ Deleting ${staleProducts.length} stale products...`);
            await supabase.from('products').delete().in('id', staleProducts.map(p => p.id));
        } else {
            console.log(`   No stale products found in synced categories.`);
        }
    }
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
