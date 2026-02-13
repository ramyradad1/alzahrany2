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
    "Wilmad", "BIBBY", "borosil", "DURAN", "JainSci", "simax", 
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
    console.log('🚀 Starting Brands Migration to Partners Table...');
    
    // Debug Auth
    if (SUPABASE_SERVICE_ROLE_KEY) console.log('✅ Using Service Role Key');
    else if (VITE_SUPABASE_ANON_KEY) console.log('⚠️ Using Anon Key (might hit RLS issues)');
    else console.log('❌ No keys found!');

    let successCount = 0;
    
    for (const brandName of BRANDS_LIST) {
        const trimmedName = brandName.trim();
        if (!trimmedName) continue;

        // Check if exists in partners
        const { data: existing, error: fetchError } = await supabase
            .from('partners')
            .select('id')
            .eq('name', trimmedName)
            .single();
        
        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error(`   ⚠️ Error checking partner ${trimmedName}: ${fetchError.message}`);
            continue;
        }

        if (existing) {
            console.log(`   ⏭️ Skipping existing: ${trimmedName}`);
            continue;
        }

        console.log(`   ➕ Inserting new partner: ${trimmedName}`);
        
        // Generate placeholder logo
        const logoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(trimmedName)}&background=random&color=fff&size=200`;

        const { error } = await supabase
            .from('partners')
            .insert({ 
                name: trimmedName, 
                logo: logoUrl 
            });

        if (error) {
            console.error(`   ❌ Error creating partner ${trimmedName}: ${error.message}`);
        } else {
            successCount++;
        }
    }

    console.log(`✨ Migration Completed! Added ${successCount} new partners.`);
    process.exit(0);
}

main().catch(console.error);
