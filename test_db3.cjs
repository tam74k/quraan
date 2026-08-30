const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data: students } = await supabase.from('students').select('id, name, status, sheikh_id');
  console.log("Students details:");
  students.forEach(s => {
    console.log(`id: ${s.id}, name: ${s.name}, status: "${s.status}", sheikh_id: ${s.sheikh_id} (type: ${typeof s.sheikh_id})`);
  });
}
run();
