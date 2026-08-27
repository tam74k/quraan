import { CenterInfo, User, Sheikh, Admin, Student, TrackingRecord, Note, Exam, Badge } from '../types';

export const INITIAL_CENTER_INFO: CenterInfo = {
  name: 'مركز السعد لتحفيظ القرآن الكريم',
  address: 'دولة الكويت - العاصمة - ضاحية عبدالله السالم',
  phone: '90000000 - 22554433',
  email: 'info@alsaad-quran.kw',
  logo: '',
  hijriYear: '1446 هـ',
  academicSeason: 'الفصل الدراسي الثاني',
  managerName: 'فضيلة الشيخ د. سعد بن عبدالله الكندري'
};

export const INITIAL_USERS: User[] = [
  { id: 'u-admin', email: 'admin@test.com', role: 'admin', name: 'مدير النظام (أ. سعد العتيبي)', phone: '90000000' },
  { id: 'u-sheikh1', email: 'sheikh@test.com', role: 'sheikh', name: 'فضيلة الشيخ أحمد العلي', phone: '90000001' },
  { id: 'u-sheikh2', email: 'mahmoud@test.com', role: 'sheikh', name: 'فضيلة الشيخ محمود المصري', phone: '90000002' },
  { id: 'u-sheikh3', email: 'othman@test.com', role: 'sheikh', name: 'فضيلة الشيخ عثمان الخميس', phone: '90000005' },
  { id: 'u-parent1', email: 'parent@test.com', role: 'parent', name: 'ولي الأمر (محمد الراشد)', phone: '99991111' },
  { id: 'u-data', email: 'data@test.com', role: 'data_entry', name: 'أ. فهد الشمري (مدخل بيانات)', phone: '90000004' }
];

export const INITIAL_SHEIKHS: Sheikh[] = [
  {
    id: 1,
    userId: 'u-sheikh1',
    name: 'الشيخ أحمد العلي',
    civilId: '290010100001',
    phone: '90000001',
    email: 'sheikh@test.com',
    active: true,
    halqaName: 'حلقة الإمام نافع المدني',
    bio: 'مجاز بالقراءات العشر الصغرى - خبرة 12 عاماً في تعليم القرآن الكريم'
  },
  {
    id: 2,
    userId: 'u-sheikh2',
    name: 'الشيخ محمود المصري',
    civilId: '285010100002',
    phone: '90000002',
    email: 'mahmoud@test.com',
    active: true,
    halqaName: 'حلقة الإمام عاصم الكوفي',
    bio: 'مجاز برواية حفص وشعبة - المشرف على الحلقات المتقدمة'
  },
  {
    id: 3,
    userId: 'u-sheikh3',
    name: 'الشيخ عثمان الخميس',
    civilId: '275010100003',
    phone: '90000005',
    email: 'othman@test.com',
    active: true,
    halqaName: 'حلقة الإمام الشاطبي',
    bio: 'أستاذ القراءات والتجويد والمشرف التربوي'
  }
];

export const INITIAL_ADMINS: Admin[] = [
  { id: 1, civilId: '280010100010', name: 'أ. سعد العتيبي', phone: '90000000', email: 'admin@test.com', jobTitle: 'المدير العام' },
  { id: 2, civilId: '292010100020', name: 'أ. فهد الشمري', phone: '90000004', email: 'data@test.com', jobTitle: 'مسؤول شؤون الطلاب ومدخل بيانات' },
  { id: 3, civilId: '288010100030', name: 'أ. جاسم الدوسري', phone: '90000008', email: 'jasim@test.com', jobTitle: 'المشرف الإداري' }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 1,
    name: 'عبدالرحمن محمد الراشد',
    civilId: '312051200123',
    dob: '2012-05-12',
    age: 12,
    grade: 'المتوسط',
    parentName: 'محمد الراشد',
    parentPhone: '99991111',
    parentEmail: 'parent@test.com',
    sheikhId: 1,
    status: 'Active',
    joinDate: '2023-09-10',
    notes: 'طالب متميز وذو صوت ندي متقن لأحكام التجويد',
    targetJuz: 10,
    currentJuz: 6,
    totalAyahsMemorized: 1150,
    points: 480
  },
  {
    id: 2,
    name: 'عمر محمد الراشد',
    civilId: '315082000456',
    dob: '2015-08-20',
    age: 9,
    grade: 'الابتدائي',
    parentName: 'محمد الراشد',
    parentPhone: '99991111',
    parentEmail: 'parent@test.com',
    sheikhId: 1,
    status: 'Active',
    joinDate: '2023-10-01',
    notes: 'يحفظ جزء عم وتبارك، حريص على الحضور',
    targetJuz: 3,
    currentJuz: 2,
    totalAyahsMemorized: 564,
    points: 320
  },
  {
    id: 3,
    name: 'زياد طارق المطيري',
    civilId: '309031500789',
    dob: '2009-03-15',
    age: 15,
    grade: 'الثانوي',
    parentName: 'طارق المطيري',
    parentPhone: '99992222',
    parentEmail: 'tariq@test.com',
    sheikhId: 2,
    status: 'Active',
    joinDate: '2023-08-15',
    notes: 'يستعد لاختبار الأجزاء العشرة الأولى',
    targetJuz: 15,
    currentJuz: 12,
    totalAyahsMemorized: 2200,
    points: 620
  },
  {
    id: 4,
    name: 'يوسف إبراهيم الكندري',
    civilId: '311091000999',
    dob: '2011-09-10',
    age: 13,
    grade: 'المتوسط',
    parentName: 'إبراهيم الكندري',
    parentPhone: '99993333',
    parentEmail: 'ibrahim@test.com',
    sheikhId: 1,
    status: 'Active',
    joinDate: '2023-11-05',
    notes: 'متابع جيد وملتزم بالورد اليومي',
    targetJuz: 5,
    currentJuz: 4,
    totalAyahsMemorized: 840,
    points: 390
  },
  {
    id: 5,
    name: 'حمزة خالد السبيعي',
    civilId: '314010500111',
    dob: '2014-01-05',
    age: 10,
    grade: 'الابتدائي',
    parentName: 'خالد السبيعي',
    parentPhone: '99994444',
    parentEmail: 'khaled@test.com',
    sheikhId: 2,
    status: 'Active',
    joinDate: '2024-01-15',
    notes: 'يحتاج تركيز في مخارج الحروف والتفخيم والترقيق',
    targetJuz: 3,
    currentJuz: 2,
    totalAyahsMemorized: 420,
    points: 270
  },
  {
    id: 6,
    name: 'سعود عبدالعزيز الهاجري',
    civilId: '308112200333',
    dob: '2008-11-22',
    age: 16,
    grade: 'الثانوي',
    parentName: 'عبدالعزيز الهاجري',
    parentPhone: '99995555',
    parentEmail: 'abdulaziz@test.com',
    sheikhId: null, // Unassigned for testing grouping
    status: 'Active',
    joinDate: '2024-02-01',
    notes: 'طالب مستجد ينتظر التسكين في الحلقة المناسبة',
    targetJuz: 5,
    currentJuz: 1,
    totalAyahsMemorized: 150,
    points: 100
  }
];

export const INITIAL_TRACKING: TrackingRecord[] = [
  {
    id: 1,
    studentId: 1,
    date: '2026-08-26',
    newSurah: 'البقرة',
    newFrom: 250,
    newTo: 255,
    revSurah: 'الفاتحة',
    revFrom: 1,
    revTo: 7,
    bigRevSurah: 'آل عمران',
    bigRevFrom: 1,
    bigRevTo: 30,
    att: 'حضوري',
    eval: 'ممتاز',
    tajweedEval: 'متقن',
    notes: 'تسميع رائع وصوت خاشع ومخارج منضبطة جداً بارك الله فيه.',
    status: 'approved',
    readByParent: false,
    sheikhId: 1
  },
  {
    id: 2,
    studentId: 1,
    date: '2026-08-25',
    newSurah: 'البقرة',
    newFrom: 240,
    newTo: 249,
    revSurah: 'البقرة',
    revFrom: 200,
    revTo: 239,
    att: 'حضوري',
    eval: 'ممتاز',
    tajweedEval: 'متقن',
    notes: 'إتقان متواصل، تم ضبط أحكام الإخفاء الشفوي.',
    status: 'approved',
    readByParent: true,
    sheikhId: 1
  },
  {
    id: 3,
    studentId: 1,
    date: '2026-08-24',
    newSurah: 'البقرة',
    newFrom: 230,
    newTo: 239,
    revSurah: 'البقرة',
    revFrom: 150,
    revTo: 199,
    att: 'اونلاين',
    eval: 'جيد جدا',
    tajweedEval: 'جيد',
    notes: 'تم التسميع عبر البث المباشر، يرجى تكرار المراجعة.',
    status: 'approved',
    readByParent: true,
    sheikhId: 1
  },
  {
    id: 4,
    studentId: 2,
    date: '2026-08-26',
    newSurah: 'النبأ',
    newFrom: 1,
    newTo: 20,
    revSurah: 'الناس',
    revFrom: 1,
    revTo: 6,
    att: 'حضوري',
    eval: 'جيد جدا',
    tajweedEval: 'جيد',
    notes: 'بداية مباركة في سورة النبأ، يرجى الاستماع للتلاوة المرتلة في البيت.',
    status: 'approved',
    readByParent: false,
    sheikhId: 1
  },
  {
    id: 5,
    studentId: 2,
    date: '2026-08-25',
    newSurah: 'النازعات',
    newFrom: 30,
    newTo: 46,
    revSurah: 'الفلق',
    revFrom: 1,
    revTo: 5,
    att: 'حضوري',
    eval: 'ممتاز',
    tajweedEval: 'متقن',
    notes: 'ختم سورة النازعات بإتقان تام ما شاء الله.',
    status: 'approved',
    readByParent: true,
    sheikhId: 1
  },
  {
    id: 6,
    studentId: 3,
    date: '2026-08-26',
    newSurah: 'الكهف',
    newFrom: 1,
    newTo: 25,
    revSurah: 'مريم',
    revFrom: 1,
    revTo: 40,
    att: 'حضوري',
    eval: 'ممتاز',
    tajweedEval: 'متقن',
    notes: 'إتقان رفيع للآيات ومراعاة الوقف والابتداء.',
    status: 'approved',
    readByParent: true,
    sheikhId: 2
  },
  {
    id: 7,
    studentId: 4,
    date: '2026-08-26',
    newSurah: 'يس',
    newFrom: 1,
    newTo: 30,
    revSurah: 'الصافات',
    revFrom: 1,
    revTo: 50,
    att: 'حضوري',
    eval: 'جيد جدا',
    tajweedEval: 'جيد',
    notes: 'حفظ متقن مع بعض التردد في الآيات الأخيرة.',
    status: 'approved',
    readByParent: true,
    sheikhId: 1
  }
];

export const INITIAL_NOTES: Note[] = [
  {
    id: 1,
    studentId: 1,
    sheikhId: 1,
    date: '2026-08-26',
    text: 'يسرنا إبلاغكم بأن الطالب عبدالرحمن قد أتم حفظ الجزء الخامس بنجاح وترشح لجائزة القارئ المتميز لهذا الشهر.',
    priority: 'تشجيع',
    readByParent: false
  },
  {
    id: 2,
    studentId: 2,
    sheikhId: 1,
    date: '2026-08-25',
    text: 'الرجاء متابعة مراجعة سورة النبأ مع الطالب في المنزل لترسيخ الحفظ بصوت القارئ المنشاوي.',
    priority: 'هام',
    readByParent: false
  },
  {
    id: 3,
    studentId: 3,
    sheikhId: 2,
    date: '2026-08-20',
    text: 'موعد اختبار الأجزاء العشرة القادم يوم الخميس القادم بإذن الله.',
    priority: 'هام',
    readByParent: true
  }
];

export const INITIAL_EXAMS: Exam[] = [
  {
    id: 1,
    studentId: 1,
    date: '2026-08-15',
    type: 'اختبار 5 أجزاء',
    partOrSurah: 'من الجزء 1 إلى الجزء 5',
    grade: 'ممتاز مرتفع',
    score: 98,
    examiner: 'فضيلة الشيخ أحمد العلي',
    notes: 'إتقان فائق وأحكام تجويد سليمة 100%',
    certificateGenerated: true
  },
  {
    id: 2,
    studentId: 3,
    date: '2026-07-28',
    type: 'اختبار 10 أجزاء',
    partOrSurah: 'من الجزء 1 إلى الجزء 10',
    grade: 'ممتاز',
    score: 95,
    examiner: 'فضيلة الشيخ محمود المصري',
    notes: 'تلاوة متقنة وثبات عالي في المتشابهات',
    certificateGenerated: true
  }
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'b1',
    name: 'قارئ الأسبوع',
    icon: '👑',
    description: 'تم الحصول عليه لتحقيق أعلى نسبة حفظ ومراجعة متواصلة',
    studentId: 1,
    dateEarned: '2026-08-20'
  },
  {
    id: 'b2',
    name: 'المواظب الفضي',
    icon: '⭐',
    description: 'حضور بدون أي غياب لمدة 30 يوماً متتالية',
    studentId: 1,
    dateEarned: '2026-08-10'
  },
  {
    id: 'b3',
    name: 'نجم التجويد',
    icon: '🌟',
    description: 'إتقان مخارج الحروف وأحكام النون والميم والمدود',
    studentId: 2,
    dateEarned: '2026-08-18'
  }
];
