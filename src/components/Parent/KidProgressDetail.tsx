import React from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { QuranMushafVisualizer } from '../Common/QuranMushafVisualizer';
import { BookOpen, Calendar, CheckCircle2, MessageSquare, Award, Sparkles, Trophy } from 'lucide-react';

interface KidProgressDetailProps {
  kid: Student;
}

export const KidProgressDetail: React.FC<KidProgressDetailProps> = ({ kid }) => {
  const { tracking, sheikhs, notes, badges } = useApp();

  const sheikh = sheikhs.find(s => s.id === kid.sheikhId);
  const approvedTracking = tracking
    .filter(t => t.studentId === kid.id && t.status === 'approved')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const kidNotes = notes
    .filter(n => n.studentId === kid.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const kidBadges = badges.filter(b => b.studentId === kid.id);

  // Stats calculation
  const totalRecitals = approvedTracking.length;
  const presentDays = approvedTracking.filter(t => t.att === 'حضوري' || t.att === 'اونلاين').length;
  const excellentDays = approvedTracking.filter(t => t.eval === 'ممتاز').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Stats */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-linear-to-tr from-emerald-800 to-emerald-600 text-amber-300 font-black text-2xl flex items-center justify-center shadow-lg">
              {kid.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">{kid.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {kid.grade}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                المحفظ: فضيلة الشيخ / <strong className="text-emerald-700 dark:text-emerald-400">{sheikh?.name || 'غير محدد'}</strong> ({sheikh?.halqaName || 'عامة'})
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 sm:gap-6 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="text-center">
              <span className="block text-xl font-black text-emerald-700 dark:text-emerald-400">{kid.currentJuz || 1}</span>
              <span className="text-[11px] text-slate-400">الأجزاء المحفوظة</span>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
            <div className="text-center">
              <span className="block text-xl font-black text-amber-600 dark:text-amber-400">{kid.points || 0}</span>
              <span className="text-[11px] text-slate-400">نقاط التميز</span>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
            <div className="text-center">
              <span className="block text-xl font-black text-purple-600 dark:text-purple-400">{totalRecitals}</span>
              <span className="text-[11px] text-slate-400">أيام التسميع</span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges / Honors */}
      {kidBadges.length > 0 && (
        <div className="bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 rounded-3xl border border-amber-200 dark:border-amber-800/60">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h4 className="text-sm font-bold text-amber-950 dark:text-amber-200">أوسمة وتكريمات الطالب</h4>
          </div>
          <div className="flex flex-wrap gap-3">
            {kidBadges.map(b => (
              <div key={b.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 shadow-xs text-xs">
                <span className="text-lg">{b.icon}</span>
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">{b.name}</div>
                  <div className="text-[10px] text-slate-400">{b.dateEarned}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Quran Progress Map */}
      <QuranMushafVisualizer
        studentName={kid.name}
        trackingHistory={approvedTracking}
      />

      {/* Verified Recitation History */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs">
        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-600" />
          <span>السجل التاريخي المعتمد للتسميع والحضور</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold">
                <th className="p-3">التاريخ</th>
                <th className="p-3">الحفظ الجديد</th>
                <th className="p-3">المراجعة</th>
                <th className="p-3">الحضور</th>
                <th className="p-3">التقييم</th>
                <th className="p-3">ملاحظة وتوجيه الشيخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-300">
              {approvedTracking.length > 0 ? (
                approvedTracking.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-100">{r.date}</td>
                    <td className="p-3 font-semibold text-emerald-800 dark:text-emerald-300">
                      {r.newSurah ? `${r.newSurah} (${r.newFrom || 1}-${r.newTo || 1})` : '—'}
                    </td>
                    <td className="p-3">
                      {r.revSurah ? `${r.revSurah} (${r.revFrom || 1}-${r.revTo || 1})` : '—'}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                        r.att === 'حضوري'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : r.att === 'اونلاين'
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      }`}>
                        {r.att}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        {r.eval || 'ممتاز'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400 max-w-xs text-[11px]">
                      {r.notes || '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    لا توجد سجلات تسميع معتمدة حتى الآن.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Teacher Notes Feed */}
      {kidNotes.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs">
          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <span>رسائل وتوجيهات الشيخ لولي الأمر</span>
          </h4>

          <div className="space-y-3">
            {kidNotes.map(n => (
              <div
                key={n.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold font-mono text-slate-700 dark:text-slate-300">{n.date}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                    {n.priority || 'توجيه'}
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                  «{n.text}»
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
