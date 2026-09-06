const fs = require('fs');
let code = fs.readFileSync('src/components/Admin/AdminsManager.tsx', 'utf8');

code = code.replace(
  /const payload = \{/,
  'const payload = {\n      userId: editingAdmin?.userId || (typeof newAuthId !== "undefined" ? newAuthId : null),'
);

fs.writeFileSync('src/components/Admin/AdminsManager.tsx', code);
console.log("Fixed Admin payload");
