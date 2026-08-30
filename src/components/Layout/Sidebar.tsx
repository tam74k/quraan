import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  FileText,
  Users2,
  GraduationCap,
  UserSquare,
  ShieldCheck,
  Award,
  Crown,
  Settings,
  Building,
  BookOpenCheck,
  MessageSquare,
  HeartHandshake,
  FileCheck2,
  UserCog
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentUser, activeScreen, setActiveScreen, students, sheikhs } = useApp();

  if (!currentUser) return null;

  const role = currentUser.role;

  // Admin / Data Entry navigation items
  const adminNavItems = [
    { id: 'dashboard', label: 'اللوحة الرئيسية', icon: LayoutDashboard, badge: null },
    { id: 'daily-halqa', label: 'تسجيل المتابعة اليومية', icon: BookOpenCheck, badge: 'مباشر' },
    { id: 'reports', label: 'التقارير والاستمارات', icon: FileText, badge: 'طباعة' },
    { id: 'groups', label: 'تكوين الحلقات', icon: Users2, badge: `${sheikhs.length} حلقات` },
    { id: 'students', label: 'سجل الطلاب', icon: GraduationCap, badge: `${students.length}` },
    { id: 'sheikhs', label: 'المشايخ والمحفظين', icon: UserSquare, badge: null },
    { id: 'admins', label: 'الكادر الإداري', icon: ShieldCheck, badge: null },
    { id: 'exams', label: 'الاختبارات والشهادات', icon: Award, badge: 'جديد' },
    { id: 'honor', label: 'لوحة الشرف والأوسمة', icon: Crown, badge: null },
    { id: 'settings', label: 'حسابات الدخول', icon: Settings, badge: null },
    { id: 'center_settings', label: 'إعدادات المركز والنسخ', icon: Building, badge: null },
    { id: 'profile-settings', label: 'إعدادات الحساب الشخصي', icon: UserCog, badge: null },
  ];

  // Sheikh navigation items
  const sheikhNavItems = [
    { id: 'daily-halqa', label: 'جدول المتابعة اليومي', icon: BookOpenCheck, badge: 'مباشر' },
    { id: 'sheikh-students', label: 'طلاب حلقتي', icon: GraduationCap, badge: null },
    { id: 'sheikh-notes', label: 'سجل الملاحظات والتواصل', icon: MessageSquare, badge: null },
    { id: 'reports', label: 'استمارات وتقارير الحلقة', icon: FileCheck2, badge: null },
    { id: 'exams', label: 'سجل اختبارات الأجزاء', icon: Award, badge: null },
    { id: 'profile-settings', label: 'إعدادات الحساب الشخصي', icon: UserCog, badge: null }
  ];

  // Parent navigation items
  const parentNavItems = [
    { id: 'parent-kids', label: 'متابعة الأبناء ومصحف الإنجاز', icon: HeartHandshake, badge: null },
    { id: 'honor', label: 'لوحة الشرف والمتميزين', icon: Crown, badge: null },
    { id: 'profile-settings', label: 'إعدادات الحساب الشخصي', icon: UserCog, badge: null }
  ];

  let items = adminNavItems;
  if (role === 'sheikh') items = sheikhNavItems;
  else if (role === 'parent') items = parentNavItems;
  else if (role === 'data_entry') {
    items = [
      { id: 'dashboard', label: 'اللوحة الرئيسية', icon: LayoutDashboard, badge: null },
      { id: 'students', label: 'سجل الطلاب', icon: GraduationCap, badge: `${students.length}` },
      { id: 'groups', label: 'توزيع الحلقات', icon: Users2, badge: null },
      { id: 'reports', label: 'التقارير والكشوفات', icon: FileText, badge: null },
      { id: 'profile-settings', label: 'إعدادات الحساب الشخصي', icon: UserCog, badge: null },
    ];
  }

  return (
    <aside className="no-print w-full md:w-64 shrink-0 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-l border-slate-200 dark:border-slate-800 p-4 transition-colors">
      <div className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-none">
        {items.map((item) => {
          const isActive = activeScreen === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap md:whitespace-normal cursor-pointer ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-emerald-800 text-emerald-100'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};
