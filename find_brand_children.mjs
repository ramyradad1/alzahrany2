
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function findBrandChildren() {
  // Search for common brand names seen in the screenshot
  const names = ['ABB', 'ACROS', 'adwa', 'Alfa Aesar', 'APTACA', 'ASAL'];
  
  const { data, error } = await supabase
    .from('categories')
    .select('id, name_en, parent_id')
    .in('name_en', names);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('--- Brand Children Search ---');
  if (data && data.length > 0) {
      data.forEach(c => {
          console.log(`Found Child: ${c.name_en} (ID: ${c.id}) -> Parent ID: ${c.parent_id}`);
      });

      // If we found children, let's check their parent
      const parentId = data[0].parent_id;
      if (parentId) {
          const { data: parent } = await supabase.from('categories').select('*').eq('id', parentId).single();
          if (parent) {
              console.log(`\nParent Category Found: ${parent.name_en} (ID: ${parent.id})`);
          } else {
              console.log(`\nParent ID ${parentId} NOT FOUND in categories table!`);
          }
      }
  } else {
      console.log('No brand children found. The "Brands" folder likely completely failed to seed.');
  }
}

findBrandChildren();
