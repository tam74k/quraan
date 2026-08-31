import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArchiveRecord } from '../../types';
import { FolderArchive, Calendar, User, Clock, Trash2, Printer, ArrowRight, BookOpen, GraduationCap } from 'lucide-react';

export const ArchiveView: React.FC = () => {
  const { archives, deleteArchive } = useApp();
  const [selectedArchive, setSelectedArchive] = useState<ArchiveRecord | null>(null);

  // Date range for reports inside archive view
  const [dateFrom, setDateFrom] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  });
  const [dateTo, setDateTo] = useState(() => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
  });

  const handlePrint = () => {
    window.print();
  };

  if (selectedArchive) {
    const centerInfo = selectedArchive.centerInfo || { name: 'مركز تحفيظ القرآن الكريم', address: '', phone: '', email: '', logo: '', hijriYear: '', academicSeason: '', managerName: '' };
    const students = selectedArchive.students || [];
    const tracking = selectedArchive.tracking || [];
    const sheikhs = selectedArchive.sheikhs || [];

    const isStudentActive = (st: any) => st.status === 'Active';

    const getStudentDateList = (student: any) => {
      const studentTracks = tracking.filter(t => t.studentId === student.id);
      const datesSet = new Set<string>();
      
      const [fYear, fMonth, fDay] = dateFrom.split('-').map(Number);
      const [tYear, tMonth, tDay] = dateTo.split('-').map(Number);
      const start = new Date(fYear, fMonth - 1, fDay);
      const end = new Date(tYear, tMonth - 1, tDay);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        datesSet.add(d.toISOString().split('T')[0]);
      }

      studentTracks.forEach(t => {
        if (t.date >= dateFrom && t.date <= dateTo) {
          datesSet.add(t.date);
        }
      });

      return Array.from(datesSet).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    };

    return (
      <div className="space-y-6">
        {/* Top Control Bar (No Print) */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedArchive(null)}
              className="p-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة لقائمة الأرشيف</span>
            </button>
            <div>
              <h2 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <FolderArchive className="w-5 h-5 text-emerald-600" />
                <span>أرشيف تاريخ: {selectedArchive.date}</span>
              </h2>
              <p className="text-xs text-slate-400">تم الأرشفة بواسطة: {selectedArchive.archivedBy} في تمام الساعة {selectedArchive.time}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-slate-500 font-bold px-2">الفترة:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-transparent font-mono font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
              />
              <span>إلى</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-transparent font-mono font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الاستمارات المؤرشفة</span>
            </button>
          </div>
        </div>

        {/* Archived Reports / Sheets Container */}
        <div className="space-y-8">
          {students.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700">
              <FolderArchive className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">لا توجد سجلات طلاب في هذا الأرشيف</h3>
            </div>
          ) : (
            students.map((student: any) => {
              const sheikh = sheikhs.find((s: any) => s.id === student.sheikhId);
              const studentDates = getStudentDateList(student);
              if (!isStudentActive(student) && studentDates.length === 0) return null;

              return (
                <div key={student.id} className="monthly-sheet-landscape page-break border border-slate-300 dark:border-slate-700 p-6 rounded-2xl bg-white text-slate-900 mb-8 print:border-none print:p-2 print:mb-0 print:rounded-none">
                  
                  {/* Header */}
                  <div className="flex justify-between items-center border-b-2 border-emerald-800 pb-3 mb-4">
                    <div className="flex items-center gap-3">
                      {centerInfo.logo && (
                        <img src={centerInfo.logo} alt={centerInfo.name} className="w-16 h-16 object-contain rounded-xl bg-white p-1" />
                      )}
                      <div className="text-right">
                        <h2 className="font-serif font-black text-emerald-950 text-base">{centerInfo.name}</h2>
                        <p className="text-[11px] text-slate-600">{centerInfo.address}</p>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="inline-block border-2 border-emerald-800 bg-emerald-50 px-4 py-1 rounded-lg font-bold text-xs text-emerald-900">
                        استمارة المتابعة الشهرية المؤرشفة (حفظ ومراجعة القرآن الكريم)
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        الفترة من: <span className="font-mono">{dateFrom}</span> إلى: <span className="font-mono">{dateTo}</span> ({centerInfo.hijriYear}) - [أرشيف: {selectedArchive.date}]
                      </div>
                    </div>

                    <div className="text-left text-[11px] text-slate-600">
                      <div>هاتف: {centerInfo.phone}</div>
                      <div>البريد: {centerInfo.email}</div>
                    </div>
                  </div>

                  {/* Student & Sheikh Info */}
                  <div className="grid grid-cols-4 gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold mb-4">
                    <div>اسم الطالب: <span className="text-emerald-900 text-sm">{student.name}</span></div>
                    <div>المرحلة: <span>{student.grade}</span></div>
                    <div>الحلقة: <span className="text-amber-800">{sheikh?.halqaName || 'عامة'}</span></div>
                    <div>المحفظ: <span>{sheikh?.name || 'فضيلة الشيخ'}</span></div>
                  </div>

                  {/* Monthly Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-slate-400 text-center text-[10px]">
                      <thead>
                        <tr className="bg-emerald-900 text-white font-bold">
                          <th className="border border-slate-400 p-1.5 w-8" rowSpan={2}>م</th>
                          <th className="border border-slate-400 p-1.5 w-20" rowSpan={2}>التاريخ</th>
                          <th className="border border-slate-400 p-1.5 bg-emerald-800" colSpan={3}>الحفظ الجديد</th>
                          <th className="border border-slate-400 p-1.5 bg-amber-800" colSpan={6}>مقرر المراجعة</th>
                          <th className="border border-slate-400 p-1.5 w-14" rowSpan={2}>التقييم</th>
                        </tr>
                        <tr className="bg-emerald-800 text-white font-semibold">
                          <th className="border border-slate-400 p-1 w-16">السورة</th>
                          <th className="border border-slate-400 p-1 w-7">من</th>
                          <th className="border border-slate-400 p-1 w-7">إلى</th>
                          <th className="border border-slate-400 p-1 w-16">من السورة</th>
                          <th className="border border-slate-400 p-1 w-7">من</th>
                          <th className="border border-slate-400 p-1 w-7">إلى</th>
                          <th className="border border-slate-400 p-1 w-16">إلى السورة</th>
                          <th className="border border-slate-400 p-1 w-7">من</th>
                          <th className="border border-slate-400 p-1 w-7">إلى</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentDates.map((dateStr, idx) => {
                          const record = tracking.find((t: any) => t.studentId === student.id && t.date === dateStr);
                          return (
                            <tr key={dateStr} className="hover:bg-slate-50">
                              <td className="border border-slate-400 font-mono p-1">{idx + 1}</td>
                              <td className="border border-slate-400 font-mono p-1">{dateStr}</td>
                              <td className="border border-slate-400 p-1">{record?.newSurah || ''}</td>
                              <td className="border border-slate-400 font-mono p-1">{record?.newFrom ?? ''}</td>
                              <td className="border border-slate-400 font-mono p-1">{record?.newTo ?? ''}</td>
                              <td className="border border-slate-400 p-1">{record?.revSurah || ''}</td>
                              <td className="border border-slate-400 font-mono p-1">{record?.revFrom ?? ''}</td>
                              <td className="border border-slate-400 font-mono p-1">{record?.revTo ?? ''}</td>
                              <td className="border border-slate-400 p-1">{record?.revToSurah || ''}</td>
                              <td className="border border-slate-400 font-mono p-1">{record?.revToFrom ?? ''}</td>
                              <td className="border border-slate-400 font-mono p-1">{record?.revToTo ?? ''}</td>
                              <td className="border border-slate-400 font-bold p-1 text-emerald-900">{record?.eval || ''}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Signatures */}
                  <div className="grid grid-cols-3 gap-6 mt-6 pt-4 border-t border-slate-300 text-xs font-bold text-center">
                    <div>
                      <div>توقيع محفظ الحلقة:</div>
                      <div className="mt-4 font-serif text-emerald-900">{sheikh?.name || 'فضيلة الشيخ'}</div>
                    </div>
                    <div>
                      <div>توقيع المشرف التربوي:</div>
                      <div className="mt-4 text-slate-400">.........................................</div>
                    </div>
                    <div>
                      <div>اعتماد وختم مدير المركز:</div>
                      <div className="mt-4 font-serif text-emerald-900">{centerInfo.managerName}</div>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            <FolderArchive className="w-6 h-6" />
          </span>
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">قسم أرشيف الدورات والدورات السابقة</h2>
            <p className="text-xs text-slate-400">عرض بيانات وسجلات الدورات السابقة المؤرشفة بالكامل مع إمكانية استعراضها وطباعتها</p>
          </div>
        </div>
      </div>

      {/* Archives List */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>سجلات الدورات المؤرشفة ({archives.length})</span>
        </h3>

        {archives.length === 0 ? (
          <div className="text-center py-16 px-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <FolderArchive className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">لا توجد أرشيفات سابقة حتى الآن</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              عند الضغط على خيار (نقل البيانات الحالية الى الارشيف وتفريغ البرنامج) من إعدادات المركز، سيتم حفظ نسخة كاملة هنا لبدء دورة جديدة.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {archives.map((arch) => (
              <div
                key={arch.id}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-all flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      {arch.date}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      {arch.time}
                    </span>
                  </div>

                  <h4 className="font-black text-sm text-slate-800 dark:text-slate-100 mb-2">
                    {arch.centerInfo?.name || 'مركز تحفيظ القرآن الكريم'}
                  </h4>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{arch.students?.length || 0} طالب</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-600" />
                      <span>{arch.archivedBy}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setSelectedArchive(arch)}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer text-center"
                  >
                    عرض وطباعة الاستمارات
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`هل أنت متأكد من حذف هذا الأرشيف (${arch.date}) نهائياً؟`)) {
                        deleteArchive(arch.id);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer ml-2"
                    title="حذف الأرشيف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
