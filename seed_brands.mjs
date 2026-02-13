import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
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

const BRANDS_LIST = [
    "APTACA", "ASCO", "Azlon", "dragon", "Labbox Spain", "PlasLabs", 
    "Wilmad", "BIBBY", "borosil", "DURAN", "JainSci ", "simax", 
    "PYREX- CORNING", "scilabware", "ZEAL", "LMS", "adwa", "Bel", 
    "ASAL", "Linetronic Technologies", "Koehler", "Da lab", 
    "Thermo Fisher", "thomas Scientific", "Daihan sientific", "lab box", 
    "Greyhound", "ecosafesa", "huber", "kimia", "Microlit", "MKE", 
    "LGC", "Infitek", "Thor LABS", "Bench mark", "Herais", "JP Selecta", 
    "PanReac applichem", "avantor", "ABB", "Memmert", "Alfa Aesar", 
    "Scharlau", "Colikat", "LABtron", "CDH", "BioBASE", "Kartell", 
    "Water ID", "OHAUS", "ACROS OrGANICS", "Optika", "Mariendeld", 
    "eppendorf", "Witeg", "Di lab", "RADWAG", "BRAND", "CECIL", 
    "Glass lab", "tarsons products", "Remi lab world", 
    "lablndia instruments pvt", "systronics india", "naugra Group", 
    "Electrolab india", "lotus overseas", "Toshniwal Instruments", 
    "Labindia Analytical", "Equiptronics"
];

async function main() {
    console.log('🚀 Starting Brands Seed...');
    
    // Debug Auth
    if (SUPABASE_SERVICE_ROLE_KEY) console.log('✅ Using Service Role Key');
    else if (VITE_SUPABASE_ANON_KEY) console.log('⚠️ Using Anon Key (might hit RLS issues)');
    else console.log('❌ No keys found!');

    // 1. Create or Get "Brands" Parent Category
    console.log('📂 Step 1: Querying for "Brands" category...');
    const brandsId = await upsertCategory('Brands', null);
    
    if (!brandsId) {
        console.error('❌ Failed to create/find "Brands" category. Aborting.');
        process.exit(1);
    }
    console.log(`✅ "Brands" Category ID: ${brandsId}`);

    // 2. Create Sub-Categories for each Brand
    console.log(`🚀 Step 2: Processing ${BRANDS_LIST.length} brands...`);
    
    let successCount = 0;
    for (const [index, brandName] of BRANDS_LIST.entries()) {
        const trimmedName = brandName.trim();
        if (!trimmedName) continue;

        if (index % 5 === 0) console.log(`   ⏳ Processing batch starting at ${brandName}...`);

        const id = await upsertCategory(trimmedName, brandsId);
        if (id) {
            successCount++;
        }
    }

    console.log(`✨ Completed! Successfully processed ${successCount} brands.`);
    process.exit(0); // Force exit
}

async function upsertCategory(name, parentId) {
    // console.log(`   🔎 Checking: ${name}`);
    // Check if exists
    let query = supabase.from('categories').select('id').eq('name_en', name);
    
    if (parentId) query = query.eq('parent_id', parentId);
    else query = query.is('parent_id', null);
    
    const { data: existing, error: fetchError } = await query.single();
    
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "No rows returned"
        console.error(`   ⚠️ Error checking category ${name}: ${fetchError.message}`);
    }

    if (existing) return existing.id;

    console.log(`   ➕ Inserting new category: ${name}`);
    // Insert if not exists
    const { data: inserted, error } = await supabase
        .from('categories')
        .insert({ name_en: name, name_ar: name, parent_id: parentId })
        .select()
        .single();

    if (error) {
        console.error(`   ❌ Error creating category ${name}: ${error.message}`);
        return null;
    }
    return inserted.id;
}

main().catch(console.error);
