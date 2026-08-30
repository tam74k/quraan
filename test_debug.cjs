const fs = require('fs');
let file = 'src/components/Admin/ReportsView.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "return (",
  `console.log("DEBUG ReportsView:", { studentsLength: students.length, halqaStudentsLength: halqaStudents.length, activeSheikhId: activeSheikh?.id, firstStudent: students[0] });\n  return (`
);

fs.writeFileSync(file, code);
