
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyRLS() {
  console.log('--- Verifying RLS Policies ---');

  // Test 1: Public Read (Should Succeed)
  console.log('\nTest 1: Public Read (Anon)');
  const { data: readData, error: readError } = await supabase
    .from('products')
    .select('*')
    .limit(1);

  if (readError) {
    console.error('❌ Public Read Failed:', readError.message);
  } else {
    console.log('✅ Public Read Succeeded. Rows fetched:', readData.length);
  }

  // Test 2: Public Write (Should Fail if RLS enabled and policy is auth-only)
  // Note: This test assumes you have run the RLS SQL script in Supabase!
  console.log('\nTest 2: Public Write (Anon)');
  const { error: writeError } = await supabase
    .from('products')
    .insert([{ name: 'RLS Test Product', description: 'Should fail', category: 'Test', image: 'test.jpg' }]);

  if (writeError) {
    console.log('✅ Public Write Failed as expected:', writeError.message);
    // Expecting: new row violates row-level security policy for table "products"
  } else {
    console.warn('⚠️ Public Write Succeeded! RLS may not be enabled or policy is too open.');
  }
}

verifyRLS();
