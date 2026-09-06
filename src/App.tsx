import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Layout/Navbar';
import { Sidebar } from './components/Layout/Sidebar';
import { LoginModal } from './components/Auth/LoginModal';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { HalaqatManager } from './components/Admin/HalaqatManager';
import { StudentsManager } from './components/Admin/StudentsManager';
import { SheikhsManager } from './components/Admin/SheikhsManager';
import { AdminsManager } from './components/Admin/AdminsManager';
import { ExamsManager } from './components/Admin/ExamsManager';
import { HonorBoardManager } from './components/Admin/HonorBoardManager';
import { ReportsView } from './components/Admin/ReportsView';
import { CenterSettings } from './components/Admin/CenterSettings';
import { UserSettings } from './components/Admin/UserSettings';
import { DailyRecitationSheet } from './components/Sheikh/DailyRecitationSheet';
import { SheikhStudentsView } from './components/Sheikh/SheikhStudentsView';
import { SheikhNotes } from './components/Sheikh/SheikhNotes';
import { ParentDashboard } from './components/Parent/ParentDashboard';
import { ParentNotificationsModal } from './components/Parent/ParentNotificationsModal';
import { ResetPasswordModal } from './components/Auth/ResetPasswordModal';
import { supabase } from './lib/supabase';

const MainLayout: React.FC = () => {
  const { currentUser, activeScreen } = useApp();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  if (!currentUser) {
    return <LoginModal />;
  }

  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'reports':
        return <ReportsView />;
      case 'groups':
        return <HalaqatManager />;
      case 'students':
        return <StudentsManager />;
      case 'sheikhs':
        return <SheikhsManager />;
      case 'admins':
        return <AdminsManager />;
      case 'exams':
        return <ExamsManager />;
      case 'honor':
        return <HonorBoardManager />;
      case 'settings':
        return <UserSettings />;
      case 'center_settings':
        return <CenterSettings />;
      case 'daily-halqa':
        return <DailyRecitationSheet />;
      case 'sheikh-students':
        return <SheikhStudentsView />;
      case 'sheikh-notes':
        return <SheikhNotes />;
      case 'parent-kids':
        return <ParentDashboard />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar onOpenNotifications={() => setIsNotifOpen(true)} />

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col md:flex-row gap-6">
        <Sidebar />
        
        <main className="flex-1 min-w-0">
          {renderScreen()}
        </main>
      </div>

      {isNotifOpen && (
        <ParentNotificationsModal onClose={() => setIsNotifOpen(false)} />
      )}
    </div>
  );
};

export default function App() {
  const [isRecovering, setIsRecovering] = useState(false);

  React.useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsRecovering(true);
        }
      }
    );
    
    if (window.location.hash.includes('type=recovery')) {
      setIsRecovering(true);
    }

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (isRecovering) {
    return (
      <ResetPasswordModal onComplete={() => { setIsRecovering(false); window.location.hash = ""; }} />
    );
  }

  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
