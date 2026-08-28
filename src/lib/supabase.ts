import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a dummy client or throw a soft error if missing, but avoid crashing the whole app import tree
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'public-anon-key'
);

export const hasSupabaseConfig = !!(supabaseUrl && supabaseKey);
