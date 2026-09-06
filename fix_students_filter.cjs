const fs = require('fs');
let file = 'src/components/Admin/StudentsManager.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `{sheikhs.map(sh => (
              <option key={sh.id} value={sh.id}>{sh.halqaName} - {sh.name}</option>
            ))}`;
const replacement = `{sheikhs.map(sh => (
              <option key={sh.id} value={sh.id}>{sh.halqaName} - {sh.name} {!sh.active && '(غير نشط)'}</option>
            ))}`;

if(code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync(file, code);
  console.log("Fixed StudentsManager filter dropdown");
} else {
  console.log("target not found");
}
