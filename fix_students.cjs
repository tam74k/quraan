const fs = require('fs');

const file = 'src/components/Admin/StudentsManager.tsx';
let code = fs.readFileSync(file, 'utf8');

// Remove civilId required
code = code.replace(
  /type="text"\s+required\s+value=\{formData\.civilId\}/g,
  'type="text" value={formData.civilId}'
);

fs.writeFileSync(file, code);
console.log("Fixed", file);
