const fs = require('fs');
let file = 'src/components/Admin/HalaqatManager.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `  const [selectedSheikhId, setSelectedSheikhId] = useState<number>(sheikhs[0]?.id || 1);`;
const replacement = `  const activeSheikhs = sheikhs.filter(s => s.active);
  const [selectedSheikhId, setSelectedSheikhId] = useState<number>(activeSheikhs[0]?.id || sheikhs[0]?.id || 1);`;

if(code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync(file, code);
  console.log("Fixed HalaqatManager default selected");
} else {
  console.log("target not found");
}
