import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, X, CheckCheck, MessageSquare, AlertTriangle, Sparkles } from 'lucide-react';

interface ParentNotificationsModalProps {
  onClose: () => void;
}

export const ParentNotificationsModal: React.FC<ParentNotificationsModalProps> = ({ onClose }) => {
  const { currentUser, students, notes, tracking, markNotesAsRead } = useApp();

  const myKidIds = currentUser?.role === 'parent'
    ? students.filter(s => s.parentEmail.toLowerCase() === currentUser.email.toLowerCase()).map(s => s.id)
    : students.map(s => s.id);

  const parentNotes = notes
    .filter(n => myKidIds.includes(n.studentId))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const trackingNotes = tracking
    .filter(t => myKidIds.includes(t.studentId) && t.notes && t.notes.trim() !== '')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleMarkAllRead = () => {
    markNotesAsRead(myKidIds);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              <Bell className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">صندوق الإشعارات والتنبيهات</h3>
              <p className="text-xs text-slate-400">تنبيهات الحفظ والملاحظات المرسلة من مشايخ الحلقات</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>تحديد الكل كمقروء</span>
            </button>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications Feed */}
        <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
          {parentNotes.length > 0 || trackingNotes.length > 0 ? (
            <>
              {parentNotes.map(n => {
                const kid = students.find(s => s.id === n.studentId);
                return (
                  <div
                    key={n.id}
                    className={`p-4 rounded-2xl border text-xs space-y-1.5 transition-colors ${
                      n.readByParent
                        ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                        : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700/60 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          رسالة بخصوص: <strong className="text-emerald-700 dark:text-emerald-400">{kid?.name}</strong>
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{n.date}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                      {n.text}
                    </p>
                  </div>
                );
              })}

              {trackingNotes.map(t => {
                const kid = students.find(s => s.id === t.studentId);
                return (
                  <div
                    key={`track-${t.id}`}
                    className={`p-4 rounded-2xl border text-xs space-y-1.5 transition-colors ${
                      t.readByParent
                        ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                        : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/60 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        ملاحظة تسميع: <strong className="text-amber-700 dark:text-amber-400">{kid?.name}</strong>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{t.date}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                      «{t.notes}»
                    </p>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              لا توجد إشعارات أو تنبيهات مسجلة حالياً.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
