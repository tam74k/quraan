import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  User,
  UserRole,
  CenterInfo,
  Sheikh,
  Admin,
  Student,
  TrackingRecord,
  Note,
  Exam,
  Badge,
  ArchiveRecord
} from '../types';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  centerInfo: CenterInfo;
  sheikhs: Sheikh[];
  admins: Admin[];
  students: Student[];
  tracking: TrackingRecord[];
  notes: Note[];
  exams: Exam[];
  badges: Badge[];
  archives: ArchiveRecord[];
  halqaTypes: string[];
  addHalqaType: (name: string) => void;
  updateHalqaType: (oldName: string, newName: string) => void;
  deleteHalqaType: (name: string) => void;
  nationalities: string[];
  addNationality: (name: string) => void;
  updateNationality: (oldName: string, newName: string) => void;
  deleteNationality: (name: string) => void;
  isDarkMode: boolean;
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  toggleDarkMode: () => void;
  login: (email: string) => Promise<boolean>;
  switchRole: (role: UserRole) => void;
  logout: () => void;
  updateCenterInfo: (info: Partial<CenterInfo>) => void;
  addStudent: (student: Omit<Student, 'id'>) => Student;
  updateStudent: (id: number, student: Partial<Student>) => void;
  deleteStudent: (id: number) => void;
  addSheikh: (sheikh: Omit<Sheikh, 'id'>) => Sheikh;
  updateSheikh: (id: number, sheikh: Partial<Sheikh>) => void;
  deleteSheikh: (id: number) => void;
  addAdmin: (admin: Omit<Admin, 'id'>) => Admin;
  updateAdmin: (id: number, admin: Partial<Admin>) => void;
  deleteAdmin: (id: number) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  assignStudentToSheikh: (studentId: number, sheikhId: number | null) => Promise<{ success: boolean; error?: string }>;
  refreshData: () => Promise<void>;
  saveTrackingRecord: (record: Omit<TrackingRecord, 'id'> & { id?: number }) => Promise<TrackingRecord>;
  saveBatchTrackingRecords: (records: (Omit<TrackingRecord, 'id'> & { id?: number })[]) => Promise<{ success: boolean; count: number; error?: string }>;
  deleteTrackingRecord: (id: number) => void;
  addNote: (note: Omit<Note, 'id'>) => void;
  markNotesAsRead: (studentIds: number[]) => void;
  addExam: (exam: Omit<Exam, 'id'>) => Exam;
  addBadge: (badge: Omit<Badge, 'id'>) => void;
  archiveAndResetCurrentData: () => Promise<void>;
  deleteArchive: (id: string) => void;
  exportDataJSON: () => void;
  importDataJSON: (jsonString: string) => boolean;
  resetToDemoData: () => void;
  extractDOBFromCivilID: (civilId: string) => string | null;
  currentSheikh: Sheikh | null;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [centerInfo, setCenterInfo] = useState<CenterInfo>({} as CenterInfo);
  const [sheikhs, setSheikhs] = useState<Sheikh[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [tracking, setTracking] = useState<TrackingRecord[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [archives, setArchives] = useState<ArchiveRecord[]>([]);
  const [halqaTypes, setHalqaTypes] = useState<string[]>([
    "حلقة مميزة",
    "حلقة نشء",
    "حلقة تلقين",
    "حلقة تلقين متقدم",
    "حلقة تأسيس"
  ]);
  const [nationalities, setNationalities] = useState<string[]>([
    "كويتي",
    "مصري",
    "سوري",
    "سعودي",
    "إماراتي",
    "قطري",
    "بحريني",
    "عُماني",
    "أردني",
    "فلسطيني",
    "لبناني",
    "عراقي",
    "يمني",
    "سوداني",
    "مغربي",
    "جزائري",
    "تونسي",
    "ليبي",
    "موريتاني",
    "صومالي",
    "جيبوتي",
    "قمري"
  ]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);
  const [activeScreen, setActiveScreen] = useState('dashboard');

  useEffect(() => {
    fetchInitialData().then((loadedProfiles) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        let userEmail = session?.user?.email;
        if (!userEmail) {
            userEmail = localStorage.getItem('fallback_user_email') || undefined;
        }

        if (userEmail && loadedProfiles) {
          const p = loadedProfiles.find((profile: any) => profile.email === userEmail);
          if (p) {
            const loggedInUser: User = {
              id: p.id,
              username: p.username,
              email: p.email,
              name: p.name,
              phone: p.phone,
              role: p.role,
              status: p.status,
              permissions: p.permissions
            };
            setCurrentUser(loggedInUser);
            if (p.role === "admin" || p.role === "data_entry") setActiveScreen("dashboard");
            else if (p.role === "sheikh") setActiveScreen("daily-halqa");
            else if (p.role === "parent") setActiveScreen("parent-kids");
          }
        }
      });
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
    });

    // Realtime subscription for students table across multiple devices
    const studentsChannel = supabase
      .channel('realtime:students')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, async () => {
        const { data: freshStudents } = await supabase.from('students').select('*');
        if (freshStudents) {
          setStudents(freshStudents.map((s: any) => ({
            id: s.id,
            name: s.name,
            civilId: s.civil_id,
            dob: s.dob,
            age: s.age,
            grade: s.grade,
            nationality: s.nationality || 'كويتي',
            parentName: s.parent_name,
            parentPhone: s.parent_phone,
            parentEmail: s.parent_email,
            sheikhId: s.sheikh_id,
            status: s.status,
            joinDate: s.join_date,
            currentJuz: s.current_juz,
            targetJuz: s.target_juz,
            points: s.points,
            notes: s.notes,
            halqaType: s.halqa_type || ''
          })));
        }
      })
      .subscribe();

    return () => {
      authListener.subscription.unsubscribe();
      supabase.removeChannel(studentsChannel);
    };
  }, []);

  const fetchInitialData = async (): Promise<any[] | undefined> => {
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
        { data: badgesData },
        { data: archivesData }
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('center_info').select('*').limit(1).single(),
        supabase.from('sheikhs').select('*'),
        supabase.from('admins').select('*'),
        supabase.from('students').select('*'),
        supabase.from('tracking').select('*').order('id', { ascending: false }),
        supabase.from('notes').select('*'),
        supabase.from('exams').select('*'),
        supabase.from('badges').select('*'),
        supabase.from('archives').select('*').order('created_at', { ascending: false })
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
      if (studentsData) setStudents(studentsData.map((s: any) => ({ id: s.id, name: s.name, civilId: s.civil_id, dob: s.dob, age: s.age, grade: s.grade, nationality: s.nationality || 'كويتي', parentName: s.parent_name, parentPhone: s.parent_phone, parentEmail: s.parent_email, sheikhId: s.sheikh_id, status: s.status, joinDate: s.join_date, currentJuz: s.current_juz, targetJuz: s.target_juz, points: s.points, notes: s.notes, halqaType: s.halqa_type || '' })));
      if (trackingData) setTracking(trackingData.map((t: any) => ({ id: t.id, studentId: t.student_id, sheikhId: t.sheikh_id, date: t.date, newSurah: t.new_surah, newFrom: t.new_from, newTo: t.new_to, revSurah: t.rev_surah, revFrom: t.rev_from, revTo: t.rev_to, revToSurah: t.rev_to_surah, revToFrom: t.rev_to_from, revToTo: t.rev_to_to, bigRevSurah: t.big_rev_surah, bigRevFrom: t.big_rev_from, bigRevTo: t.big_rev_to, att: t.att, eval: t.eval, notes: t.notes, status: t.status, readByParent: t.read_by_parent })));
      if (notesData) setNotes(notesData.map((n: any) => ({ id: n.id, studentId: n.student_id, sheikhId: n.sheikh_id, date: n.date, text: n.text, priority: n.priority, readByParent: n.read_by_parent })));
      if (examsData) setExams(examsData.map((e: any) => ({ id: e.id, studentId: e.student_id, date: e.date, type: e.type, partOrSurah: e.part_or_surah, grade: e.grade, score: e.score, examiner: e.examiner, notes: e.notes })));
      if (badgesData) setBadges(badgesData.map((b: any) => ({ id: b.id, studentId: b.student_id, name: b.name, icon: b.icon, description: b.description, dateEarned: b.date_earned })));
      if (archivesData) {
        setArchives(archivesData.map((a: any) => ({
          id: a.id,
          date: a.archive_date,
          time: a.archive_time,
          archivedBy: a.archived_by,
          students: a.payload?.students || [],
          tracking: a.payload?.tracking || [],
          centerInfo: a.payload?.centerInfo || {},
          sheikhs: a.payload?.sheikhs || []
        })));
      }

      // Fetch halqa_types safely
      (async () => {
        try {
          const { data: halqaTypesData } = await supabase.from("halqa_types").select("*");
          if (halqaTypesData && halqaTypesData.length > 0) {
            setHalqaTypes(halqaTypesData.map((h: any) => h.name));
          }
        } catch (err) {
          // ignore
        }
      })();

      // Fetch nationalities safely
      (async () => {
        try {
          const { data: nationalitiesData } = await supabase.from("nationalities").select("*").order("sort_order", { ascending: true });
          if (nationalitiesData && nationalitiesData.length > 0) {
            setNationalities(nationalitiesData.map((n: any) => n.name));
          }
        } catch (err) {
          // ignore
        }
      })();

      return profilesData;
    } catch (err) {
      console.error("Failed to load initial data from Supabase:", err);
      setCenterInfo({
        name: 'مركز تحفيظ القرآن الكريم',
        address: '', phone: '', email: '', logo: '', hijriYear: '', academicSeason: '', managerName: ''
      });
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const login = async (email: string) => {
    let user = users.find(u => u.email === email);
    if (!user) {
      const { data } = await supabase.from('profiles').select('*').eq('email', email).single();
      if (data) {
        user = {
          id: data.id,
          username: data.username,
          email: data.email,
          name: data.name,
          phone: data.phone,
          role: data.role as UserRole,
          permissions: data.permissions,
          status: data.status
        };
        setUsers(prev => [...prev, user!]);
      }
    }
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('fallback_user_email', email);
      if (user.role === "admin" || user.role === "data_entry") setActiveScreen("dashboard");
      else if (user.role === "sheikh") setActiveScreen("daily-halqa");
      else if (user.role === "parent") setActiveScreen("parent-kids");
      return true;
    }
    return false;
  };

  const switchRole = (role: UserRole) => {
    const sampleUser: User = {
      id: `demo-${role}`,
      email: `${role}@test.com`,
      role: role,
      name: role === "admin" ? "المدير العام" : role === "sheikh" ? "الشيخ أحمد" : role === "parent" ? "ولي الأمر" : "مدخل البيانات"
    };
    setCurrentUser(sampleUser);
    if (role === "admin" || role === "data_entry") setActiveScreen("dashboard");
    else if (role === "sheikh") setActiveScreen("daily-halqa");
    else if (role === "parent") setActiveScreen("parent-kids");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('fallback_user_email');
    setCurrentUser(null);
  };

  const currentSheikh = currentUser && currentUser.role === "sheikh"
    ? sheikhs.find(s => s.userId === currentUser.id || s.email === currentUser.email) || sheikhs[0]
    : null;

  const updateCenterInfo = async (info: Partial<CenterInfo>) => {
    const newInfo = { ...centerInfo, ...info };
    setCenterInfo(newInfo);
    const __res = await supabase.from("center_info").update({
      name: newInfo.name,
      address: newInfo.address,
      phone: newInfo.phone,
      email: newInfo.email,
      logo: newInfo.logo,
      hijri_year: newInfo.hijriYear,
      academic_season: newInfo.academicSeason,
      manager_name: newInfo.managerName
    }).eq("id", 1); if (__res.error) { console.error("Supabase Update Error:", __res.error); alert("فشل التحديث: " + __res.error.message); }
  };

  const addStudent = (studentData: Omit<Student, "id">): Student => {
    const tempId = Date.now();
    const newStudent: Student = { ...studentData, id: tempId, joinDate: studentData.joinDate || new Date().toISOString().split("T")[0], status: studentData.status || "Active", points: studentData.points || 0, nationality: studentData.nationality || 'كويتي' };
    setStudents(prev => [newStudent, ...prev]);
    supabase.from("students").insert({
      name: newStudent.name,
      civil_id: newStudent.civilId,
      dob: newStudent.dob ? newStudent.dob : null,
      age: newStudent.age,
      grade: newStudent.grade,
      nationality: newStudent.nationality,
      parent_name: newStudent.parentName || null,
      parent_phone: newStudent.parentPhone || '',
      parent_email: newStudent.parentEmail ? newStudent.parentEmail : null,
      sheikh_id: (newStudent.sheikhId && Number(newStudent.sheikhId) > 0) ? Number(newStudent.sheikhId) : null,
      status: newStudent.status,
      join_date: newStudent.joinDate ? newStudent.joinDate : null,
      current_juz: newStudent.currentJuz || 1,
      target_juz: newStudent.targetJuz || 5,
      points: newStudent.points || 0,
      notes: newStudent.notes || null,
      halqa_type: newStudent.halqaType || ''
    }).select().single().then(({ data, error }) => {
      if (error) { console.error("Supabase Insert Error:", error); alert("فشل الحفظ في قاعدة البيانات: " + error.message); }
      if (data) setStudents(prev => prev.map(s => s.id === tempId ? { ...s, id: data.id } : s));
    });
    return newStudent;
  };

  const updateStudent = async (id: number, studentData: Partial<Student>) => {
    setStudents(prev => prev.map(s => (s.id === id ? { ...s, ...studentData } : s)));
    const updatePayload: any = {};
    if (studentData.name !== undefined) updatePayload.name = studentData.name;
    if (studentData.civilId !== undefined) updatePayload.civil_id = studentData.civilId;
    if (studentData.dob !== undefined) updatePayload.dob = studentData.dob ? studentData.dob : null;
    if (studentData.age !== undefined) updatePayload.age = studentData.age;
    if (studentData.grade !== undefined) updatePayload.grade = studentData.grade;
    if (studentData.nationality !== undefined) updatePayload.nationality = studentData.nationality;
    if (studentData.parentName !== undefined) updatePayload.parent_name = studentData.parentName;
    if (studentData.parentPhone !== undefined) updatePayload.parent_phone = studentData.parentPhone;
    if (studentData.parentEmail !== undefined) updatePayload.parent_email = studentData.parentEmail ? studentData.parentEmail : null;
    if (studentData.sheikhId !== undefined) updatePayload.sheikh_id = (studentData.sheikhId && Number(studentData.sheikhId) > 0) ? Number(studentData.sheikhId) : null;
    if (studentData.status !== undefined) updatePayload.status = studentData.status;
    if (studentData.joinDate !== undefined) updatePayload.join_date = studentData.joinDate ? studentData.joinDate : null;
    if (studentData.currentJuz !== undefined) updatePayload.current_juz = studentData.currentJuz;
    if (studentData.targetJuz !== undefined) updatePayload.target_juz = studentData.targetJuz;
    if (studentData.points !== undefined) updatePayload.points = studentData.points;
    if (studentData.notes !== undefined) updatePayload.notes = studentData.notes;
    if (studentData.halqaType !== undefined) updatePayload.halqa_type = studentData.halqaType;
    const __res = await supabase.from("students").update(updatePayload).eq("id", id);
    if (__res.error) { console.error("Supabase Update Error:", __res.error); alert("فشل تحديث بيانات الطالب في قاعدة البيانات: " + __res.error.message); }
  };

  const deleteStudent = async (id: number) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    const __res = await supabase.from("students").delete().eq("id", id); if (__res.error) { console.error("Supabase Delete Error:", __res.error); alert("فشل الحذف: " + __res.error.message); }
  };

  const addSheikh = (sheikhData: Omit<Sheikh, "id">): Sheikh => {
    const tempId = Date.now();
    const newSheikh: Sheikh = { ...sheikhData, id: tempId, active: sheikhData.active ?? true };
    setSheikhs(prev => [...prev, newSheikh]);
    supabase.from("sheikhs").insert({
      user_id: newSheikh.userId, name: newSheikh.name, civil_id: newSheikh.civilId, phone: newSheikh.phone, email: newSheikh.email, halqa_name: newSheikh.halqaName, bio: newSheikh.bio, active: newSheikh.active
    }).select().single().then(({ data, error }) => {
      if (error) { console.error("Supabase Insert Error:", error); alert("فشل الحفظ في قاعدة البيانات: " + error.message); }
      if (data) setSheikhs(prev => prev.map(s => s.id === tempId ? { ...s, id: data.id } : s));
    });
    return newSheikh;
  };

  const updateSheikh = async (id: number, sheikhData: Partial<Sheikh>) => {
    setSheikhs(prev => prev.map(s => (s.id === id ? { ...s, ...sheikhData } : s)));
    const payload: any = {};
    if (sheikhData.userId !== undefined) payload.user_id = sheikhData.userId;
    if (sheikhData.name !== undefined) payload.name = sheikhData.name;
    if (sheikhData.civilId !== undefined) payload.civil_id = sheikhData.civilId;
    if (sheikhData.phone !== undefined) payload.phone = sheikhData.phone;
    if (sheikhData.email !== undefined) payload.email = sheikhData.email;
    if (sheikhData.halqaName !== undefined) payload.halqa_name = sheikhData.halqaName;
    if (sheikhData.bio !== undefined) payload.bio = sheikhData.bio;
    if (sheikhData.active !== undefined) payload.active = sheikhData.active;
    const __res = await supabase.from("sheikhs").update(payload).eq("id", id); if (__res.error) { console.error("Supabase Update Error:", __res.error); alert("فشل التحديث: " + __res.error.message); }
  };

  const deleteSheikh = async (id: number) => {
    setSheikhs(prev => prev.filter(s => s.id !== id));
    const __res = await supabase.from("sheikhs").delete().eq("id", id); if (__res.error) { console.error("Supabase Delete Error:", __res.error); alert("فشل الحذف: " + __res.error.message); }
  };

  const addAdmin = (adminData: Omit<Admin, "id">): Admin => {
    const tempId = Date.now();
    const newAdmin: Admin = { ...adminData, id: tempId };
    setAdmins(prev => [...prev, newAdmin]);
    supabase.from("admins").insert({
      user_id: newAdmin.userId, name: newAdmin.name, civil_id: newAdmin.civilId, phone: newAdmin.phone, email: newAdmin.email, job_title: newAdmin.jobTitle
    }).select().single().then(({ data, error }) => {
      if (error) { console.error("Supabase Insert Error:", error); alert("فشل الحفظ في قاعدة البيانات: " + error.message); }
      if (data) setAdmins(prev => prev.map(a => a.id === tempId ? { ...a, id: data.id } : a));
    });
    return newAdmin;
  };

  const updateAdmin = async (id: number, adminData: Partial<Admin>) => {
    setAdmins(prev => prev.map(a => (a.id === id ? { ...a, ...adminData } : a)));
    const payload: any = {};
    if (adminData.userId !== undefined) payload.user_id = adminData.userId;
    if (adminData.name !== undefined) payload.name = adminData.name;
    if (adminData.civilId !== undefined) payload.civil_id = adminData.civilId;
    if (adminData.phone !== undefined) payload.phone = adminData.phone;
    if (adminData.email !== undefined) payload.email = adminData.email;
    if (adminData.jobTitle !== undefined) payload.job_title = adminData.jobTitle;
    const __res = await supabase.from("admins").update(payload).eq("id", id); if (__res.error) { console.error("Supabase Update Error:", __res.error); alert("فشل التحديث: " + __res.error.message); }
  };

  const deleteAdmin = async (id: number) => {
    setAdmins(prev => prev.filter(a => a.id !== id));
    const __res = await supabase.from("admins").delete().eq("id", id); if (__res.error) { console.error("Supabase Delete Error:", __res.error); alert("فشل الحذف: " + __res.error.message); }
  };

  const addUser = (userData: User) => {
    setUsers(prev => [...prev, userData]);
  };
  const updateUser = async (id: string, userData: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...userData } : u));
    const __res = await supabase.from('profiles').update({
        username: userData.username,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        role: userData.role,
        status: userData.status,
        permissions: userData.permissions
    }).eq('id', id);
    if (__res.error) { console.error("Supabase Update Error:", __res.error); alert("فشل التحديث: " + __res.error.message); }
  };
  const deleteUser = async (id: string) => {
    // Prevent foreign key constraint errors by deleting from related tables first
    await supabase.from('sheikhs').delete().eq('user_id', id);
    await supabase.from('admins').delete().eq('user_id', id);
    const __res = await supabase.from('profiles').delete().eq('id', id);
    if (__res.error) { 
      console.error("Supabase Delete Error:", __res.error); 
      alert("فشل الحذف: " + __res.error.message); 
      // Refresh to restore if failed
      window.location.reload();
    } else {
      setUsers(prev => prev.filter(u => u.id !== id));
      setSheikhs(prev => prev.filter(s => s.userId !== id));
      setAdmins(prev => prev.filter(a => a.userId !== id));
    }
  };
  const assignStudentToSheikh = async (studentId: number, sheikhId: number | null): Promise<{ success: boolean; error?: string }> => {
    const validSheikhId = (sheikhId && Number(sheikhId) > 0) ? Number(sheikhId) : null;
    setStudents(prev => prev.map(s => (s.id === studentId ? { ...s, sheikhId: validSheikhId } : s)));
    const { error } = await supabase.from("students").update({ sheikh_id: validSheikhId }).eq("id", studentId);
    if (error) {
      console.error("Supabase assignStudentToSheikh Error:", error);
      alert("فشل نقل الطالب إلى الحلقة في قاعدة البيانات: " + error.message);
      // Revert if failed
      const { data } = await supabase.from("students").select("*");
      if (data) {
        setStudents(data.map((s: any) => ({
          id: s.id,
          name: s.name,
          civilId: s.civil_id,
          dob: s.dob,
          age: s.age,
          grade: s.grade,
          nationality: s.nationality || 'كويتي',
          parentName: s.parent_name,
          parentPhone: s.parent_phone,
          parentEmail: s.parent_email,
          sheikhId: s.sheikh_id,
          status: s.status,
          joinDate: s.join_date,
          currentJuz: s.current_juz,
          targetJuz: s.target_juz,
          points: s.points,
          notes: s.notes,
          halqaType: s.halqa_type || ''
        })));
      }
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const saveTrackingRecord = async (record: Omit<TrackingRecord, "id"> & { id?: number }): Promise<TrackingRecord> => {
    const isRealDbId = typeof record.id === 'number' && record.id > 0 && record.id < 1000000000;
    
    // Find if record already exists by real ID or by (student_id, date)
    let targetDbId: number | undefined = isRealDbId ? record.id : undefined;
    if (!targetDbId) {
      const existing = tracking.find(t => t.studentId === record.studentId && t.date === record.date && t.id > 0 && t.id < 1000000000);
      if (existing) {
        targetDbId = existing.id;
      }
    }

    const payload = {
      student_id: record.studentId,
      sheikh_id: (typeof record.sheikhId === 'number' && record.sheikhId > 0) ? record.sheikhId : null,
      date: record.date,
      new_surah: record.newSurah || '',
      new_from: (record.newFrom === '' || record.newFrom === undefined) ? null : Number(record.newFrom),
      new_to: (record.newTo === '' || record.newTo === undefined) ? null : Number(record.newTo),
      rev_surah: record.revSurah || '',
      rev_from: (record.revFrom === '' || record.revFrom === undefined) ? null : Number(record.revFrom),
      rev_to: (record.revTo === '' || record.revTo === undefined) ? null : Number(record.revTo),
      rev_to_surah: record.revToSurah || '',
      rev_to_from: (record.revToFrom === '' || record.revToFrom === undefined) ? null : Number(record.revToFrom),
      rev_to_to: (record.revToTo === '' || record.revToTo === undefined) ? null : Number(record.revToTo),
      big_rev_surah: record.bigRevSurah || null,
      big_rev_from: (record.bigRevFrom === '' || record.bigRevFrom === undefined) ? null : Number(record.bigRevFrom),
      big_rev_to: (record.bigRevTo === '' || record.bigRevTo === undefined) ? null : Number(record.bigRevTo),
      att: record.att || null,
      eval: record.eval || 'ممتاز',
      notes: record.notes || '',
      status: record.status || 'approved',
      read_by_parent: record.readByParent || false
    };

    let savedId = targetDbId;
    if (targetDbId) {
      const { data, error } = await supabase.from("tracking").update(payload).eq("id", targetDbId).select().single();
      if (error) {
        console.error("Supabase Tracking Update Error:", error);
        alert("فشل تحديث سجل المتابعة في قاعدة البيانات: " + error.message);
      } else if (data) {
        savedId = data.id;
      }
    } else {
      const { data, error } = await supabase.from("tracking").insert(payload).select().single();
      if (error) {
        console.error("Supabase Tracking Insert Error:", error);
        alert("فشل إضافة سجل المتابعة إلى قاعدة البيانات: " + error.message);
      } else if (data) {
        savedId = data.id;
      }
    }

    const savedRecord: TrackingRecord = {
      ...(record as any),
      id: savedId || record.id || Date.now()
    };

    setTracking(prev => {
      const idx = prev.findIndex(t => t.id === savedRecord.id || (t.studentId === savedRecord.studentId && t.date === savedRecord.date));
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = savedRecord;
        return copy;
      }
      return [savedRecord, ...prev];
    });

    return savedRecord;
  };

  const saveBatchTrackingRecords = async (records: (Omit<TrackingRecord, "id"> & { id?: number })[]): Promise<{ success: boolean; count: number; error?: string }> => {
    if (!records || records.length === 0) {
      return { success: true, count: 0 };
    }

    try {
      let successCount = 0;
      let lastError: string | undefined;

      for (const record of records) {
        const isRealDbId = typeof record.id === 'number' && record.id > 0 && record.id < 1000000000;
        let targetDbId: number | undefined = isRealDbId ? record.id : undefined;

        if (!targetDbId) {
          const existing = tracking.find(t => t.studentId === record.studentId && t.date === record.date && t.id > 0 && t.id < 1000000000);
          if (existing) {
            targetDbId = existing.id;
          }
        }

        const payload = {
          student_id: record.studentId,
          sheikh_id: (typeof record.sheikhId === 'number' && record.sheikhId > 0) ? record.sheikhId : null,
          date: record.date,
          new_surah: record.newSurah || '',
          new_from: (record.newFrom === '' || record.newFrom === undefined) ? null : Number(record.newFrom),
          new_to: (record.newTo === '' || record.newTo === undefined) ? null : Number(record.newTo),
          rev_surah: record.revSurah || '',
          rev_from: (record.revFrom === '' || record.revFrom === undefined) ? null : Number(record.revFrom),
          rev_to: (record.revTo === '' || record.revTo === undefined) ? null : Number(record.revTo),
          rev_to_surah: record.revToSurah || '',
          rev_to_from: (record.revToFrom === '' || record.revToFrom === undefined) ? null : Number(record.revToFrom),
          rev_to_to: (record.revToTo === '' || record.revToTo === undefined) ? null : Number(record.revToTo),
          big_rev_surah: record.bigRevSurah || null,
          big_rev_from: (record.bigRevFrom === '' || record.bigRevFrom === undefined) ? null : Number(record.bigRevFrom),
          big_rev_to: (record.bigRevTo === '' || record.bigRevTo === undefined) ? null : Number(record.bigRevTo),
          att: record.att || null,
          eval: record.eval || 'ممتاز',
          notes: record.notes || '',
          status: record.status || 'approved',
          read_by_parent: record.readByParent || false
        };

        if (targetDbId) {
          const { error } = await supabase.from("tracking").update(payload).eq("id", targetDbId);
          if (error) {
            console.error("Supabase Batch Update Error:", error);
            lastError = error.message;
          } else {
            successCount++;
          }
        } else {
          const { error } = await supabase.from("tracking").insert(payload);
          if (error) {
            console.error("Supabase Batch Insert Error:", error);
            lastError = error.message;
          } else {
            successCount++;
          }
        }
      }

      // Refresh tracking from database with latest records
      const { data, error: selectErr } = await supabase.from("tracking").select("*").order("id", { ascending: false });
      if (data && !selectErr) {
        setTracking(data.map((t: any) => ({
          id: t.id,
          studentId: t.student_id,
          sheikhId: t.sheikh_id,
          date: t.date,
          newSurah: t.new_surah,
          newFrom: t.new_from,
          newTo: t.new_to,
          revSurah: t.rev_surah,
          revFrom: t.rev_from,
          revTo: t.rev_to,
          revToSurah: t.rev_to_surah,
          revToFrom: t.rev_to_from,
          revToTo: t.rev_to_to,
          bigRevSurah: t.big_rev_surah,
          bigRevFrom: t.big_rev_from,
          bigRevTo: t.big_rev_to,
          att: t.att,
          eval: t.eval,
          notes: t.notes,
          status: t.status,
          readByParent: t.read_by_parent
        })));
      }

      if (lastError) {
        return { success: false, count: successCount, error: lastError };
      }
      return { success: true, count: successCount };
    } catch (err: any) {
      console.error("saveBatchTrackingRecords exception:", err);
      return { success: false, count: 0, error: err.message || 'Unknown error' };
    }
  };

  const deleteTrackingRecord = async (id: number) => {
    setTracking(prev => prev.filter(t => t.id !== id));
    const __res = await supabase.from("tracking").delete().eq("id", id); if (__res.error) { console.error("Supabase Delete Error:", __res.error); alert("فشل الحذف: " + __res.error.message); }
  };

  const addNote = (noteData: Omit<Note, "id">) => {
    const tempId = Date.now();
    const newNote: Note = { ...noteData, id: tempId, readByParent: false };
    setNotes(prev => [newNote, ...prev]);
    supabase.from("notes").insert({
      student_id: newNote.studentId, sheikh_id: newNote.sheikhId, date: newNote.date, text: newNote.text, priority: newNote.priority, read_by_parent: newNote.readByParent
    }).select().single().then(({ data, error }) => {
      if (error) { console.error("Supabase Insert Error:", error); alert("فشل الحفظ في قاعدة البيانات: " + error.message); }
      if (data) setNotes(prev => prev.map(n => n.id === tempId ? { ...n, id: data.id } : n));
    });
  };

  const markNotesAsRead = async (studentIds: number[]) => {
    setNotes(prev => prev.map(n => studentIds.includes(n.studentId) ? { ...n, readByParent: true } : n));
    setTracking(prev => prev.map(t => studentIds.includes(t.studentId) ? { ...t, readByParent: true } : t));
    
    await Promise.all([
      supabase.from("notes").update({ read_by_parent: true }).in("student_id", studentIds),
      supabase.from("tracking").update({ read_by_parent: true }).in("student_id", studentIds)
    ]);
  };

  const addExam = (examData: Omit<Exam, "id">): Exam => {
    const tempId = Date.now();
    const newExam: Exam = { ...examData, id: tempId, certificateGenerated: true };
    setExams(prev => [newExam, ...prev]);
    supabase.from("exams").insert({
      student_id: newExam.studentId, date: newExam.date, type: newExam.type, part_or_surah: newExam.partOrSurah, grade: newExam.grade, score: newExam.score, examiner: newExam.examiner, notes: newExam.notes
    }).select().single().then(({ data, error }) => {
      if (error) { console.error("Supabase Insert Error:", error); alert("فشل الحفظ في قاعدة البيانات: " + error.message); }
      if (data) setExams(prev => prev.map(e => e.id === tempId ? { ...e, id: data.id } : e));
    });
    return newExam;
  };

  const addBadge = (badgeData: Omit<Badge, "id">) => {
    const tempId = `b-${Date.now()}`;
    const newBadge: Badge = { ...badgeData, id: tempId };
    setBadges(prev => [...prev, newBadge]);
    supabase.from("badges").insert({
      student_id: newBadge.studentId, name: newBadge.name, icon: newBadge.icon, description: newBadge.description, date_earned: newBadge.dateEarned
    }).select().single().then(({ data, error }) => {
      if (error) { console.error("Supabase Insert Error:", error); alert("فشل الحفظ في قاعدة البيانات: " + error.message); }
      if (data) setBadges(prev => prev.map(b => b.id === tempId ? { ...b, id: data.id } : b));
    });
  };

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

  const addNationality = async (name: string) => {
    if (!name.trim() || nationalities.includes(name.trim())) return;
    const trimmed = name.trim();
    setNationalities(prev => [...prev, trimmed]);
    const { error } = await supabase.from('nationalities').insert({ name: trimmed });
    if (error) console.error("Error adding nationality:", error);
  };

  const updateNationality = async (oldName: string, newName: string) => {
    if (!newName.trim() || nationalities.includes(newName.trim())) return;
    const trimmed = newName.trim();
    setNationalities(prev => prev.map(t => t === oldName ? trimmed : t));
    const { error } = await supabase.from('nationalities').update({ name: trimmed }).eq('name', oldName);
    if (error) console.error("Error updating nationality:", error);
  };

  const deleteNationality = async (name: string) => {
    setNationalities(prev => prev.filter(t => t !== name));
    const { error } = await supabase.from('nationalities').delete().eq('name', name);
    if (error) console.error("Error deleting nationality:", error);
  };

  const archiveAndResetCurrentData = async () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    const archivedBy = currentUser?.name || currentUser?.email || 'المدير العام';

    const newArchive: ArchiveRecord = {
      id: `archive-${Date.now()}`,
      date: dateStr,
      time: timeStr,
      archivedBy,
      students: [...students],
      tracking: [...tracking],
      centerInfo: { ...centerInfo },
      sheikhs: [...sheikhs]
    };

    // Save archive to Supabase database
    try {
      await supabase.from('archives').insert({
        id: newArchive.id,
        archive_date: newArchive.date,
        archive_time: newArchive.time,
        archived_by: newArchive.archivedBy,
        payload: {
          students: newArchive.students,
          tracking: newArchive.tracking,
          centerInfo: newArchive.centerInfo,
          sheikhs: newArchive.sheikhs
        }
      });
    } catch (err) {
      console.error("Error saving archive to database:", err);
    }

    setArchives(prev => [newArchive, ...prev]);

    // Clear local students and tracking
    setStudents([]);
    setTracking([]);

    // Clear from database
    try {
      await supabase.from('tracking').delete().neq('id', 0);
      await supabase.from('students').delete().neq('id', 0);
    } catch (err) {
      console.error("Error clearing database for new cycle:", err);
    }
  };

  const deleteArchive = async (id: string) => {
    setArchives(prev => prev.filter(a => a.id !== id));
    try {
      await supabase.from('archives').delete().eq('id', id);
    } catch (err) {
      console.error("Error deleting archive from database:", err);
    }
  };

  const exportDataJSON = () => { /* legacy */ };
  const importDataJSON = (jsonString: string): boolean => { return false; /* legacy */ };
  const resetToDemoData = () => { /* legacy */ };

  const extractDOBFromCivilID = (civilId: string): string | null => {
    if (civilId && civilId.length >= 7) {
      const centuryDigit = civilId.charAt(0);
      let yearPrefix = "";
      if (centuryDigit === "2") yearPrefix = "19";
      else if (centuryDigit === "3") yearPrefix = "20";
      if (yearPrefix) {
        const yy = civilId.substring(1, 3);
        const mm = civilId.substring(3, 5);
        const dd = civilId.substring(5, 7);
        const dobString = `${yearPrefix}${yy}-${mm}-${dd}`;
        if (!isNaN(Date.parse(dobString))) return dobString;
      }
    }
    return null;
  };

  const refreshData = async () => {
    await fetchInitialData();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser, users, centerInfo, sheikhs, admins, students, tracking, notes, exams, badges,
        isDarkMode, activeScreen, setActiveScreen, toggleDarkMode, login, switchRole, logout,
        updateCenterInfo, addStudent, updateStudent, deleteStudent, addSheikh, updateSheikh, deleteSheikh,
        addAdmin, updateAdmin, deleteAdmin, addUser, updateUser, deleteUser, assignStudentToSheikh, refreshData, saveTrackingRecord,
        saveBatchTrackingRecords, deleteTrackingRecord, addNote, markNotesAsRead, addExam, addBadge,
        halqaTypes,
        addHalqaType,
        updateHalqaType,
        deleteHalqaType,
        nationalities,
        addNationality,
        updateNationality,
        deleteNationality,
        archives,
        archiveAndResetCurrentData,
        deleteArchive,
        exportDataJSON, importDataJSON, resetToDemoData, extractDOBFromCivilID, currentSheikh
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};
