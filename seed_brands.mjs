
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; 
const VITE_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabaseKey = SUPABASE_SERVICE_ROLE_KEY || VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !supabaseKey) {
    console.error('❌ Missing Supabase credentials.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const STORAGE_BUCKET = 'products';
// We target the Brands folder specifically
const SOURCE_DIR = 'C:/Users/Ramy/OneDrive - TECHNIFY/Desktop/New folder/Website/Website/Brands';
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif'];

async function main() {
    console.log(`🚀 Starting Brands Sync from: ${SOURCE_DIR}`);

    if (!fs.existsSync(SOURCE_DIR)) {
        console.error(`❌ Source directory not found: ${SOURCE_DIR}`);
        process.exit(1);
    }

    // 1. Get Parent ID ("Website" category)
    // We want Brands to be under "Website" to match other categories like Equipments
    let parentId = null;
    const { data: websiteCat } = await supabase.from('categories').select('id').eq('name_en', 'Website').single();

    if (websiteCat) {
        console.log(`📂 Found Root 'Website' Category ID: ${websiteCat.id}`);
        parentId = websiteCat.id;
    } else {
        console.warn("⚠️ 'Website' category not found. Brands will be created at Root level.");
    }

    // 2. Create "Brands" Category itself
    const brandsId = await upsertCategory('Brands', parentId);
    console.log(`✅ Brands Category ID: ${brandsId}`);

    // 3. Process Children of Brands
    if (brandsId) {
        await processDirectory(SOURCE_DIR, brandsId, 1);
    }

    console.log('✅ Brands Sync complete!');
    process.exit(0);
}

async function processDirectory(currentPath, parentId, depth) {
    const items = fs.readdirSync(currentPath);
    const indent = '  '.repeat(depth);

    for (const item of items) {
        const itemPath = path.join(currentPath, item);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
            console.log(`${indent}📂 Processing Brand: ${item}`);
            // Force recursion for sub-brands or just create the category
            const categoryId = await upsertCategory(item, parentId);

            if (categoryId) {
                // Process inside (in case there are images or sub-sub-brands)
                // Passing depth + 1 for logging
                // We do NOT stop here, we recurse to find images (products)
                await processDirectory(itemPath, categoryId, depth + 1);
            }

        } else if (stats.isFile()) {
            const ext = path.extname(item).toLowerCase();
            if (IMAGE_EXTENSIONS.includes(ext)) {
                // It's a product image inside a Brand folder
                const productName = path.parse(item).name;
                console.log(`${indent}   🖼️ Found Product: ${item}`);

                // Upload Image
                const relativePath = path.relative(path.join(__dirname, 'Website'), itemPath).replace(/\\/g, '/');
                const publicUrl = await ensureImageInStorage(itemPath, relativePath, indent);

                if (publicUrl) {
                    await insertProduct(productName, publicUrl, parentId);
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

async function insertProduct(name, imageUrl, categoryId) {
    // Check if exists
    const { data: existing } = await supabase
        .from('products')
        .select('id')
        .eq('name', name)
        .eq('category_id', categoryId)
        .single();

    if (existing) return existing.id;

    const { data: inserted, error } = await supabase
        .from('products')
        .insert({
            name: name,
            category_id: categoryId,
            image: imageUrl,
            category: 'Brands' // Legacy field
        })
        .select()
        .single();

    if (error) {
        console.error(`❌ Error inserting product ${name}: ${error.message}`);
        return null;
    }
    return inserted.id;
}

async function ensureImageInStorage(localPath, storagePath, indent) {
    const folder = path.dirname(storagePath).replace(/\\/g, '/');
    const filename = path.basename(storagePath);

    // Simple check: Assuming if it exists, it's fine. 
    // Optimization: skip listing, just try upload with upsert=false?
    // But list is safer to avoid errors.

    // For speed in this specific fix script, let's just upload with upsert=false and ignore "Duplicate" error?
    // Or just do the check.

    const fileContent = fs.readFileSync(localPath);
    // Determine mime
    const ext = path.extname(localPath).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.avif') contentType = 'image/avif';

    // We use the storage path relative to "Website" root usually?
    // In seed_database.mjs: path.relative(SOURCE_DIR, itemPath) where SOURCE_DIR was .../Website
    // Here SOURCE_DIR is .../Website/Brands.
    // So relative path will be "ABB/image.jpg".
    // But in main bucket it should probably be "Brands/ABB/image.jpg" to match structure?
    // Yes. So let's fix relative path calculation in the main loop.
    // Fixed above by using path.join(__dirname, 'Website') as base.

    const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, fileContent, {
            contentType,
            upsert: true // Force overwrite to be sure
        });

    if (uploadError) {
        // console.error(`${indent}      Upload error (ignoring if dup): ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(storagePath);

    return publicUrl;
}

main().catch(console.error);
