const fs = require('fs');
let file = 'src/context/AppContext.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Add halqaTypes to AppContextType
if (!code.includes('halqaTypes: string[];')) {
  code = code.replace(
    '  badges: Badge[];',
    '  badges: Badge[];\n  halqaTypes: string[];\n  addHalqaType: (name: string) => void;\n  updateHalqaType: (oldName: string, newName: string) => void;\n  deleteHalqaType: (name: string) => void;'
  );
}

// 2. Add state
if (!code.includes('const [halqaTypes, setHalqaTypes]')) {
  code = code.replace(
    '  const [badges, setBadges] = useState<Badge[]>([]);',
    '  const [badges, setBadges] = useState<Badge[]>([]);\n  const [halqaTypes, setHalqaTypes] = useState<string[]>([\n    "حلقة مميزة",\n    "حلقة نشء",\n    "حلقة تلقين",\n    "حلقة تلقين متقدم",\n    "حلقة تأسيس"\n  ]);'
  );
}

// 3. Add halqa_types fetch in fetchInitialData
if (!code.includes('halqa_types')) {
  code = code.replace(
    '        { data: badgesData }',
    '        { data: badgesData },\n        { data: halqaTypesData }'
  );
  code = code.replace(
    '        supabase.from(\'exams\').select(\'*\'),\n        supabase.from(\'badges\').select(\'*\')',
    '        supabase.from(\'exams\').select(\'*\'),\n        supabase.from(\'badges\').select(\'*\'),\n        supabase.from(\'halqa_types\').select(\'*\')'
  );
  code = code.replace(
    '      if (badgesData) setBadges(badgesData.map((b: any) => ({ id: b.id, studentId: b.student_id, name: b.name, icon: b.icon, description: b.description, dateEarned: b.date_earned })));',
    '      if (badgesData) setBadges(badgesData.map((b: any) => ({ id: b.id, studentId: b.student_id, name: b.name, icon: b.icon, description: b.description, dateEarned: b.date_earned })));\n      if (halqaTypesData && halqaTypesData.length > 0) {\n        setHalqaTypes(halqaTypesData.map((h: any) => h.name));\n      }'
  );
}

// 4. Update student mapping
if (!code.includes('halqaType: s.halqa_type')) {
  code = code.replace(
    'if (studentsData) setStudents(studentsData.map((s: any) => ({ id: s.id, name: s.name, civilId: s.civil_id, dob: s.dob, age: s.age, grade: s.grade, parentName: s.parent_name, parentPhone: s.parent_phone, parentEmail: s.parent_email, sheikhId: s.sheikh_id, status: s.status, joinDate: s.join_date, currentJuz: s.current_juz, targetJuz: s.target_juz, points: s.points, notes: s.notes })));',
    'if (studentsData) setStudents(studentsData.map((s: any) => ({ id: s.id, name: s.name, civilId: s.civil_id, dob: s.dob, age: s.age, grade: s.grade, parentName: s.parent_name, parentPhone: s.parent_phone, parentEmail: s.parent_email, sheikhId: s.sheikh_id, status: s.status, joinDate: s.join_date, currentJuz: s.current_juz, targetJuz: s.target_juz, points: s.points, notes: s.notes, halqaType: s.halqa_type || \'\' })));'
  );
}

// 5. Update addStudent and updateStudent
if (!code.includes('halqa_type: newStudent.halqaType')) {
  code = code.replace(
    'parent_email: newStudent.parentEmail, sheikh_id: newStudent.sheikhId, status: newStudent.status, join_date: newStudent.joinDate, current_juz: newStudent.currentJuz, target_juz: newStudent.targetJuz, points: newStudent.points, notes: newStudent.notes',
    'parent_email: newStudent.parentEmail, sheikh_id: newStudent.sheikhId, status: newStudent.status, join_date: newStudent.joinDate, current_juz: newStudent.currentJuz, target_juz: newStudent.targetJuz, points: newStudent.points, notes: newStudent.notes, halqa_type: newStudent.halqaType || \'\''
  );
}

if (!code.includes('updatePayload.halqa_type')) {
  code = code.replace(
    'if (studentData.notes !== undefined) updatePayload.notes = studentData.notes;',
    'if (studentData.notes !== undefined) updatePayload.notes = studentData.notes;\n    if (studentData.halqaType !== undefined) updatePayload.halqa_type = studentData.halqaType;'
  );
}

// 6. Add halqa types methods before return
if (!code.includes('const addHalqaType =')) {
  const methodsToAdd = `
  const addHalqaType = async (name: string) => {
    if (!name.trim() || halqaTypes.includes(name.trim())) return;
    const trimmed = name.trim();
    setHalqaTypes(prev => [...prev, trimmed]);
    const { error } = await supabase.from('halqa_types').insert({ name: trimmed });
    if (error) console.error("Error adding halqa type:", error);
  };

  const updateHalqaType = async (oldName: string, newName: string) => {
    if (!newName.trim() || halqaTypes.includes(newName.trim())) return;
    const trimmed = newName.trim();
    setHalqaTypes(prev => prev.map(t => t === oldName ? trimmed : t));
    const { error } = await supabase.from('halqa_types').update({ name: trimmed }).eq('name', oldName);
    if (error) console.error("Error updating halqa type:", error);
  };

  const deleteHalqaType = async (name: string) => {
    setHalqaTypes(prev => prev.filter(t => t !== name));
    const { error } = await supabase.from('halqa_types').delete().eq('name', name);
    if (error) console.error("Error deleting halqa type:", error);
  };
`;
  code = code.replace(
    'exportDataJSON,',
    methodsToAdd + '\n  exportDataJSON,'
  );

  code = code.replace(
    'exportDataJSON,',
    'halqaTypes,\n    addHalqaType,\n    updateHalqaType,\n    deleteHalqaType,\n    exportDataJSON,'
  );
}

fs.writeFileSync(file, code);
console.log("AppContext updated successfully!");
