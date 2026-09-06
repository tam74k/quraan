const fs = require('fs');
let file = 'src/types/index.ts';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('halqaType?: string;')) {
  code = code.replace(
    '  sheikhId: number | null;',
    '  sheikhId: number | null;\n  halqaType?: string;'
  );
  fs.writeFileSync(file, code);
  console.log("Updated types/index.ts successfully!");
} else {
  console.log("halqaType already exists in types/index.ts");
}
