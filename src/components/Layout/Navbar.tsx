import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Bell,
  Sun,
  Moon,
  LogOut,
  UserCheck,
  ChevronDown,
  Building2,
  Sparkles,
  Shield,
  GraduationCap,
  Users
} from 'lucide-react';

interface NavbarProps {
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNotifications }) => {
  const {
    currentUser,
    centerInfo,
    isDarkMode,
    toggleDarkMode,
    switchRole,
    logout,
    notes,
    tracking,
    students
  } = useApp();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  // Calculate unread count for parent or notifications
  const unreadCount = React.useMemo(() => {
    if (!currentUser) return 0;
    if (currentUser.role === 'parent') {
      const myKidIds = students.filter(s => s.parentEmail === currentUser.email).map(s => s.id);
      const unreadNotes = notes.filter(n => myKidIds.includes(n.studentId) && !n.readByParent).length;
      const unreadTracking = tracking.filter(t => myKidIds.includes(t.studentId) && t.notes && !t.readByParent).length;
      return unreadNotes + unreadTracking;
    }
    return notes.filter(n => !n.readByParent).length;
  }, [currentUser, students, notes, tracking]);

  const rolesList: { role: UserRole; label: string; icon: any; color: string }[] = [
    { role: 'admin', label: 'مدير النظام (كامل الصلاحيات)', icon: Shield, color: 'text-purple-600 dark:text-purple-400' },
    { role: 'sheikh', label: 'المعلم / الشيخ المحفظ', icon: GraduationCap, color: 'text-emerald-600 dark:text-emerald-400' },
    { role: 'parent', label: 'ولي الأمر (متابعة الأبناء)', icon: Users, color: 'text-amber-600 dark:text-amber-400' },
    { role: 'data_entry', label: 'مدخل بيانات / شؤون طلاب', icon: UserCheck, color: 'text-blue-600 dark:text-blue-400' }
  ];

  if (!currentUser) return null;

  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-amber-300 shadow-md">
              {centerInfo.logo ? (
                <img src={centerInfo.logo} alt="Center Logo" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <Building2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                {centerInfo.name}
              </h1>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>نظام إدارة الحلقات والمتابعة الإلكترونية</span>
              </p>
            </div>
          </div>

          {/* Center / Right controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Fast Demo Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all cursor-pointer shadow-2xs"
                title="تبديل الصلاحية للتجربة السريعة"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">تبديل الحساب (تجربة):</span>
                <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-md text-[11px]">
                  {currentUser.role === 'admin'
                    ? 'المدير'
                    : currentUser.role === 'sheikh'
                    ? 'الشيخ'
                    : currentUser.role === 'parent'
                    ? 'ولي أمر'
                    : 'مدخل بيانات'}
                </span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {isRoleDropdownOpen && (
                <div
                  className="absolute left-0 sm:right-auto mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-2 z-50 animate-in fade-in zoom-in-95"
                  onMouseLeave={() => setIsRoleDropdownOpen(false)}
                >
                  <div className="px-3 py-2 text-[11px] font-bold text-slate-400 border-b border-slate-100 dark:border-slate-700 mb-1">
                    اختر الصلاحية للمعاينة الفورية
                  </div>
                  {rolesList.map(r => (
                    <button
                      key={r.role}
                      onClick={() => {
                        switchRole(r.role);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full text-right flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        currentUser.role === r.role
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <r.icon className={`w-4 h-4 ${r.color}`} />
                      <span>{r.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="الإشعارات والتنبيهات"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dark/Light mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDarkMode ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الليلي'}
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {/* User Details & Logout */}
            <div className="flex items-center gap-2 border-r border-slate-200 dark:border-slate-800 pr-2 mr-1">
              <div className="hidden md:block text-right">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{currentUser.name}</div>
                <div className="text-[10px] text-slate-400">{currentUser.email}</div>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="تسجيل الخروج"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
