const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://cudtouxztyxucgkzxhxo.supabase.co';
const supabaseKey = 'sb_publishable_sqqHGwXyTB5fioeqt3Vixw_yefbMR4d';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data } = await supabase.from('students').select('id, sheikh_id');
  console.log('Students:', data);
  const { data: sh } = await supabase.from('sheikhs').select('id');
  console.log('Sheikhs:', sh);
}
check();
