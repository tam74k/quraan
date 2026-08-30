const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data: user } = await supabase.from('profiles').select('id, name').eq('name', 'مستخدم جديد').single();
  if (user) {
    console.log("Found user:", user.id);
    const res = await supabase.from('profiles').delete().eq('id', user.id);
    console.log("Delete result:", res.error || "Success");
  }
}
run();
