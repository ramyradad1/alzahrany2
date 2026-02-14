
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyData() {
  console.log('--- Verifying Supabase Data ---');

  // 1. Check Brands Category
  const { data: brands, error: brandError } = await supabase
    .from('categories')
    .select('id, name_en, parent_id')
    .eq('name_en', 'Brands')
    .single();

  if (brandError || !brands) {
    console.error('❌ "Brands" category NOT found in DB!');
  } else {
    console.log(`✅ Found "Brands" category: ID ${brands.id}`);
    
    // Check Children
    const { count, error: childError } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', brands.id);
    
    if (childError) console.error('Error counting children:', childError);
    else console.log(`✅ Found ${count} sub-brands under "Brands".`);
  }

  // 2. Check Products count
  const { count: prodCount, error: prodError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });
    
  if (prodError) console.error('Error counting products:', prodError);
  else console.log(`✅ Total Products in DB: ${prodCount}`);

  // 3. Check Navbar Config
  const { data: navConfig, error: navError } = await supabase
    .from('navbar_config')
    .select('*')
    .eq('id', 'main')
    .single();

  if (navError) {
      console.error('❌ Navbar Config NOT found or error:', navError);
  } else {
      const brandsItem = navConfig.menu_items?.find(i => i.label === 'Brands');
      if (brandsItem) {
          console.log(`✅ Navbar Config has "Brands" item with ${brandsItem.children?.length || 0} children.`);
      } else {
          console.error('❌ "Brands" item missing from Navbar Config!');
      }
  }
}

verifyData();
