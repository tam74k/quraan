import React, { createContext, useContext, useState, useEffect } from 'react';
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
import {
  INITIAL_CENTER_INFO,
  INITIAL_USERS,
  INITIAL_SHEIKHS,
  INITIAL_ADMINS,
  INITIAL_STUDENTS,
  INITIAL_TRACKING,
  INITIAL_NOTES,
  INITIAL_EXAMS,
  INITIAL_BADGES
} from '../data/initialMockData';

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
  login: (email: string) => boolean;
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

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CENTER: 'quran_center_info_v2',
  USERS: 'quran_users_v2',
  SHEIKHS: 'quran_sheikhs_v2',
  ADMINS: 'quran_admins_v2',
  STUDENTS: 'quran_students_v2',
  TRACKING: 'quran_tracking_v2',
  NOTES: 'quran_notes_v2',
  EXAMS: 'quran_exams_v2',
  BADGES: 'quran_badges_v2',
  AUTH: 'quran_auth_user_v2',
  THEME: 'quran_theme_dark_v2'
};

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error('Error loading storage', key, e);
    return fallback;
  }
}

function saveStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving storage', key, e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [centerInfo, setCenterInfo] = useState<CenterInfo>(() => loadStorage(STORAGE_KEYS.CENTER, INITIAL_CENTER_INFO));
  const [users, setUsers] = useState<User[]>(() => loadStorage(STORAGE_KEYS.USERS, INITIAL_USERS));
  const [sheikhs, setSheikhs] = useState<Sheikh[]>(() => loadStorage(STORAGE_KEYS.SHEIKHS, INITIAL_SHEIKHS));
  const [admins, setAdmins] = useState<Admin[]>(() => loadStorage(STORAGE_KEYS.ADMINS, INITIAL_ADMINS));
  const [students, setStudents] = useState<Student[]>(() => loadStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS));
  const [tracking, setTracking] = useState<TrackingRecord[]>(() => loadStorage(STORAGE_KEYS.TRACKING, INITIAL_TRACKING));
  const [notes, setNotes] = useState<Note[]>(() => loadStorage(STORAGE_KEYS.NOTES, INITIAL_NOTES));
  const [exams, setExams] = useState<Exam[]>(() => loadStorage(STORAGE_KEYS.EXAMS, INITIAL_EXAMS));
  const [badges, setBadges] = useState<Badge[]>(() => loadStorage(STORAGE_KEYS.BADGES, INITIAL_BADGES));
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadStorage(STORAGE_KEYS.AUTH, INITIAL_USERS[0]));
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => loadStorage(STORAGE_KEYS.THEME, false));
  const [activeScreen, setActiveScreen] = useState<string>('dashboard');

  // Sync to local storage
  useEffect(() => saveStorage(STORAGE_KEYS.CENTER, centerInfo), [centerInfo]);
  useEffect(() => saveStorage(STORAGE_KEYS.USERS, users), [users]);
  useEffect(() => saveStorage(STORAGE_KEYS.SHEIKHS, sheikhs), [sheikhs]);
  useEffect(() => saveStorage(STORAGE_KEYS.ADMINS, admins), [admins]);
  useEffect(() => saveStorage(STORAGE_KEYS.STUDENTS, students), [students]);
  useEffect(() => saveStorage(STORAGE_KEYS.TRACKING, tracking), [tracking]);
  useEffect(() => saveStorage(STORAGE_KEYS.NOTES, notes), [notes]);
  useEffect(() => saveStorage(STORAGE_KEYS.EXAMS, exams), [exams]);
  useEffect(() => saveStorage(STORAGE_KEYS.BADGES, badges), [badges]);
  useEffect(() => saveStorage(STORAGE_KEYS.AUTH, currentUser), [currentUser]);
  useEffect(() => {
    saveStorage(STORAGE_KEYS.THEME, isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // Authentication Helpers
  const login = (email: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (user) {
      setCurrentUser(user);
      if (user.role === 'admin' || user.role === 'data_entry') setActiveScreen('dashboard');
      else if (user.role === 'sheikh') setActiveScreen('daily-halqa');
      else if (user.role === 'parent') setActiveScreen('parent-kids');
      return true;
    }
    return false;
  };

  const switchRole = (role: UserRole) => {
    const sampleUser = users.find(u => u.role === role) || {
      id: `u-${role}`,
      email: `${role}@test.com`,
      role: role,
      name: role === 'admin' ? 'المدير العام' : role === 'sheikh' ? 'الشيخ أحمد' : role === 'parent' ? 'ولي الأمر' : 'مدخل البيانات'
    };
    setCurrentUser(sampleUser);
    if (role === 'admin' || role === 'data_entry') setActiveScreen('dashboard');
    else if (role === 'sheikh') setActiveScreen('daily-halqa');
    else if (role === 'parent') setActiveScreen('parent-kids');
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Find Current Sheikh object if logged-in user is a sheikh
  const currentSheikh = currentUser && currentUser.role === 'sheikh'
    ? sheikhs.find(s => s.userId === currentUser.id || s.email === currentUser.email) || sheikhs[0]
    : null;

  // Center Info CRUD
  const updateCenterInfo = (info: Partial<CenterInfo>) => {
    setCenterInfo(prev => ({ ...prev, ...info }));
  };

  // Students CRUD
  const addStudent = (studentData: Omit<Student, 'id'>): Student => {
    const newStudent: Student = {
      ...studentData,
      id: Date.now(),
      joinDate: studentData.joinDate || new Date().toISOString().split('T')[0],
      status: studentData.status || 'Active',
      points: studentData.points || 0,
      totalAyahsMemorized: studentData.totalAyahsMemorized || 0
    };
    setStudents(prev => [newStudent, ...prev]);
    return newStudent;
  };

  const updateStudent = (id: number, studentData: Partial<Student>) => {
    setStudents(prev => prev.map(s => (s.id === id ? { ...s, ...studentData } : s)));
  };

  const deleteStudent = (id: number) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  // Sheikhs CRUD
  const addSheikh = (sheikhData: Omit<Sheikh, 'id'>): Sheikh => {
    const newSheikh: Sheikh = {
      ...sheikhData,
      id: Date.now(),
      active: sheikhData.active ?? true
    };
    setSheikhs(prev => [...prev, newSheikh]);
    return newSheikh;
  };

  const updateSheikh = (id: number, sheikhData: Partial<Sheikh>) => {
    setSheikhs(prev => prev.map(s => (s.id === id ? { ...s, ...sheikhData } : s)));
  };

  const deleteSheikh = (id: number) => {
    setSheikhs(prev => prev.filter(s => s.id !== id));
  };

  // Admins CRUD
  const addAdmin = (adminData: Omit<Admin, 'id'>): Admin => {
    const newAdmin: Admin = {
      ...adminData,
      id: Date.now()
    };
    setAdmins(prev => [...prev, newAdmin]);
    return newAdmin;
  };

  const updateAdmin = (id: number, adminData: Partial<Admin>) => {
    setAdmins(prev => prev.map(a => (a.id === id ? { ...a, ...adminData } : a)));
  };

  const deleteAdmin = (id: number) => {
    setAdmins(prev => prev.filter(a => a.id !== id));
  };

  // User Accounts
  const addUser = (userData: User) => {
    setUsers(prev => [...prev, userData]);
  };

  // Halqa Assignment
  const assignStudentToSheikh = (studentId: number, sheikhId: number | null) => {
    setStudents(prev => prev.map(s => (s.id === studentId ? { ...s, sheikhId } : s)));
  };

  // Tracking Recitation Records
  const saveTrackingRecord = (record: Omit<TrackingRecord, 'id'> & { id?: number }): TrackingRecord => {
    let saved: TrackingRecord;
    if (record.id) {
      saved = record as TrackingRecord;
      setTracking(prev => prev.map(t => (t.id === record.id ? saved : t)));
    } else {
      saved = { ...record, id: Date.now() };
      setTracking(prev => [saved, ...prev]);
    }
    return saved;
  };

  const saveBatchTrackingRecords = (records: (Omit<TrackingRecord, 'id'> & { id?: number })[]) => {
    setTracking(prev => {
      const updated = [...prev];
      records.forEach(r => {
        if (r.id) {
          const index = updated.findIndex(t => t.id === r.id);
          if (index !== -1) updated[index] = r as TrackingRecord;
          else updated.unshift(r as TrackingRecord);
        } else {
          updated.unshift({ ...r, id: Date.now() + Math.random() });
        }
      });
      return updated;
    });
  };

  const deleteTrackingRecord = (id: number) => {
    setTracking(prev => prev.filter(t => t.id !== id));
  };

  // Notes
  const addNote = (noteData: Omit<Note, 'id'>) => {
    const newNote: Note = {
      ...noteData,
      id: Date.now(),
      readByParent: false
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const markNotesAsRead = (studentIds: number[]) => {
    setNotes(prev => prev.map(n => studentIds.includes(n.studentId) ? { ...n, readByParent: true } : n));
    setTracking(prev => prev.map(t => studentIds.includes(t.studentId) ? { ...t, readByParent: true } : t));
  };

  // Exams & Badges
  const addExam = (examData: Omit<Exam, 'id'>): Exam => {
    const newExam: Exam = {
      ...examData,
      id: Date.now(),
      certificateGenerated: true
    };
    setExams(prev => [newExam, ...prev]);
    return newExam;
  };

  const addBadge = (badgeData: Omit<Badge, 'id'>) => {
    const newBadge: Badge = {
      ...badgeData,
      id: `b-${Date.now()}`
    };
    setBadges(prev => [...prev, newBadge]);
  };

  // Export / Import / Reset Backup
  const exportDataJSON = () => {
    const payload = {
      exportDate: new Date().toISOString(),
      centerInfo,
      users,
      sheikhs,
      admins,
      students,
      tracking,
      notes,
      exams,
      badges
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quran-center-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.centerInfo) setCenterInfo(data.centerInfo);
      if (data.users) setUsers(data.users);
      if (data.sheikhs) setSheikhs(data.sheikhs);
      if (data.admins) setAdmins(data.admins);
      if (data.students) setStudents(data.students);
      if (data.tracking) setTracking(data.tracking);
      if (data.notes) setNotes(data.notes);
      if (data.exams) setExams(data.exams);
      if (data.badges) setBadges(data.badges);
      return true;
    } catch (e) {
      console.error('Failed to import JSON', e);
      return false;
    }
  };

  const resetToDemoData = () => {
    setCenterInfo(INITIAL_CENTER_INFO);
    setUsers(INITIAL_USERS);
    setSheikhs(INITIAL_SHEIKHS);
    setAdmins(INITIAL_ADMINS);
    setStudents(INITIAL_STUDENTS);
    setTracking(INITIAL_TRACKING);
    setNotes(INITIAL_NOTES);
    setExams(INITIAL_EXAMS);
    setBadges(INITIAL_BADGES);
    setCurrentUser(INITIAL_USERS[0]);
    localStorage.clear();
  };

  // Extract DOB from Civil ID (Kuwait / Arab style: 2/3 YY MM DD...)
  const extractDOBFromCivilID = (civilId: string): string | null => {
    if (civilId && civilId.length >= 7) {
      const centuryDigit = civilId.charAt(0);
      let yearPrefix = '';
      if (centuryDigit === '2') yearPrefix = '19';
      else if (centuryDigit === '3') yearPrefix = '20';
      if (yearPrefix) {
        const yy = civilId.substring(1, 3);
        const mm = civilId.substring(3, 5);
        const dd = civilId.substring(5, 7);
        const dobString = `${yearPrefix}${yy}-${mm}-${dd}`;
        if (!isNaN(Date.parse(dobString))) {
          return dobString;
        }
      }
    }
    return null;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        centerInfo,
        sheikhs,
        admins,
        students,
        tracking,
        notes,
        exams,
        badges,
        isDarkMode,
        activeScreen,
        setActiveScreen,
        toggleDarkMode,
        login,
        switchRole,
        logout,
        updateCenterInfo,
        addStudent,
        updateStudent,
        deleteStudent,
        addSheikh,
        updateSheikh,
        deleteSheikh,
        addAdmin,
        updateAdmin,
        deleteAdmin,
        addUser,
        assignStudentToSheikh,
        saveTrackingRecord,
        saveBatchTrackingRecords,
        deleteTrackingRecord,
        addNote,
        markNotesAsRead,
        addExam,
        addBadge,
        exportDataJSON,
        importDataJSON,
        resetToDemoData,
        extractDOBFromCivilID,
        currentSheikh
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
