import { createClient } from '@supabase/supabase-js';

// نستخدم متغيرات البيئة إن وجدت، وفي حال عدم وجودها (كما في GitHub) نستخدم الروابط مباشرة ليعمل الموقع بسلاسة
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cudtouxztyxucgkzxhxo.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_sqqHGwXyTB5fioeqt3Vixw_yefbMR4d';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const hasSupabaseConfig = true;

// A secondary client used for creating users without logging out the current user
export const supabaseSecondary = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});
