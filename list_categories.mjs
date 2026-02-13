
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

async function listCategories() {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name_en, name_ar, parent_id');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('--- All Categories ---');
  categories.forEach(c => {
      console.log(`ID: ${c.id}, Name: ${c.name_en} / ${c.name_ar}, Parent: ${c.parent_id}`);
  });
}

listCategories();
