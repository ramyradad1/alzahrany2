
import { createClient } from '@supabase/supabase-js';

// Access environment variables using Vite's import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Diagnostic logging for debugging connection issues
if (import.meta.env.DEV || !supabaseUrl || !supabaseKey) {
    console.log('[Supabase Debug]', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
        urlPrefix: supabaseUrl?.substring(0, 30) + '...',
        keyPrefix: supabaseKey?.substring(0, 20) + '...',
        keyFormat: supabaseKey?.startsWith('eyJ') ? 'JWT (correct)' : 'Non-JWT (may be incorrect)'
    });
}

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials!');
    console.error('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in Vercel Environment Variables');
}

// Validate anon key format (should be a JWT starting with eyJ)
if (supabaseKey && !supabaseKey.startsWith('eyJ')) {
    console.warn('⚠️ Supabase anon key may be incorrect. It should start with "eyJ" (JWT format)');
    console.warn('Get the correct key from: Supabase Dashboard > Settings > API > anon public key');
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseKey || 'placeholder'
);
