const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const target = `const fetchInitialData = async () => { try {`;
content = content.replace(target, `const fetchInitialData = async () => {`);

const newFetch = `const fetchInitialData = async () => {
    try {
      const [
        { data: profilesData },
        { data: centerInfoData },
        { data: sheikhsData },
        { data: adminsData },
        { data: studentsData },
        { data: trackingData },
        { data: notesData },
        { data: examsData },
        { data: badgesData }
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('center_info').select('*').limit(1).single(),
        supabase.from('sheikhs').select('*'),
        supabase.from('admins').select('*'),
        supabase.from('students').select('*'),
        supabase.from('tracking').select('*'),
        supabase.from('notes').select('*'),
        supabase.from('exams').select('*'),
        supabase.from('badges').select('*')
      ]);

      if (profilesData) {
        setUsers(profilesData.map((p: any) => ({
          id: p.id,
          username: p.username,
          email: p.email,
          name: p.name,
          phone: p.phone,
          role: p.role,
          status: p.status,
          permissions: p.permissions
        })));
      }

      if (centerInfoData) {
        setCenterInfo({
          name: centerInfoData.name || 'مركز تحفيظ القرآن الكريم',
          address: centerInfoData.address || '',
          phone: centerInfoData.phone || '',
          email: centerInfoData.email || '',
          logo: centerInfoData.logo || '',
          hijriYear: centerInfoData.hijri_year || '',
          academicSeason: centerInfoData.academic_season || '',
          managerName: centerInfoData.manager_name || ''
        });
      } else {
        // Fallback info if empty database
        setCenterInfo({
          name: 'مركز تحفيظ القرآن الكريم',
          address: '', phone: '', email: '', logo: '', hijriYear: '', academicSeason: '', managerName: ''
        })
      }

      if (sheikhsData) setSheikhs(sheikhsData.map((s: any) => ({ id: s.id, userId: s.user_id, name: s.name, civilId: s.civil_id, phone: s.phone, email: s.email, halqaName: s.halqa_name, bio: s.bio, active: s.active })));
      if (adminsData) setAdmins(adminsData.map((a: any) => ({ id: a.id, userId: a.user_id, name: a.name, civilId: a.civil_id, phone: a.phone, email: a.email, jobTitle: a.job_title })));
      if (studentsData) setStudents(studentsData.map((s: any) => ({ id: s.id, name: s.name, civilId: s.civil_id, dob: s.dob, age: s.age, grade: s.grade, parentName: s.parent_name, parentPhone: s.parent_phone, parentEmail: s.parent_email, sheikhId: s.sheikh_id, status: s.status, joinDate: s.join_date, currentJuz: s.current_juz, targetJuz: s.target_juz, points: s.points, notes: s.notes })));
      if (trackingData) setTracking(trackingData.map((t: any) => ({ id: t.id, studentId: t.student_id, sheikhId: t.sheikh_id, date: t.date, newSurah: t.new_surah, newFrom: t.new_from, newTo: t.new_to, revSurah: t.rev_surah, revFrom: t.rev_from, revTo: t.rev_to, bigRevSurah: t.big_rev_surah, bigRevFrom: t.big_rev_from, bigRevTo: t.big_rev_to, att: t.att, eval: t.eval, notes: t.notes, status: t.status, readByParent: t.read_by_parent })));
      if (notesData) setNotes(notesData.map((n: any) => ({ id: n.id, studentId: n.student_id, sheikhId: n.sheikh_id, date: n.date, text: n.text, priority: n.priority, readByParent: n.read_by_parent })));
      if (examsData) setExams(examsData.map((e: any) => ({ id: e.id, studentId: e.student_id, date: e.date, type: e.type, partOrSurah: e.part_or_surah, grade: e.grade, score: e.score, examiner: e.examiner, notes: e.notes })));
      if (badgesData) setBadges(badgesData.map((b: any) => ({ id: b.id, studentId: b.student_id, name: b.name, icon: b.icon, description: b.description, dateEarned: b.date_earned })));
    } catch (err) {
      console.error("Failed to load initial data from Supabase:", err);
      setCenterInfo({
        name: 'مركز تحفيظ القرآن الكريم',
        address: '', phone: '', email: '', logo: '', hijriYear: '', academicSeason: '', managerName: ''
      });
    }
  };`;

// replace from `const fetchInitialData = async () => {` to `};` right before `const toggleDarkMode`
const startIdx = content.indexOf('const fetchInitialData = async () => {');
const endIdx = content.indexOf('const toggleDarkMode = () => {');

if (startIdx !== -1 && endIdx !== -1) {
    content = content.substring(0, startIdx) + newFetch + '\n\n  ' + content.substring(endIdx);
    fs.writeFileSync('src/context/AppContext.tsx', content);
    console.log("Replaced correctly");
} else {
    console.log("Could not find boundaries");
}
