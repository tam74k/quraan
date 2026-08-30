const fs = require('fs');
let file = 'src/context/AppContext.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldDelete = `  const deleteUser = async (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    const __res = await supabase.from('profiles').delete().eq('id', id);
    if (__res.error) { console.error("Supabase Delete Error:", __res.error); alert("فشل الحذف: " + __res.error.message); }
  };`;

const newDelete = `  const deleteUser = async (id: string) => {
    // Prevent foreign key constraint errors by deleting from related tables first
    await supabase.from('sheikhs').delete().eq('user_id', id);
    await supabase.from('admins').delete().eq('user_id', id);
    const __res = await supabase.from('profiles').delete().eq('id', id);
    if (__res.error) { 
      console.error("Supabase Delete Error:", __res.error); 
      alert("فشل الحذف: " + __res.error.message); 
      // Refresh to restore if failed
      window.location.reload();
    } else {
      setUsers(prev => prev.filter(u => u.id !== id));
      setSheikhs(prev => prev.filter(s => s.userId !== id));
      setAdmins(prev => prev.filter(a => a.userId !== id));
    }
  };`;

code = code.replace(oldDelete, newDelete);

fs.writeFileSync(file, code);
