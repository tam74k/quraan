const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data: sheikhs } = await supabase.from('sheikhs').select('id, name');
  const { data: students } = await supabase.from('students').select('id, name, status, sheikh_id');
  console.log("Sheikhs:", sheikhs);
  console.log("Students:", students);
}
run();
