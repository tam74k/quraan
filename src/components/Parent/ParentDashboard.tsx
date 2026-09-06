import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { KidProgressDetail } from './KidProgressDetail';
import { Users, BookOpen, Award, CheckCircle2, ChevronLeft, Sparkles, HeartHandshake } from 'lucide-react';
import { Student } from '../../types';

export const ParentDashboard: React.FC = () => {
  const { students, sheikhs, currentUser, tracking, notes } = useApp();

  // Find all children matching logged in parent email
  const myKids = students.filter(s => s.parentPhone === (currentUser?.phone || ''));
  const [selectedKid, setSelectedKid] = useState<Student | null>(myKids[0] || null);

  if (myKids.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">لا يوجد أبناء مسجلين بحسابك حالياً</h3>
        <p className="text-xs text-slate-400 mt-1">يرجى مراجعة إدارة المركز لربط رقم جوالك مع ملفات أبنائك.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold mb-3 border border-amber-400/30">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>بوابة ولي الأمر الإلكترونية</span>
          </div>
          <h2 className="text-2xl font-black mb-1">أهلاً بك، {currentUser?.name}</h2>
          <p className="text-emerald-100/90 text-xs sm:text-sm">
            متابعة إنجاز الأبناء اليومي، حفظ ومراجعة القرآن الكريم، وملاحظات المشايخ أولاً بأول.
          </p>
        </div>
      </div>

      {/* Children Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {myKids.map(kid => {
          const sheikh = sheikhs.find(s => s.id === kid.sheikhId);
          const isSelected = selectedKid?.id === kid.id;
          const kidTracking = tracking.filter(t => t.studentId === kid.id && t.status === 'approved');
          const lastRecord = kidTracking.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

          return (
            <button
              key={kid.id}
              onClick={() => setSelectedKid(kid)}
              className={`p-5 rounded-3xl border-2 text-right transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-md ring-2 ring-emerald-600/20'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-300'
              }`}
            >
              <div className="w-full">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-emerald-800 to-emerald-600 text-amber-300 font-black text-lg flex items-center justify-center shadow-md">
                    {kid.name.charAt(0)}
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    {kid.grade}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{kid.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  حلقة: {sheikh ? sheikh.halqaName : 'عامة'}
                </p>

                {lastRecord && (
                  <div className="mt-3 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400 block text-[10px]">آخر تسميع ({lastRecord.date}):</span>
                    <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                      {lastRecord.newSurah ? `${lastRecord.newSurah} (${lastRecord.newFrom}-${lastRecord.newTo})` : 'مراجعة'}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <span>عرض ملف الأداء الكامل</span>
                <ChevronLeft className="w-4 h-4" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Child Progress View */}
      {selectedKid && (
        <KidProgressDetail kid={selectedKid} />
      )}

    </div>
  );
};
