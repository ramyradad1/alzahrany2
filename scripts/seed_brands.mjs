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

const RAW_DATA = `APTACA	Italy	Plastic
ASCO	Hindi	Plastic
Azlon	UK	Plastic
dragon	Chain	Plastic
Labbox Spain	Spain	
PlasLabs	USA	Plastic- Equpiments
Wilmad 	USA	Glassware
BIBBY	UK	Glassware
borosil	Hindi	Glassware
DURAN	Germany	Glassware
JainSci 	India	
simax	Techiky	Glassware
PYREX- CORNING	UK	Glassware
scilabware	UK	Glassware
ZEAL	UK	Glassware-Instruments
LMS	Germany	Glassware
adwa	Romina	 Instruments
Bel	Italy	Equipment's- Instruments
ASAL	Italy	Equipment's
Linetronic Technologies	Swirland	Equipment's- Instruments
Koehler	USA	Equipment's- Instruments
Da lab		
Thermo Fisher	Germany	
thomas Scientific	USA	
Daihan sientific		
lab box		
Greyhound		
ecosafesa		
huber		
kimia		
Microlit	Hindi	
MKE		
LGC	UK	
Infitek		
Thor LABS		
Bench mark		
Herais		
JP Selecta	spian	
PanReac applichem	spian	
avantor	USA	
ABB	Germany	
Memmert	Germany	
Alfa Aesar	USA	
Scharlau	spian	
Colikat	Germany	
LABtron	UK	
CDH	Hindi	
BioBASE	Chain	
Kartell	Italy	
Water ID	USA	
OHAUS	USA	
ACROS OrGANICS	Germany	
Optika	Italy	
Mariendeld	Germany	
eppendorf	USA	
Witeg	Germany	
Di lab	Austria	
RADWAG	Poland	
BRAND	Germany	
CECIL	UK	
Glass lab	Hindi	
tarsons products	Hindi	
Remi lab world	Hindi	
lablndia instruments pvt	Hindi	
systronics india	Hindi	
naugra Group	Hindi	
Electrolab india	Hindi	
lotus overseas	Hindi	
Toshniwal Instruments	Hindi	
Labindia Analytical	Hindi	
Equiptronics	Hindi`;

async function main() {
  console.log('🚀 Starting Brands Import...');

  // 1. Ensure "Brands" root category exists
  let brandsCategoryId = await upsertCategory('Brands', null);
  if (!brandsCategoryId) {
      console.error('❌ Failed to create/find "Brands" root category.');
      process.exit(1);
  }
  console.log(`✅ Root "Brands" category ID: ${brandsCategoryId}`);

  // 2. Parse Raw Data
  const brands = parseRawData(RAW_DATA);
  console.log(`📊 Found ${brands.length} brands to import.`);

  // 3. Import each brand
  let successCount = 0;
  for (const brand of brands) {
      const id = await upsertCategory(brand.name, brandsCategoryId);
      if (id) {
          successCount++;
          // console.log(`   ✅ Imported: ${brand.name}`);
      }
  }

  console.log(`🎉 Import complete! Successfully imported ${successCount} brands.`);
}

function parseRawData(rawData) {
    const lines = rawData.split('\n');
    const brands = [];
    
    for (const line of lines) {
        if (!line.trim() || line.startsWith('Brands\tCountry')) continue; // Skip header and empty lines
        
        // Split by tab (assuming copy-paste from Excel/Sheets)
        // If tabs are not consistent, we might need a regex or simply take the first part
        const parts = line.split('\t');
        
        let name = parts[0]?.trim();
        
        if (name) {
            brands.push({ name });
        }
    }
    return brands;
}

async function upsertCategory(name, parentId) {
    // Check key constraints or existing items
    const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('name_en', name) // Assuming Unique constraint might not be strictly on name, but we treat it as such for idempotency
        .eq('parent_id', parentId || null) // Check within same parent to avoid name collisions if multiple root 'Brands' somehow (though unlikely for root)
                                            // Actually simpler: just check name + parent match
    
    // Correction: parent_id can be null. .eq('parent_id', null) doesn't work in URL params usually but works in JS client with .is('parent_id', null)
    let query = supabase.from('categories').select('id').eq('name_en', name);
    
    if (parentId) {
        query = query.eq('parent_id', parentId);
    } else {
        query = query.is('parent_id', null);
    }

    const { data, error } = await query.maybeSingle(); // Use maybeSingle to avoid error on 0 rows
    
    if (data) return data.id;

    // Insert
    const { data: inserted, error: insertError } = await supabase
        .from('categories')
        .insert({ 
            name_en: name, 
            name_ar: name, // Populate Arabic name same as English for now
            parent_id: parentId 
        })
        .select()
        .single();

    if (insertError) {
        console.error(`   ❌ Error creating category "${name}": ${insertError.message}`);
        return null;
    }
    
    return inserted.id;
}

main().catch(console.error);
