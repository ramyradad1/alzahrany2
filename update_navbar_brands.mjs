
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey; // Fallback if service key not set, though RLS might block

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function syncBrands() {
  console.log('Starting Brands Sync...');

  // 1. Find "Brands" Category
  // We look for a top-level category named "Brands" (case-insensitive)
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, name_en, name_ar');
  
  if (catError) {
    console.error('Error fetching categories:', catError);
    return;
  }

  const brandsCat = categories.find(c => c.name_en.toLowerCase() === 'brands');
  if (!brandsCat) {
    console.error('Category "Brands" not found in DB.');
    return;
  }

  console.log(`Found Brands Category: ${brandsCat.name_en} (ID: ${brandsCat.id})`);

  // 2. Find Children
  const { data: children, error: childError } = await supabase
    .from('categories')
    .select('*')
    .eq('parent_id', brandsCat.id);

  if (childError) {
    console.error('Error fetching children:', childError);
    return;
  }

  console.log(`Found ${children.length} sub-brands.`);

  // 3. Construct MenuItems
  const brandMenuItems = children.map(child => ({
    id: `brand-${child.id}`,
    label: child.name_en,
    labelAr: child.name_ar || child.name_en,
    href: `/catalog?category=${encodeURIComponent(child.name_en)}`,
    icon: child.image, // Use category image as icon if available
    order: 0,
    children: [] // Brands usually don't have further nesting in the menu for now
  }));

  // 4. Fetch Navbar Config
  const { data: config, error: configError } = await supabase
    .from('navbar_config')
    .select('*')
    .eq('id', 'main')
    .single();

  if (configError) {
    console.error('Error fetching navbar config:', configError);
    return;
  }

  // 5. Update "Brands" Menu Item
  let menuItems = config.menu_items || [];
  const brandIndex = menuItems.findIndex(i => 
    i.label.toLowerCase() === 'brands' || 
    (i.labelAr && i.labelAr.includes('Brands')) || 
    (i.href && i.href.toLowerCase().includes('brands'))
  );

  if (brandIndex !== -1) {
    console.log(`Updating existing "Brands" menu item (Index: ${brandIndex})`);
    menuItems[brandIndex].children = brandMenuItems;
  } else {
    console.log(' "Brands" menu item not found. Creating it.');
    menuItems.push({
      id: 'brands-auto',
      label: 'Brands',
      labelAr: 'الماركات',
      href: '/#brands',
      order: menuItems.length,
      children: brandMenuItems
    });
  }

  // 6. Save back
  const { error: updateError } = await supabase
    .from('navbar_config')
    .update({ menu_items: menuItems, updated_at: new Date().toISOString() })
    .eq('id', 'main');

  if (updateError) {
    console.error('Error updating navbar config:', updateError);
  } else {
    console.log('Successfully synced Brands to Navbar Config!');
  }
}

syncBrands();
