const fs = require('fs');
function fix(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  // We have: const res = await supabase.rpc(...)
  code = code.replace(
    /const res = await supabase\.rpc\('admin_create_auth_user'[\s\S]*?\n\s*\}\n/m,
    `$&      var newAuthId = res.data;\n`
  );

  // Then change userId assignment
  if (filePath.includes('Sheikh')) {
     code = code.replace(
       /userId: editingSheikh\?\.userId \|\| `u-sh-\$\{Date\.now\(\)\}`/,
       `userId: editingSheikh?.userId || (typeof newAuthId !== 'undefined' ? newAuthId : null)`
     );
  } else {
     code = code.replace(
       /userId: editingAdmin\?\.userId \|\| `u-ad-\$\{Date\.now\(\)\}`/,
       `userId: editingAdmin?.userId || (typeof newAuthId !== 'undefined' ? newAuthId : null)`
     );
  }

  // Also prevent updating context if we rely on supabase triggers. Actually, it's fine, context will update on refresh, or we can leave it.
  
  fs.writeFileSync(filePath, code);
}
fix('src/components/Admin/SheikhsManager.tsx');
fix('src/components/Admin/AdminsManager.tsx');
console.log("Fixed userId linking");
