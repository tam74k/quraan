import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, Printer, Calendar, User, Users } from 'lucide-react';

const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export const ReportsView: React.FC = () => {
  const { centerInfo, students, sheikhs, tracking } = useApp();

  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const lastDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];

  const [reportType, setReportType] = useState<'halqa_monthly_batch' | 'single_student_monthly' | 'sheikh_daily' | 'sheikh_students' | 'all_students'>('halqa_monthly_batch');
  const [selectedSheikhId, setSelectedSheikhId] = useState<number>(sheikhs[0]?.id || 1);
  const [selectedStudentId, setSelectedStudentId] = useState<number>(students[0]?.id || 1);
  const [dateFrom, setDateFrom] = useState<string>(firstDayOfMonth);
  const [dateTo, setDateTo] = useState<string>(lastDayOfMonth);

  const handlePrint = () => {
    window.print();
  };

  const getDatesInRange = (startDateStr: string, endDateStr: string) => {
    const list: string[] = [];
    let current = new Date(startDateStr);
    const end = new Date(endDateStr);

    while (current <= end) {
      list.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return list;
  };

  const dateList = getDatesInRange(dateFrom, dateTo);
  const activeSheikh = sheikhs.find(s => s.id === selectedSheikhId) || sheikhs[0];
  const halqaStudents = students.filter(s => s.sheikhId === selectedSheikhId && s.status === 'Active');
  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const renderSingleStudentLandscapeSheet = (student: any, sheikh: any) => {
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
              استمارة المتابعة الشهرية لحفظ ومراجعة القرآن الكريم (ورقية)
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              الفترة من: <span className="font-mono">{dateFrom}</span> إلى: <span className="font-mono">{dateTo}</span> ({centerInfo.hijriYear})
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

        {/* Recitation Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-center text-[10px] border-collapse border border-slate-400">
            <thead>
              <tr className="bg-slate-200 font-bold">
                <th className="border border-slate-400 p-1 w-6" rowSpan={2}>م</th>
                <th className="border border-slate-400 p-1 w-14" rowSpan={2}>اليوم</th>
                <th className="border border-slate-400 p-1 w-16" rowSpan={2}>التاريخ</th>
                <th className="border border-slate-400 p-1 bg-emerald-100 text-emerald-950" colSpan={3}>الحفظ الجديد</th>
                <th className="border border-slate-400 p-1 bg-amber-100 text-amber-950" colSpan={3}>المراجعة الصغرى</th>
                <th className="border border-slate-400 p-1 bg-blue-100 text-blue-950" colSpan={3}>المراجعة الكبرى</th>
                <th className="border border-slate-400 p-1 w-12" rowSpan={2}>الحضور</th>
                <th className="border border-slate-400 p-1 w-14" rowSpan={2}>التقييم</th>
                <th className="border border-slate-400 p-1" rowSpan={2}>ملاحظات وتوجيه الشيخ</th>
                <th className="border border-slate-400 p-1 w-14" rowSpan={2}>توقيع الشيخ</th>
              </tr>
              <tr className="bg-slate-100 text-[9px] font-semibold">
                <th className="border border-slate-400 p-0.5 w-16">السورة</th>
                <th className="border border-slate-400 p-0.5 w-7">من</th>
                <th className="border border-slate-400 p-0.5 w-7">إلى</th>
                <th className="border border-slate-400 p-0.5 w-16">السورة</th>
                <th className="border border-slate-400 p-0.5 w-7">من</th>
                <th className="border border-slate-400 p-0.5 w-7">إلى</th>
                <th className="border border-slate-400 p-0.5 w-16">السورة</th>
                <th className="border border-slate-400 p-0.5 w-7">من</th>
                <th className="border border-slate-400 p-0.5 w-7">إلى</th>
              </tr>
            </thead>
            <tbody>
              {dateList.map((dStr, idx) => {
                const dObj = new Date(dStr);
                const dayName = ARABIC_DAYS[dObj.getDay()];
                const r = tracking.find(t => t.studentId === student.id && t.date === dStr);
                return (
                  <tr key={dStr} className="h-5">
                    <td className="border border-slate-400 font-bold p-0.5">{idx + 1}</td>
                    <td className="border border-slate-400 p-0.5">{dayName}</td>
                    <td className="border border-slate-400 font-mono text-[9px] p-0.5">{dStr}</td>
                    <td className="border border-slate-400 font-semibold p-0.5">{r?.newSurah || ''}</td>
                    <td className="border border-slate-400 font-mono p-0.5">{r?.newFrom || ''}</td>
                    <td className="border border-slate-400 font-mono p-0.5">{r?.newTo || ''}</td>
                    <td className="border border-slate-400 p-0.5">{r?.revSurah || ''}</td>
                    <td className="border border-slate-400 font-mono p-0.5">{r?.revFrom || ''}</td>
                    <td className="border border-slate-400 font-mono p-0.5">{r?.revTo || ''}</td>
                    <td className="border border-slate-400 p-0.5"></td>
                    <td className="border border-slate-400 p-0.5"></td>
                    <td className="border border-slate-400 p-0.5"></td>
                    <td className="border border-slate-400 font-bold p-0.5">{r?.att || ''}</td>
                    <td className="border border-slate-400 font-bold p-0.5 text-emerald-900">{r?.eval || ''}</td>
                    <td className="border border-slate-400 text-right px-1 text-[9px]">{r?.notes || ''}</td>
                    <td className="border border-slate-400 p-0.5"></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Signatures */}
        <div className="grid grid-cols-3 gap-6 mt-4 pt-3 border-t border-slate-300 text-xs font-bold text-center">
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
  };

  return (
    <div className="space-y-6">
      
      {/* Controls Bar */}
      <div className="no-print bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">استمارات وتقارير المتابعة القرآنية للطباعة</h2>
              <p className="text-xs text-slate-400">طباعة استمارات شهرية ورقية بالعرض (A4 Landscape) وتوزيع الحلقات</p>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الاستمارات فوراً (A4 بالعرض)</span>
          </button>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
          {[
            { id: 'halqa_monthly_batch', label: 'استمارات شهرية لجميع طلاب الحلقة (A4 بالعرض)' },
            { id: 'single_student_monthly', label: 'استمارة شهرية لطالب واحد (A4 بالعرض)' },
            { id: 'sheikh_daily', label: 'كشف المتابعة اليومية للحلقة' },
            { id: 'sheikh_students', label: 'كشف طلاب الحلقة' },
            { id: 'all_students', label: 'كشف جميع طلاب المركز' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setReportType(t.id as any)}
              className={`p-3 rounded-2xl text-xs font-bold text-center border transition-all cursor-pointer ${
                reportType === t.id
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          
          {(reportType === 'halqa_monthly_batch' || reportType === 'single_student_monthly' || reportType === 'sheikh_daily' || reportType === 'sheikh_students') && (
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">اختر الحلقة / الشيخ</label>
              <select
                value={selectedSheikhId}
                onChange={(e) => setSelectedSheikhId(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {sheikhs.map(sh => (
                  <option key={sh.id} value={sh.id}>{sh.halqaName} - {sh.name}</option>
                ))}
              </select>
            </div>
          )}

          {reportType === 'single_student_monthly' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">اختر الطالب</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">من تاريخ</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">إلى تاريخ</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

        </div>
      </div>

      {/* Render Area */}
      <div>
        {reportType === 'halqa_monthly_batch' && (
          <div>
            <div className="no-print p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-bold mb-4">
              جاهز لطباعة ({halqaStudents.length}) استمارة شهرية لطلاب ({activeSheikh?.halqaName}) - كل طالب في صفحة A4 بالعرض منفصلة.
            </div>
            {halqaStudents.map(st => renderSingleStudentLandscapeSheet(st, activeSheikh))}
          </div>
        )}

        {reportType === 'single_student_monthly' && selectedStudent && (
          renderSingleStudentLandscapeSheet(selectedStudent, sheikhs.find(s => s.id === selectedStudent.sheikhId))
        )}

        {reportType === 'all_students' && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200">
            <div className="flex justify-between items-center border-b-2 border-emerald-800 pb-4 mb-6">
              <div className="flex items-center gap-4">
                {centerInfo.logo && (
                  <img src={centerInfo.logo} alt={centerInfo.name} className="w-24 h-24 object-contain rounded-2xl bg-white p-2 shadow-sm" />
                )}
                <div className="text-right">
                  <h2 className="text-xl font-bold text-emerald-950">{centerInfo.name}</h2>
                  <p className="text-xs text-slate-500">{centerInfo.address} - هاتف: {centerInfo.phone}</p>
                </div>
              </div>
              <div className="text-left text-sm font-bold text-slate-600">
                كشف بأسماء جميع طلاب المركز
              </div>
            </div>
            <table className="w-full text-center text-xs border border-slate-300">
              <thead className="bg-slate-100">
                <tr><th className="p-2 border">م</th><th className="p-2 border text-right">اسم الطالب</th><th className="p-2 border">الرقم المدني</th><th className="p-2 border">المرحلة</th><th className="p-2 border">الهاتف</th><th className="p-2 border">الحلقة</th></tr>
              </thead>
              <tbody>
                {students.map((st, i) => (
                  <tr key={st.id}>
                    <td className="p-2 border">{i + 1}</td>
                    <td className="p-2 border text-right font-bold">{st.name}</td>
                    <td className="p-2 border font-mono">{st.civilId}</td>
                    <td className="p-2 border">{st.grade}</td>
                    <td className="p-2 border font-mono">{st.parentPhone}</td>
                    <td className="p-2 border">{sheikhs.find(s => s.id === st.sheikhId)?.halqaName || 'غير مسكن'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
