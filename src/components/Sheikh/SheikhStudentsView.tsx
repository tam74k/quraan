import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { FullTrackingModal } from './FullTrackingModal';
import { CertificateModal } from '../Common/CertificateModal';
import { GraduationCap, BookOpen, Award, Phone, Calendar, Sparkles } from 'lucide-react';

export const SheikhStudentsView: React.FC = () => {
  const { students, sheikhs, currentSheikh, tracking } = useApp();
  const activeSheikh = currentSheikh || sheikhs[0];

  const myStudents = students.filter(s => s.sheikhId === activeSheikh?.id && s.status === 'Active');

  const [activeTrackingStudent, setActiveTrackingStudent] = useState<Student | null>(null);
  const [certStudent, setCertStudent] = useState<Student | null>(null);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              <GraduationCap className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">
                قائمة وطلاب حلقة ({activeSheikh?.halqaName})
              </h2>
              <p className="text-xs text-slate-400">
                إجمالي {myStudents.length} طلاب مسكنين بالحلقة تحت إشراف فضيلة الشيخ / {activeSheikh?.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Student Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {myStudents.map((student, idx) => {
          const studentTracking = tracking.filter(t => t.studentId === student.id && t.status === 'approved');
          const lastRecord = studentTracking.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
          
          const progressPercent = Math.min(100, Math.round(((student.currentJuz || 1) / (student.targetJuz || 5)) * 100));

          return (
            <div
              key={student.id}
              className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-emerald-800 to-emerald-600 text-amber-300 text-lg font-black flex items-center justify-center shadow-md">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{student.name}</h3>
                      <p className="text-xs text-slate-400">
                        {student.grade} • {student.age} سنة
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {student.points || 0} نقطة
                  </span>
                </div>

                {/* Memorization Progress */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-2 mb-3">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">المنجز القرآني:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      {student.currentJuz || 1} من {student.targetJuz || 5} أجزاء
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Last Recitation */}
                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">آخر تسميع:</span>
                    <span className="font-mono">{lastRecord?.date || 'لم يُسجل بعد'}</span>
                  </div>
                  {lastRecord && (
                    <div className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 truncate">
                      {lastRecord.newSurah ? `حفظ: ${lastRecord.newSurah} (${lastRecord.newFrom}-${lastRecord.newTo})` : 'مراجعة فقط'}
                    </div>
                  )}
                  <div className="flex justify-between text-[11px] pt-1">
                    <span className="text-slate-400">هاتف ولي الأمر:</span>
                    <span className="font-mono">{student.parentPhone}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveTrackingStudent(student)}
                  className="w-full py-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-bold rounded-xl border border-emerald-200 dark:border-emerald-800/60 transition-colors cursor-pointer"
                >
                  استمارة ومصحف
                </button>

                <button
                  onClick={() => setCertStudent(student)}
                  className="w-full py-2 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-bold rounded-xl border border-amber-200 dark:border-amber-800/60 transition-colors cursor-pointer"
                >
                  شهادة تقدير
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tracking Modal */}
      {activeTrackingStudent && (
        <FullTrackingModal
          student={activeTrackingStudent}
          selectedDate={new Date().toISOString().split('T')[0]}
          onClose={() => setActiveTrackingStudent(null)}
        />
      )}

      {/* Certificate Modal */}
      {certStudent && (
        <CertificateModal
          studentName={certStudent.name}
          sheikhName={activeSheikh?.name}
          onClose={() => setCertStudent(null)}
        />
      )}

    </div>
  );
};
