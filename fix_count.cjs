const fs = require('fs');
let file = 'src/components/Admin/ReportsView.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "<div>كشف بأسماء طلاب حلقة: {activeSheikh?.halqaName || 'عامة'} (Count: {halqaStudents.length}, Sheikh ID: {activeSheikh?.id})</div>",
  "<div>كشف بأسماء طلاب حلقة: {activeSheikh?.halqaName || 'عامة'}</div>"
);

code = code.replace(
  "<div>كشف بأسماء جميع طلاب المركز (Count: {students.length})</div>",
  "<div>كشف بأسماء جميع طلاب المركز</div>"
);

fs.writeFileSync(file, code);
