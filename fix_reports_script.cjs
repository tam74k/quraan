const fs = require('fs');
let file = 'src/components/Admin/ReportsView.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Button Text Fix
code = code.replace(
  '<span>طباعة الاستمارات فوراً (A4 بالعرض)</span>',
  '<span>طباعة الاستمارات</span>'
);

// 2. Add Helper Functions
const helpers = `
  const isStudentActive = (student: any) => !student.status || student.status.toLowerCase() === 'active' || student.status === 'نشط';
  const getStudentDateList = (student: any) => {
    if (isStudentActive(student)) return dateList;
    return dateList.filter(dStr => tracking.some(t => t.studentId === student.id && t.date === dStr));
  };
`;

code = code.replace(
  'const selectedStudent = students.find(s => s.id === selectedStudentId);',
  `const selectedStudent = students.find(s => s.id === selectedStudentId);\n${helpers}`
);

// 3. Fix renderSingleStudentLandscapeSheet
code = code.replace(
  'const renderSingleStudentLandscapeSheet = (student: any, sheikh: any) => {',
  `const renderSingleStudentLandscapeSheet = (student: any, sheikh: any) => {\n    const studentDates = getStudentDateList(student);\n    if (!isStudentActive(student) && studentDates.length === 0) return null;`
);
code = code.replace(
  '{dateList.map((dStr, idx) => {',
  '{studentDates.map((dStr, idx) => {'
);

// 4. Fix renderSheikhDailySheet
code = code.replace(
  'return studentsList.flatMap((st) => {',
  `return studentsList.flatMap((st) => {\n                  const studentDates = getStudentDateList(st);\n                  if (!isStudentActive(st) && studentDates.length === 0) return [];`
);
code = code.replace(
  'return dateList.map((dStr) => {',
  'return studentDates.map((dStr) => {'
);

// 5. Fix filtered lists for "halqaStudents" and "all_students" tables
code = code.replace(
  'const halqaStudents = students.filter(s => s.sheikhId === activeSheikh?.id);',
  'const halqaStudents = students.filter(s => s.sheikhId === activeSheikh?.id && (isStudentActive(s) || getStudentDateList(s).length > 0));'
);
code = code.replace(
  '{students.map((st, i) => (',
  "{students.filter(s => isStudentActive(s) || getStudentDateList(s).length > 0).map((st, i) => ("
);

// Update count
code = code.replace(
  'كشف بأسماء جميع طلاب المركز</div>',
  'كشف بأسماء جميع طلاب المركز (Count: {students.filter(s => isStudentActive(s) || getStudentDateList(s).length > 0).length})</div>'
);
code = code.replace(
  'كشف بأسماء طلاب حلقة: {activeSheikh?.halqaName || \'عامة\'}</div>',
  'كشف بأسماء طلاب حلقة: {activeSheikh?.halqaName || \'عامة\'} (Count: {halqaStudents.length})</div>'
);

fs.writeFileSync(file, code);
