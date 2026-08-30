const fs = require('fs');
let file = 'src/components/Layout/Navbar.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace notification bell block to only render if user is parent
const oldBellTarget = `            {/* Notification Bell */}
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
            </button>`;

const newBellReplace = `            {/* Notification Bell (Parents Only) */}
            {currentUser?.role === 'parent' && (
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
            )}`;

code = code.replace(oldBellTarget, newBellReplace);

// We can also fix the unreadCount useMemo to return 0 for non-parents just in case
const oldUnreadCount = `  const unreadCount = React.useMemo(() => {
    if (!currentUser) return 0;
    if (currentUser.role === 'parent') {
      const myKidIds = students.filter(s => s.parentEmail === currentUser.email).map(s => s.id);
      const unreadNotes = notes.filter(n => myKidIds.includes(n.studentId) && !n.readByParent).length;
      const unreadTracking = tracking.filter(t => myKidIds.includes(t.studentId) && t.notes && !t.readByParent).length;
      return unreadNotes + unreadTracking;
    }
    return notes.filter(n => !n.readByParent).length;
  }, [currentUser, students, notes, tracking]);`;

const newUnreadCount = `  const unreadCount = React.useMemo(() => {
    if (!currentUser || currentUser.role !== 'parent') return 0;
    const myKidIds = students.filter(s => s.parentEmail === currentUser.email || s.parentId === currentUser.id).map(s => s.id);
    const unreadNotes = notes.filter(n => myKidIds.includes(n.studentId) && !n.readByParent).length;
    const unreadTracking = tracking.filter(t => myKidIds.includes(t.studentId) && t.notes && !t.readByParent).length;
    return unreadNotes + unreadTracking;
  }, [currentUser, students, notes, tracking]);`;

code = code.replace(oldUnreadCount, newUnreadCount);

fs.writeFileSync(file, code);
