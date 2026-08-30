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
  Badge
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
  deleteUser: (id: string) => void;
  assignStudentToSheikh: (studentId: number, sheikhId: number | null) => void;
  saveTrackingRecord: (record: Omit<TrackingRecord, 'id'> & { id?: number }) => TrackingRecord;
  saveBatchTrackingRecords: (records: (Omit<TrackingRecord, 'id'> & { id?: number })[]) => void;
  deleteTrackingRecord: (id: number) => void;
  addNote: (note: Omit<Note, 'id'>) => void;
  markNotesAsRead: (studentIds: number[]) => void;
  addExam: (exam: Omit<Exam, 'id'>) => Exam;
  addBadge: (badge: Omit<Badge, 'id'>) => void;
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
  const [isDarkMode, setIsDarkMode] = useState(false);
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

    return () => {
      authListener.subscription.unsubscribe();
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
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
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
    const newStudent: Student = { ...studentData, id: tempId, joinDate: studentData.joinDate || new Date().toISOString().split("T")[0], status: studentData.status || "Active", points: studentData.points || 0 };
    setStudents(prev => [newStudent, ...prev]);
    supabase.from("students").insert({
      name: newStudent.name, civil_id: newStudent.civilId, dob: newStudent.dob, age: newStudent.age, grade: newStudent.grade, parent_name: newStudent.parentName, parent_phone: newStudent.parentPhone, parent_email: newStudent.parentEmail, sheikh_id: newStudent.sheikhId, status: newStudent.status, join_date: newStudent.joinDate, current_juz: newStudent.currentJuz, target_juz: newStudent.targetJuz, points: newStudent.points, notes: newStudent.notes
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
    if (studentData.dob !== undefined) updatePayload.dob = studentData.dob;
    if (studentData.age !== undefined) updatePayload.age = studentData.age;
    if (studentData.grade !== undefined) updatePayload.grade = studentData.grade;
    if (studentData.parentName !== undefined) updatePayload.parent_name = studentData.parentName;
    if (studentData.parentPhone !== undefined) updatePayload.parent_phone = studentData.parentPhone;
    if (studentData.parentEmail !== undefined) updatePayload.parent_email = studentData.parentEmail;
    if (studentData.sheikhId !== undefined) updatePayload.sheikh_id = studentData.sheikhId;
    if (studentData.status !== undefined) updatePayload.status = studentData.status;
    if (studentData.joinDate !== undefined) updatePayload.join_date = studentData.joinDate;
    if (studentData.currentJuz !== undefined) updatePayload.current_juz = studentData.currentJuz;
    if (studentData.targetJuz !== undefined) updatePayload.target_juz = studentData.targetJuz;
    if (studentData.points !== undefined) updatePayload.points = studentData.points;
    if (studentData.notes !== undefined) updatePayload.notes = studentData.notes;
    const __res = await supabase.from("students").update(updatePayload).eq("id", id); if (__res.error) { console.error("Supabase Update Error:", __res.error); alert("فشل التحديث: " + __res.error.message); }
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
const assignStudentToSheikh = async (studentId: number, sheikhId: number | null) => {
    setStudents(prev => prev.map(s => (s.id === studentId ? { ...s, sheikhId } : s)));
    const __res = await supabase.from("students").update({ sheikh_id: sheikhId }).eq("id", studentId); if (__res.error) { console.error("Supabase Update Error:", __res.error); alert("فشل التحديث: " + __res.error.message); }
  };

  const saveTrackingRecord = (record: Omit<TrackingRecord, "id"> & { id?: number }): TrackingRecord => {
    let saved: TrackingRecord;
    const isUpdate = !!record.id;
    const tempId = record.id || Date.now();
    saved = { ...(record as any), id: tempId };
    
    if (isUpdate) {
      setTracking(prev => prev.map(t => (t.id === record.id ? saved : t)));
    } else {
      setTracking(prev => [saved, ...prev]);
    }

    const payload = {
      student_id: saved.studentId,
      sheikh_id: saved.sheikhId,
      date: saved.date,
      new_surah: saved.newSurah,
      new_from: saved.newFrom,
      new_to: saved.newTo,
      rev_surah: saved.revSurah,
      rev_from: saved.revFrom,
      rev_to: saved.revTo,
      big_rev_surah: saved.bigRevSurah,
      big_rev_from: saved.bigRevFrom,
      big_rev_to: saved.bigRevTo,
      att: saved.att,
      eval: saved.eval,
      notes: saved.notes,
      status: saved.status,
      read_by_parent: saved.readByParent
    };

    if (isUpdate) {
      supabase.from("tracking").update(payload).eq("id", record.id);
    } else {
      supabase.from("tracking").insert(payload).select().single().then(({ data }) => {
        if (data) setTracking(prev => prev.map(t => t.id === tempId ? { ...t, id: data.id } : t));
      });
    }

    return saved;
  };

  const saveBatchTrackingRecords = async (records: (Omit<TrackingRecord, "id"> & { id?: number })[]) => {
    // Optimistic
    setTracking(prev => {
      const updated = [...prev];
      records.forEach(r => {
        if (r.id) {
          const index = updated.findIndex(t => t.id === r.id);
          if (index !== -1) updated[index] = r as TrackingRecord;
          else updated.unshift(r as TrackingRecord);
        } else {
          updated.unshift({ ...r, id: Date.now() + Math.random() } as TrackingRecord);
        }
      });
      return updated;
    });

    for (const record of records) {
      const payload = {
        student_id: record.studentId,
        sheikh_id: record.sheikhId,
        date: record.date,
        new_surah: record.newSurah,
        new_from: record.newFrom,
        new_to: record.newTo,
        rev_surah: record.revSurah,
        rev_from: record.revFrom,
        rev_to: record.revTo,
        big_rev_surah: record.bigRevSurah,
        big_rev_from: record.bigRevFrom,
        big_rev_to: record.bigRevTo,
        att: record.att,
        eval: record.eval,
        notes: record.notes,
        status: record.status,
        read_by_parent: record.readByParent
      };
      if (record.id) {
        const __res = await supabase.from("tracking").update(payload).eq("id", record.id); if (__res.error) { console.error("Supabase Update Error:", __res.error); alert("فشل التحديث: " + __res.error.message); }
      } else {
        await supabase.from("tracking").insert(payload);
      }
    }
    // refresh all tracking after batch
    const { data } = await supabase.from("tracking").select("*");
    if (data) {
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

  return (
    <AppContext.Provider
      value={{
        currentUser, users, centerInfo, sheikhs, admins, students, tracking, notes, exams, badges,
        isDarkMode, activeScreen, setActiveScreen, toggleDarkMode, login, switchRole, logout,
        updateCenterInfo, addStudent, updateStudent, deleteStudent, addSheikh, updateSheikh, deleteSheikh,
        addAdmin, updateAdmin, deleteAdmin, addUser, updateUser, deleteUser, assignStudentToSheikh, saveTrackingRecord,
        saveBatchTrackingRecords, deleteTrackingRecord, addNote, markNotesAsRead, addExam, addBadge,
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
