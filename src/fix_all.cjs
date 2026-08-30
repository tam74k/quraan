const fs = require('fs');

// 1. Fix AppContext.tsx
let appContextCode = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// Replace halqa_types fetch in Promise.all if present
appAppContextCode = appContextCode.replace(/,\s*\{ data: halqaTypesData \}/g, '');
appAppContextCode = appContextCode.replace(/,\s*supabase\.from\('halqa_types'\)\.select\('\*'\)/g, '');

const oldHalqaLoadRegex = /if\s*\(halqaTypesData\s*&&\s*halqaTypesData\.length\s*>\s*0\)\s*\{[\s\S]*?\}/;
const newHalqaLoad = `      try {
        const { data: halqaTypesData } = await supabase.from('halqa_types').select('*');
        if (halqaTypesData && halqaTypesData.length > 0) {
          setHalqaTypes(halqaTypesData.map((h) => h.name));
        }
      } catch (err) {
        // halqa_types table might not exist yet
      }`;

if (oldHalqaLoadRegex.test(appAppContextCode)) {
  appAppContextCode = appContextCode.replace(oldHalqaLoadRegex, newHalqaLoad);
  fs.writeFileSync('src/context/AppContext.tsx', appContextCode);
  console.log('AppContext.tsx fixed successfully!');
} else {
  console.log('AppContext.tsx halqaTypesData block not found, checking manual string...');
}

// 2. Fix ReportsView.tsx
let reportsCode = fs.readFileSync('src/components/Admin/ReportsView.tsx', 'utf8');

// Let's rewrite ReportsView.tsx or fix the order of isStudentActive and halqaStudents
// We can replace the section containing activeSheikh and isStudentActive
const targetStr = `  const activeSheikh = sheikhs.find(s => s.id === selectedSheikhId) || sheikhs[0];
  const halqaStudents = students.filter(s => s.sheikhId === activeSheikh?.id && (isStudentActive(s) || getStudentDateList(s).length > 0));
  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const isStudentActive = (student: any) => !student.status || student.status.toLowerCase() === 'active' || student.status === 'نشط';
  const getStudentDateList = (student: any) => {
    if (isStudentActive(student)) return dateList;
    return dateList.filter(dStr => tracking.some(t => t.studentId === student.id && t.date === dStr));
  };`;

const replacementStr = `  const isStudentActive = (student: any) => !student.status || student.status.toLowerCase() === 'active' || student.status === 'نشط';
  const getStudentDateList = (student: any) => {
    if (isStudentActive(student)) return dateList;
    return dateList.filter(dStr => tracking.some(t => t.studentId === student.id && t.date === dStr));
  };
  const activeSheikh = sheikhs.find(s => s.id === selectedSheikhId) || sheikhs[0];
  const halqaStudents = students.filter(s => s.sheikhId === activeSheikh?.id && (isStudentActive(s) || getStudentDateList(s).length > 0));
  const selectedStudent = students.find(s => s.id === selectedStudentId);`;

if (reportsCode.includes(targetStr)) {
  reportsCode = reportsCode.replace(targetStr, replacementStr);
  fs.writeFileSync('src/components/Admin/ReportsView.tsx', reportsCode);
  console.log('ReportsView.tsx fixed successfully!');
} else {
  // If exact whitespace/newlines differ, let's normalize or use regex
  console.log('Target string exact match failed in ReportsView.tsx, attempting regex replace...');
  const regex = /const activeSheikh = sheikhs\.find[\s\S]*?const getStudentDateList = \(student: any\) => \{[\s\S]*?\};\};?/;
  // Let's inspect parts of reportsCode
  console.log('ReportsView has activeSheikh:', reportsCode.includes('activeSheikh'));
}
