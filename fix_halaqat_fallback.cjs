const fs = require('fs');
let file = 'src/components/Admin/HalaqatManager.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `const selectedSheikh = sheikhs.find(s => s.id === selectedSheikhId) || sheikhs[0];`;
const replacement = `const selectedSheikh = sheikhs.find(s => s.id === selectedSheikhId) || activeSheikhs[0] || sheikhs[0];`;

if(code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync(file, code);
  console.log("Fixed HalaqatManager fallback");
} else {
  console.log("target not found");
}
