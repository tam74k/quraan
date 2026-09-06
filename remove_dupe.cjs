const fs = require('fs');
let file = 'src/context/AppContext.tsx';
let code = fs.readFileSync(file, 'utf8');

// Clean up duplicate function definitions inside value object
code = code.replace(/        deleteHalqaType,\s+const addHalqaType = async \(name: string\) => \{[\s\S]*?eq\('name', oldName\);\s+\}\s+/g, '        deleteHalqaType,\n');

fs.writeFileSync(file, code);
console.log("Duplicates removed!");
