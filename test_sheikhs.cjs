const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://cudtouxztyxucgkzxhxo.supabase.co';
const supabaseKey = 'sb_publishable_sqqHGwXyTB5fioeqt3Vixw_yefbMR4d';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data } = await supabase.from('sheikhs').select('*').limit(1);
  console.log(data);
}
check();
