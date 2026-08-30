export type UserRole = 'admin' | 'sheikh' | 'parent' | 'data_entry';

export interface UserPermissions {
  manage_students?: boolean;
  manage_sheikhs?: boolean;
  manage_admins?: boolean;
  daily_recitation?: boolean;
  manage_exams?: boolean;
  print_reports?: boolean;
  honor_board?: boolean;
  center_settings?: boolean;
  manage_accounts?: boolean;
}

export interface User {
  id: string;
  username?: string;
  email: string;
  role: UserRole;
  name: string;
  phone?: string;
  avatar?: string;
  status?: 'active' | 'suspended';
  permissions?: UserPermissions;
}

export interface CenterInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  logo: string;
  hijriYear: string;
  academicSeason: string;
  managerName: string;
}

export interface Sheikh {
  id: number;
  userId: string | null;
  name: string;
  civilId: string;
  phone: string;
  email?: string;
  active: boolean;
  halqaName: string;
  bio?: string;
  avatar?: string;
}

export interface Admin {
  userId?: string | null;
  id: number;
  civilId: string;
  name: string;
  phone: string;
  email?: string;
  jobTitle: string;
}

export interface Student {
  id: number;
  name: string;
  civilId: string;
  dob?: string;
  age: number;
  grade: 'التمهيدي' | 'الابتدائي' | 'المتوسط' | 'الثانوي' | 'الجامعي' | 'عام';
  parentName?: string;
  parentPhone: string;
  parentEmail?: string;
  sheikhId: number | null;
  status: 'Active' | 'Inactive';
  joinDate: string;
  notes?: string;
  targetJuz?: number;
  currentJuz?: number;
  totalAyahsMemorized?: number;
  points?: number;
  avatar?: string;
}

export interface TrackingRecord {
  id: number;
  studentId: number;
  date: string;
  // الحفظ الجديد
  newSurah: string;
  newFrom: number | null;
  newTo: number | null;
  // المراجعة الصغرى (القريبة)
  revSurah: string;
  revFrom: number | null;
  revTo: number | null;
  // المراجعة الكبرى (الماضي)
  bigRevSurah?: string;
  bigRevFrom?: number | null;
  bigRevTo?: number | null;
  // الحضور والتقييم
  att: 'حضوري' | 'اونلاين' | 'غائب' | 'مستأذن' | '';
  eval: 'ممتاز' | 'جيد جدا' | 'جيد' | 'مقبول' | 'ضعيف' | 'لم يحفظ' | '';
  tajweedEval?: 'متقن' | 'جيد' | 'يحتاج مراجعة أحكام' | '';
  notes?: string;
  status: 'draft' | 'approved';
  readByParent: boolean;
  sheikhId?: number;
}

export interface Note {
  id: number;
  studentId: number;
  sheikhId?: number;
  date: string;
  text: string;
  priority?: 'عادي' | 'هام' | 'تنبيه غياب' | 'تشجيع';
  readByParent: boolean;
}

export interface QuranSurah {
  id: number;
  name: string;
  englishName: string;
  revelationType: 'مكية' | 'مدنية';
  ayahCount: number;
  startJuz: number;
  pageNumber: number;
}

export interface Exam {
  id: number;
  studentId: number;
  date: string;
  type: 'اختبار جزء' | 'اختبار 3 أجزاء' | 'اختبار 5 أجزاء' | 'اختبار 10 أجزاء' | 'اختبار نصف القرآن' | 'اختبار القرآن كاملاً' | 'اختبار سورة';
  partOrSurah: string;
  grade: 'ممتاز مرتفع' | 'ممتاز' | 'جيد جداً' | 'جيد' | 'إعادة';
  score: number; // out of 100
  examiner: string;
  notes?: string;
  certificateGenerated?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  studentId: number;
  dateEarned: string;
}
