const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://cudtouxztyxucgkzxhxo.supabase.co', 'sb_publishable_sqqHGwXyTB5fioeqt3Vixw_yefbMR4d');
console.log(typeof supabase.rpc);
