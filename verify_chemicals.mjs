import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  // 1. Find 'Chemicals' (case-insensitive)
  const { data: cat, error } = await supabase
    .from('categories')
    .select('id, name_en')
    .ilike('name_en', 'chemical%')
    .limit(1)
    .single();

  if (error || !cat) {
    console.log('❌ Category "Chemicals" NOT found.');
    return;
  }

  console.log(`✅ Found Category: ${cat.name_en} (ID: ${cat.id})`);

  // 2. Count products in this category
  const { count, error: countError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', cat.id);

  if (countError) {
    console.error('Error counting products:', countError);
  } else {
    console.log(`✅ Number of products in "Chemicals": ${count}`);
  }
}

check();
