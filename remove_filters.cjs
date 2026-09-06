const fs = require('fs');
let file = 'src/components/Admin/ReportsView.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "const halqaStudents = students.filter(s => s.sheikhId === activeSheikh?.id && (!s.status || s.status === 'Active' || s.status === 'active' || s.status === 'نشط'));",
  "const halqaStudents = students.filter(s => s.sheikhId === activeSheikh?.id);"
);

code = code.replace(
  "{students.filter(s => !s.status || s.status === 'Active' || s.status === 'active' || s.status === 'نشط').map((st, i) => (",
  "{students.map((st, i) => ("
);

// add debug info to table headers
code = code.replace(
  "<div>كشف بأسماء طلاب حلقة: {activeSheikh?.halqaName || 'عامة'}</div>",
  "<div>كشف بأسماء طلاب حلقة: {activeSheikh?.halqaName || 'عامة'} (Count: {halqaStudents.length}, Sheikh ID: {activeSheikh?.id})</div>"
);

code = code.replace(
  "<div>كشف بأسماء جميع طلاب المركز</div>",
  "<div>كشف بأسماء جميع طلاب المركز (Count: {students.length})</div>"
);

fs.writeFileSync(file, code);
