const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// Add updateUser and deleteUser types
code = code.replace(
  /addUser: \(user: User\) => void;/,
  `addUser: (user: User) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;`
);

// Add implementation of updateUser and deleteUser
const impl = `const addUser = (userData: User) => {
    setUsers(prev => [...prev, userData]);
  };
  const updateUser = async (id: string, userData: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...userData } : u));
    const __res = await supabase.from('profiles').update({
        username: userData.username,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        role: userData.role,
        status: userData.status,
        permissions: userData.permissions
    }).eq('id', id);
    if (__res.error) { console.error("Supabase Update Error:", __res.error); alert("فشل التحديث: " + __res.error.message); }
  };
  const deleteUser = async (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    const __res = await supabase.from('profiles').delete().eq('id', id);
    if (__res.error) { console.error("Supabase Delete Error:", __res.error); alert("فشل الحذف: " + __res.error.message); }
  };`;

code = code.replace(
  /const addUser = \(userData: User\) => \{\s*setUsers\(prev => \[\.\.\.prev, userData\]\);\s*\/\/[^\n]*\s*\};\s*/s,
  impl + '\n'
);

// Add to context provider values
code = code.replace(
  /addAdmin, updateAdmin, deleteAdmin, addUser, assignStudentToSheikh/,
  `addAdmin, updateAdmin, deleteAdmin, addUser, updateUser, deleteUser, assignStudentToSheikh`
);

fs.writeFileSync('src/context/AppContext.tsx', code);
console.log("Added updateUser and deleteUser");
