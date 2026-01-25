
import { createClient } from '@supabase/supabase-js';

// Access environment variables using Vite's import.meta.env
// The user provided REACT_APP vars, but in Vite we mapped them to VITE_ vars in env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('Missing Supabase credentials. usage of Supabase will fail.');
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseKey || 'placeholder'
);
