const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data: users } = await supabase.from('profiles').select('*');
  console.log("Users:", users.map(u => u.name));
}
run();
