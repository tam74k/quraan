const fs = require('fs');
let file = 'src/components/Admin/ReportsView.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "كشف بأسماء جميع طلاب المركز (Count: {students.filter(s => isStudentActive(s) || getStudentDateList(s).length > 0).length})</div>",
  "كشف بأسماء جميع طلاب المركز</div>"
);

code = code.replace(
  "كشف بأسماء طلاب حلقة: {activeSheikh?.halqaName || 'عامة'} (Count: {halqaStudents.length})</div>",
  "كشف بأسماء طلاب حلقة: {activeSheikh?.halqaName || 'عامة'}</div>"
);

fs.writeFileSync(file, code);
