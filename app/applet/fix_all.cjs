const fs = require('fs');

// 1. Fix AppContext.tsx
let appContextCode = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

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
  console.log('AppContext.tsx halqaTypesData block not found');
}

// 2. Fix ReportsView.tsx
let reportsCode = fs.readFileSync('src/components/Admin/ReportsView.tsx', 'utf8');

// We can just replace the whole top part of ReportsView or use regex
const regex = /const activeSheikh = sheikhs\.find\(s => s\.id === selectedSheikhId\) \|\| sheikhs\[0\];\s*const halqaStudents = students\.filter\(s => s\.sheikhId === activeSheikh\?\.id && \(isStudentActive\(s\) \|\| getStudentDateList\(s\)\.length > 0\)\);\s*const selectedStudent = students\.find\(s => s\.id === selectedStudentId\);\s*const isStudentActive = \(student: any\) => !student\.status \|\| student\.status\.toLowerCase\(\) === 'active' \|\| student\.status === 'نشط';\s*const getStudentDateList = \(student: any\) => \{\s*if \(isStudentActive\(student\)\) return dateList;\s*return dateList\.filter\(dStr => tracking\.some\(t => t\.studentId === student\.id && t\.date === dStr\);\s*\};/;

const replacement = `  const isStudentActive = (student: any) => !student.status || student.status.toLowerCase() === 'active' || student.status === 'نشط';
  const getStudentDateList = (student: any) => {
    if (isStudentActive(student)) return dateList;
    return dateList.filter(dStr => tracking.some(t => t.studentId === student.id && t.date === dStr));
  };
  const activeSheikh = sheikhs.find(s => s.id === selectedSheikhId) || sheikhs[0];
  const halqaStudents = students.filter(s => s.sheikhId === activeSheikh?.id && (isStudentActive(s) || getStudentDateList(s).length > 0));
  const selectedStudent = students.find(s => s.id === selectedStudentId);`;

if (reportsCode.includes('activeSheikh') && reportsCode.includes('isStudentActive')) {
  // Let's do a clean rewrite of the top variable declarations in ReportsView.tsx
  // Let's find where const dateList = ... is and insert isStudentActive right after it.
  const idx = reportsCode.indexOf('const dateList = getDatesInRange(dateFrom, dateTo);');
  if (idx !== -1) {
    const endIdx = reportsCode.indexOf('const selectedStudent = students.find(s => s.id === selectedStudentId);');
    if (endIdx !== -1) {
      const subst = reportsCode.substring(idx, endIdx + 'const selectedStudent = students.find(s => s.id === selectedStudentId);'.length);
      console.log('Found subst:', subst);
      reportsCode = reportsCode.replace(subst, `
  const dateList = getDatesInRange(dateFrom, dateTo);
  const isStudentActive = (student: any) => !student.status || student.status.toLowerCase() === 'active' || student.status === 'نشط';
  const getStudentDateList = (student: any) => {
    if (isStudentActive(student)) return dateList;
    return dateList.filter(dStr => tracking.some(t => t.studentId === student.id && t.date === dStr));
  };
  const activeSheikh = sheikhs.find(s => s.id === selectedSheikhId) || sheikhs[0];
  const halqaStudents = students.filter(s => s.sheikhId === activeSheikh?.id && (isStudentActive(s) || getStudentDateList(s).length > 0));
  const selectedStudent = students.find(s => s.id === selectedStudentId);
      `);
      fs.writeFileSync('src/components/Admin/ReportsView.tsx', reportsCode);
      console.log('ReportsView.tsx fixed via index replacement!');
    }
  }
}
