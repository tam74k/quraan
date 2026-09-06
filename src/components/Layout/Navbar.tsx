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

  if (!currentUser) return null;

  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center text-amber-300 shadow-sm border border-slate-100 dark:border-slate-800 p-1">
              {centerInfo.logo ? (
                <img src={centerInfo.logo} alt="Center Logo" className="w-full h-full object-contain rounded-lg" />
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
