import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

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

const RAW_DATA = `APTACA
ASCO
Azlon
dragon
Labbox Spain
PlasLabs
Wilmad 
BIBBY
borosil
DURAN
JainSci 
simax
PYREX- CORNING
scilabware
ZEAL
LMS
adwa
Bel
ASAL
Linetronic Technologies
Koehler
Da lab
Thermo Fisher
thomas Scientific
Daihan sientific
lab box
Greyhound
ecosafesa
huber
kimia
Microlit
MKE
LGC
Infitek
Thor LABS
Bench mark
Herais
JP Selecta
PanReac applichem
avantor
ABB
Memmert
Alfa Aesar
Scharlau
Colikat
LABtron
CDH
BioBASE
Kartell
Water ID
OHAUS
ACROS OrGANICS
Optika
Mariendeld
eppendorf
Witeg
Di lab
RADWAG
BRAND
CECIL
Glass lab
tarsons products
Remi lab world
lablndia instruments pvt
systronics india
naugra Group
Electrolab india
lotus overseas
Toshniwal Instruments
Labindia Analytical
Equiptronics`;

async function main() {
  console.log('🚀 Starting Partners Import...');

  // 1. Parse Raw Data
  const partners = parseRawData(RAW_DATA);
  console.log(`📊 Found ${partners.length} partners to import.`);

  // 2. Import each partner
  let successCount = 0;
  for (const partner of partners) {
      const id = await upsertPartner(partner.name);
      if (id) {
          successCount++;
          // console.log(`   ✅ Imported: ${partner.name}`);
      }
  }

  console.log(`🎉 Import complete! Successfully imported ${successCount} partners.`);
}

function parseRawData(rawData) {
    const lines = rawData.split('\n');
    const partners = [];
    
    for (const line of lines) {
        if (!line.trim() || line.startsWith('Brands')) continue; // Skip header and empty lines
        
        let name = line.trim();
        
        if (name) {
            partners.push({ name });
        }
    }
    return partners;
}

async function upsertPartner(name) {
    // Check existing
    const { data: existing } = await supabase
        .from('partners')
        .select('id')
        .eq('name', name)
        .maybeSingle();
    
    if (existing) return existing.id;

    // Insert
    const { data: inserted, error: insertError } = await supabase
        .from('partners')
        .insert({ 
            name: name,
            logo: '' // Placeholder logo
        })
        .select()
        .single();

    if (insertError) {
        console.error(`   ❌ Error creating partner "${name}": ${insertError.message}`);
        return null;
    }
    
    return inserted.id;
}

main().catch(console.error);
