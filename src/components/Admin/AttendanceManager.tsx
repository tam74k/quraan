import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UserCheck,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  FileSpreadsheet,
  Search,
  Save,
  Loader2,
  Users,
  CalendarRange,
  Globe
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const AttendanceManager: React.FC = () => {
  const {
    students,
    sheikhs,
    tracking,
    centerInfo,
    currentUser,
    saveBatchTrackingRecords
  } = useApp();

  // Active sub-tab: 'record' (تسجيل الحضور اليومي) | 'report' (تقرير الحضور والغياب)
  const [activeTab, setActiveTab] = useState<'record' | 'report'>('record');

  // Detect current sheikh if logged in user is a sheikh
  const currentSheikhId = useMemo(() => {
    if (currentUser?.role === 'sheikh') {
      const sh = sheikhs.find(s => s.userId === currentUser.id || s.email === currentUser.email);
      return sh?.id || sheikhs[0]?.id || 1;
    }
    return sheikhs[0]?.id || 1;
  }, [currentUser, sheikhs]);

  // ==========================================
  // STATE: Daily Attendance Record (تسجيل الحضور)
  // ==========================================
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [recordDate, setRecordDate] = useState<string>(todayStr);
  const [selectedSheikhId, setSelectedSheikhId] = useState<number>(currentSheikhId);
  const [attendanceState, setAttendanceState] = useState<{ [studentId: number]: 'حضوري' | 'اونلاين' | 'غائب' | 'مستأذن' }>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');
  const [recordSearchQuery, setRecordSearchQuery] = useState<string>('');

  // Active halqa students
  const halqaStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSheikh = s.sheikhId === selectedSheikhId;
      const isActive = !s.status || s.status.toLowerCase() === 'active' || s.status === 'نشط';
      return matchesSheikh && isActive;
    });
  }, [students, selectedSheikhId]);

  // Sync attendance state when selected halqa or date changes
  React.useEffect(() => {
    const newState: { [studentId: number]: 'حضوري' | 'اونلاين' | 'غائب' | 'مستأذن' } = {};
    halqaStudents.forEach(s => {
      const existing = tracking.find(t => t.studentId === s.id && t.date === recordDate);
      if (existing && existing.att) {
        newState[s.id] = existing.att as any;
      } else {
        // "يتم تحضير الحاضر منهم والباقي يظل غائب" -> Default is absent
        newState[s.id] = 'غائب';
      }
    });
    setAttendanceState(newState);
    setSaveSuccessMsg('');
  }, [selectedSheikhId, recordDate, halqaStudents, tracking]);

  // Filtered halqa students by search query
  const filteredHalqaStudents = useMemo(() => {
    if (!recordSearchQuery.trim()) return halqaStudents;
    const q = recordSearchQuery.trim().toLowerCase();
    return halqaStudents.filter(s =>
      s.name.toLowerCase().includes(q) ||
      (s.civilId && s.civilId.includes(q))
    );
  }, [halqaStudents, recordSearchQuery]);

  // Daily stats summary
  const dailyStats = useMemo(() => {
    let presentCount = 0;
    let absentCount = 0;
    let excusedCount = 0;

    halqaStudents.forEach(s => {
      const st = attendanceState[s.id] || 'غائب';
      if (st === 'حضوري' || st === 'اونلاين') presentCount++;
      else if (st === 'مستأذن') excusedCount++;
      else absentCount++;
    });

    const total = halqaStudents.length;
    const presentRate = total > 0 ? Math.round((presentCount / total) * 100) : 0;

    return { total, presentCount, absentCount, excusedCount, presentRate };
  }, [halqaStudents, attendanceState]);

  // Mark single student
  const handleSetStudentStatus = (studentId: number, status: 'حضوري' | 'اونلاين' | 'غائب' | 'مستأذن') => {
    setAttendanceState(prev => ({ ...prev, [studentId]: status }));
  };

  // Quick action: Mark all present
  const handleMarkAllPresent = () => {
    setAttendanceState(prev => {
      const updated = { ...prev };
      halqaStudents.forEach(s => {
        updated[s.id] = 'حضوري';
      });
      return updated;
    });
  };

  // Quick action: Mark all absent
  const handleMarkAllAbsent = () => {
    setAttendanceState(prev => {
      const updated = { ...prev };
      halqaStudents.forEach(s => {
        updated[s.id] = 'غائب';
      });
      return updated;
    });
  };

  // Save Attendance to Database
  const handleSaveAttendance = async () => {
    if (halqaStudents.length === 0) {
      alert('لا يوجد طلاب في هذه الحلقة لتحضيرهم.');
      return;
    }

    setIsSaving(true);
    setSaveSuccessMsg('');

    try {
      const recordsToSave = halqaStudents.map(student => {
        const existing = tracking.find(t => t.studentId === student.id && t.date === recordDate);
        return {
          id: existing?.id,
          studentId: student.id,
          sheikhId: selectedSheikhId,
          date: recordDate,
          att: attendanceState[student.id] || 'غائب',
          newSurah: existing?.newSurah || '',
          newFrom: existing?.newFrom ?? null,
          newTo: existing?.newTo ?? null,
          revSurah: existing?.revSurah || '',
          revFrom: existing?.revFrom ?? null,
          revTo: existing?.revTo ?? null,
          revToSurah: existing?.revToSurah || '',
          revToFrom: existing?.revToFrom ?? null,
          revToTo: existing?.revToTo ?? null,
          bigRevSurah: existing?.bigRevSurah || null,
          bigRevFrom: existing?.bigRevFrom ?? null,
          bigRevTo: existing?.bigRevTo ?? null,
          eval: existing?.eval || 'ممتاز',
          notes: existing?.notes || '',
          status: existing?.status || 'approved',
          readByParent: existing?.readByParent || false
        };
      });

      const res = await saveBatchTrackingRecords(recordsToSave);
      if (res.success) {
        setSaveSuccessMsg(`تم حفظ سجل الحضور والغياب بنجاح لـ (${halqaStudents.length} طالب) ليوم ${recordDate}!`);
        setTimeout(() => setSaveSuccessMsg(''), 5000);
      } else {
        alert('حدث خطأ أثناء حفظ الحضور في قاعدة البيانات: ' + (res.error || 'يرجى المحاولة مرة أخرى'));
      }
    } catch (err: any) {
      console.error(err);
      alert('حدث خطأ غير متوقع: ' + (err?.message || ''));
    } finally {
      setIsSaving(false);
    }
  };

  // ==========================================
  // STATE: Attendance Report (تقرير الحضور والغياب بين تاريخين)
  // افتراضي: الشهر الحالي من أول يوم لآخر يوم
  // ==========================================
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = String(now.getMonth() + 1).padStart(2, '0');
  const defaultFirstDay = `${currentYear}-${currentMonthNum}-01`;
  const lastDayVal = new Date(currentYear, now.getMonth() + 1, 0).getDate();
  const defaultLastDay = `${currentYear}-${currentMonthNum}-${String(lastDayVal).padStart(2, '0')}`;

  const [reportDateFrom, setReportDateFrom] = useState<string>(defaultFirstDay);
  const [reportDateTo, setReportDateTo] = useState<string>(defaultLastDay);
  const [reportSheikhFilter, setReportSheikhFilter] = useState<string>(
    currentUser?.role === 'sheikh' ? String(currentSheikhId) : 'all'
  );
  const [reportSearchQuery, setReportSearchQuery] = useState<string>('');

  // Quick preset dates
  const setMonthPreset = (offsetMonths: number = 0) => {
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + offsetMonths);
    const yr = targetDate.getFullYear();
    const mo = String(targetDate.getMonth() + 1).padStart(2, '0');
    const lDay = new Date(yr, targetDate.getMonth() + 1, 0).getDate();
    setReportDateFrom(`${yr}-${mo}-01`);
    setReportDateTo(`${yr}-${mo}-${String(lDay).padStart(2, '0')}`);
  };

  // Report Students Filter
  const reportFilteredStudents = useMemo(() => {
    return students.filter(s => {
      // Status filter: active or has tracking in range
      const isActive = !s.status || s.status.toLowerCase() === 'active' || s.status === 'نشط';
      const matchesSheikh = reportSheikhFilter === 'all' || s.sheikhId === Number(reportSheikhFilter);
      const matchesSearch = !reportSearchQuery.trim() ||
        s.name.toLowerCase().includes(reportSearchQuery.trim().toLowerCase()) ||
        (s.civilId && s.civilId.includes(reportSearchQuery.trim()));

      return isActive && matchesSheikh && matchesSearch;
    });
  }, [students, reportSheikhFilter, reportSearchQuery]);

  // Calculate detailed attendance report data for each student
  const reportRows = useMemo(() => {
    return reportFilteredStudents.map(student => {
      const studentRecords = tracking.filter(
        t => t.studentId === student.id && t.date >= reportDateFrom && t.date <= reportDateTo
      );

      let presentDays = 0;
      let absentDays = 0;
      let excusedDays = 0;

      studentRecords.forEach(r => {
        if (r.att === 'حضوري' || r.att === 'اونلاين') {
          presentDays++;
        } else if (r.att === 'غائب') {
          absentDays++;
        } else if (r.att === 'مستأذن') {
          excusedDays++;
        }
      });

      const totalRecordedDays = studentRecords.length;
      const effectiveDays = presentDays + absentDays + excusedDays;
      const attendanceRate = effectiveDays > 0 ? Math.round((presentDays / effectiveDays) * 100) : 0;
      const sh = sheikhs.find(s => s.id === student.sheikhId);

      return {
        student,
        sheikhName: sh ? `${sh.halqaName} (${sh.name})` : 'غير محدد',
        totalRecordedDays,
        presentDays,
        absentDays,
        excusedDays,
        attendanceRate,
        studentRecords
      };
    });
  }, [reportFilteredStudents, tracking, reportDateFrom, reportDateTo, sheikhs]);

  // Aggregate stats for the report
  const reportAggregateStats = useMemo(() => {
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalExcused = 0;

    reportRows.forEach(r => {
      totalPresent += r.presentDays;
      totalAbsent += r.absentDays;
      totalExcused += r.excusedDays;
    });

    const totalSessions = totalPresent + totalAbsent + totalExcused;
    const avgRate = totalSessions > 0 ? Math.round((totalPresent / totalSessions) * 100) : 0;

    return {
      studentCount: reportRows.length,
      totalPresent,
      totalAbsent,
      totalExcused,
      totalSessions,
      avgRate
    };
  }, [reportRows]);

  // Print Report
  const handlePrint = () => {
    window.print();
  };

  // Export to Excel
  const handleExportExcel = () => {
    const data = reportRows.map((r, idx) => ({
      'م': idx + 1,
      'اسم الطالب': r.student.name,
      'الرقم المدني': r.student.civilId || '',
      'المرحلة': r.student.grade || '',
      'الحلقة / الشيخ': r.sheikhName,
      'أيام الحضور': r.presentDays,
      'أيام الغياب': r.absentDays,
      'أيام الاستئذان': r.excusedDays,
      'إجمالي الأيام المسجلة': r.totalRecordedDays,
      'نسبة الحضور (%)': `${r.attendanceRate}%`
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'تقرير الحضور والغياب');
    XLSX.writeFile(workbook, `تقرير_حضور_الطلاب_${reportDateFrom}_إلى_${reportDateTo}.xlsx`);
  };

  const selectedSheikhObj = sheikhs.find(s => s.id === selectedSheikhId);

  return (
    <div className="space-y-6">
      {/* Page Header (Hidden in Print) */}
      <div className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-2xl">
              <UserCheck className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                تسجيل ومتابعة حضور الطلاب
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تحضير طلاب الحلقات اليومي وإصدار كشوفات وتقارير الحضور والغياب المعتمدة
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('record')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'record'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>تسجيل الحضور اليومي</span>
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'report'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <CalendarRange className="w-4 h-4" />
              <span>تقرير الحضور بين تاريخين</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DAILY ATTENDANCE RECORDING (تسجيل الحضور اليومي) */}
      {/* ========================================================================= */}
      {activeTab === 'record' && (
        <div className="space-y-5">
          {/* Halqa & Date Selectors Card */}
          <div className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              {/* Halqa Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  اختر الحلقة / الشيخ
                </label>
                <select
                  value={selectedSheikhId}
                  onChange={(e) => setSelectedSheikhId(Number(e.target.value))}
                  disabled={currentUser?.role === 'sheikh'}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  {sheikhs.map(sh => (
                    <option key={sh.id} value={sh.id}>
                      {sh.halqaName} — الشيخ {sh.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  تاريخ التحضير
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-mono font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setRecordDate(todayStr)}
                    className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer"
                    title="الرجوع لتاريخ اليوم"
                  >
                    اليوم
                  </button>
                </div>
              </div>

              {/* Student Search */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  بحث في طلاب الحلقة
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="text"
                    value={recordSearchQuery}
                    onChange={(e) => setRecordSearchQuery(e.target.value)}
                    placeholder="ابحث بالاسم أو الرقم المدني..."
                    className="w-full pr-9 pl-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Quick Stats & Bulk Actions Bar */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Stats pills */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>الطلاب: {dailyStats.total}</span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold border border-emerald-200/50 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>الحاضرون: {dailyStats.presentCount}</span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold border border-rose-200/50 dark:border-rose-800">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>الغائبون: {dailyStats.absentCount}</span>
                </div>

                {dailyStats.excusedCount > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 rounded-xl text-xs font-bold border border-amber-200/50 dark:border-amber-800">
                    <Clock className="w-3.5 h-3.5" />
                    <span>مستأذن: {dailyStats.excusedCount}</span>
                  </div>
                )}

                <div className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold border border-indigo-200/50 dark:border-indigo-800 font-mono">
                  <span>نسبة الحضور: {dailyStats.presentRate}%</span>
                </div>
              </div>

              {/* Bulk actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleMarkAllPresent}
                  className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/60 dark:hover:bg-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  تحضير الكل (حاضر)
                </button>

                <button
                  type="button"
                  onClick={handleMarkAllAbsent}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  تحديد الكل كغائب
                </button>
              </div>
            </div>
          </div>

          {/* Success Banner */}
          {saveSuccessMsg && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Students Attendance Table / List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  قائمة طلاب الحلقة ({selectedSheikhObj?.halqaName || 'الحلقة'})
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  انقر على الحالة لتحضير الطالب الحاضر والباقي يظل مسجلاً كغائب تلقائياً
                </p>
              </div>

              {/* Save Button in table header */}
              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={isSaving || halqaStudents.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>حفظ الحضور والغياب</span>
                  </>
                )}
              </button>
            </div>

            {filteredHalqaStudents.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredHalqaStudents.map((student, idx) => {
                  const currentStatus = attendanceState[student.id] || 'غائب';
                  const isPresent = currentStatus === 'حضوري' || currentStatus === 'اونلاين';

                  return (
                    <div
                      key={student.id}
                      className={`p-4 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isPresent
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/10'
                          : currentStatus === 'مستأذن'
                          ? 'bg-amber-50/40 dark:bg-amber-950/10'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Student Info */}
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            {student.name}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 font-mono">
                            {student.civilId && <span>رقم مدني: {student.civilId}</span>}
                            <span>•</span>
                            <span>{student.grade || 'المتوسط'}</span>
                            {student.nationality && (
                              <>
                                <span>•</span>
                                <span>{student.nationality}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Attendance Selector Buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        {/* Present (حضوري) */}
                        <button
                          type="button"
                          onClick={() => handleSetStudentStatus(student.id, 'حضوري')}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            currentStatus === 'حضوري'
                              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-800'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>حاضر</span>
                        </button>

                        {/* Online (عن بعد) */}
                        <button
                          type="button"
                          onClick={() => handleSetStudentStatus(student.id, 'اونلاين')}
                          className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            currentStatus === 'اونلاين'
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-100 hover:text-blue-800'
                          }`}
                          title="حضور عن بعد (أونلاين)"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>أونلاين</span>
                        </button>

                        {/* Excused (مستأذن) */}
                        <button
                          type="button"
                          onClick={() => handleSetStudentStatus(student.id, 'مستأذن')}
                          className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            currentStatus === 'مستأذن'
                              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-100 hover:text-amber-800'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>مستأذن</span>
                        </button>

                        {/* Absent (غائب) */}
                        <button
                          type="button"
                          onClick={() => handleSetStudentStatus(student.id, 'غائب')}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            currentStatus === 'غائب'
                              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-100 hover:text-rose-800'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>غائب</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold">لا يوجد طلاب مسكنين في هذه الحلقة حالياً.</p>
              </div>
            )}

            {/* Bottom Save Bar */}
            {filteredHalqaStudents.length > 0 && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-500 font-bold">
                  تأكد من مراجعة الحضور والغياب ليوم {recordDate} قبل النقر على حفظ.
                </div>

                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري الحفظ في قاعدة البيانات...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>حفظ كشف الحضور والغياب</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ATTENDANCE REPORT BETWEEN TWO DATES (تقرير الحضور بين تاريخين) */}
      {/* ========================================================================= */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          {/* Report Filter Controls (Hidden in Print) */}
          <div className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <CalendarRange className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    تحديد فترة التقرير والخيارات (افتراضي: الشهر الحالي من أول يوم لآخر يوم)
                  </span>
                </div>

                {/* Preset shortcuts */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setMonthPreset(0)}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    الشهر الحالي
                  </button>
                  <button
                    type="button"
                    onClick={() => setMonthPreset(-1)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    الشهر السابق
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Date From */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    من تاريخ
                  </label>
                  <input
                    type="date"
                    value={reportDateFrom}
                    onChange={(e) => setReportDateFrom(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                {/* Date To */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    إلى تاريخ
                  </label>
                  <input
                    type="date"
                    value={reportDateTo}
                    onChange={(e) => setReportDateTo(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                {/* Halqa Filter */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    الحلقة
                  </label>
                  <select
                    value={reportSheikhFilter}
                    onChange={(e) => setReportSheikhFilter(e.target.value)}
                    disabled={currentUser?.role === 'sheikh'}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="all">جميع الحلقات</option>
                    {sheikhs.map(sh => (
                      <option key={sh.id} value={sh.id}>
                        {sh.halqaName} ({sh.name})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Student Search */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    بحث باسم الطالب
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                    <input
                      type="text"
                      value={reportSearchQuery}
                      onChange={(e) => setReportSearchQuery(e.target.value)}
                      placeholder="اسم الطالب..."
                      className="w-full pr-8 pl-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons: Print & Excel */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>تصدير Excel</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة التقرير</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Summary Cards (Visible in Screen, compact in print) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-[11px] font-bold text-slate-500 block mb-1">الطلاب في التقرير</span>
              <span className="text-xl font-black text-slate-800 dark:text-slate-100 font-mono">
                {reportAggregateStats.studentCount}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-[11px] font-bold text-emerald-600 block mb-1">إجمالي أيام الحضور</span>
              <span className="text-xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                {reportAggregateStats.totalPresent}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-[11px] font-bold text-rose-600 block mb-1">إجمالي أيام الغياب</span>
              <span className="text-xl font-black text-rose-700 dark:text-rose-400 font-mono">
                {reportAggregateStats.totalAbsent}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-[11px] font-bold text-indigo-600 block mb-1">نسبة الحضور العامة</span>
              <span className="text-xl font-black text-indigo-700 dark:text-indigo-400 font-mono">
                {reportAggregateStats.avgRate}%
              </span>
            </div>
          </div>

          {/* =================================================== */}
          {/* Printable Report Document / Presentation Table */}
          {/* =================================================== */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs print:border-none print:p-0 print:shadow-none">
            {/* Official Report Header */}
            <div className="flex justify-between items-center border-b-2 border-emerald-800 pb-4 mb-6">
              <div className="flex items-center gap-3">
                {centerInfo.logo ? (
                  <img src={centerInfo.logo} alt={centerInfo.name} className="w-16 h-16 object-contain rounded-xl bg-white p-1" />
                ) : (
                  <div className="w-12 h-12 bg-emerald-800 text-white rounded-xl flex items-center justify-center font-bold text-lg">
                    {centerInfo.name.charAt(0) || 'ق'}
                  </div>
                )}
                <div>
                  <h2 className="font-serif font-black text-emerald-950 text-base">{centerInfo.name}</h2>
                  <p className="text-[11px] text-slate-600">{centerInfo.address || 'مركز تحفيظ القرآن الكريم'}</p>
                </div>
              </div>

              <div className="text-center">
                <div className="inline-block border-2 border-emerald-800 bg-emerald-50 px-5 py-1.5 rounded-xl font-bold text-xs text-emerald-950">
                  تقرير وسجل حضور وغياب الطلاب
                </div>
                <div className="text-[11px] text-slate-600 mt-1 font-mono">
                  الفترة: من <span className="font-bold">{reportDateFrom}</span> إلى <span className="font-bold">{reportDateTo}</span>
                </div>
              </div>

              <div className="text-left text-[11px] text-slate-600">
                <div>تاريخ التصدير: <span className="font-mono">{todayStr}</span></div>
                <div>هاتف: {centerInfo.phone}</div>
              </div>
            </div>

            {/* Attendance Report Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-y border-slate-200 dark:border-slate-700">
                    <th className="p-3 text-center w-10">م</th>
                    <th className="p-3">اسم الطالب</th>
                    <th className="p-3">الحلقة / الشيخ</th>
                    <th className="p-3">المرحلة</th>
                    <th className="p-3 text-center">أيام الحضور</th>
                    <th className="p-3 text-center">أيام الغياب</th>
                    <th className="p-3 text-center">أيام الاستئذان</th>
                    <th className="p-3 text-center">إجمالي المسجل</th>
                    <th className="p-3 text-center min-w-32">نسبة الحضور</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {reportRows.length > 0 ? (
                    reportRows.map((row, idx) => (
                      <tr key={row.student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3 text-center font-mono font-bold text-slate-500">{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{row.student.name}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{row.sheikhName}</td>
                        <td className="p-3 text-slate-500">{row.student.grade || 'المتوسط'}</td>
                        <td className="p-3 text-center font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20">
                          {row.presentDays}
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-rose-700 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20">
                          {row.absentDays}
                        </td>
                        <td className="p-3 text-center font-mono text-amber-700 dark:text-amber-400">
                          {row.excusedDays}
                        </td>
                        <td className="p-3 text-center font-mono text-slate-500">
                          {row.totalRecordedDays}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  row.attendanceRate >= 80
                                    ? 'bg-emerald-600'
                                    : row.attendanceRate >= 50
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${row.attendanceRate}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold text-xs">{row.attendanceRate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400 font-bold">
                        لا توجد بيانات مطابقة لخيارات البحث والفترة المحددة.
                      </td>
                    </tr>
                  )}
                </tbody>

                {/* Table Footer Totals */}
                {reportRows.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-100 dark:bg-slate-800/90 font-bold border-t-2 border-slate-300 dark:border-slate-700">
                      <td colSpan={4} className="p-3 text-slate-800 dark:text-slate-200">
                        الإجمالي ({reportRows.length} طالب)
                      </td>
                      <td className="p-3 text-center font-mono text-emerald-800 dark:text-emerald-300">
                        {reportAggregateStats.totalPresent}
                      </td>
                      <td className="p-3 text-center font-mono text-rose-800 dark:text-rose-300">
                        {reportAggregateStats.totalAbsent}
                      </td>
                      <td className="p-3 text-center font-mono text-amber-800 dark:text-amber-300">
                        {reportAggregateStats.totalExcused}
                      </td>
                      <td className="p-3 text-center font-mono text-slate-600 dark:text-slate-300">
                        {reportAggregateStats.totalSessions}
                      </td>
                      <td className="p-3 text-center font-mono text-indigo-700 dark:text-indigo-300">
                        متوسط: {reportAggregateStats.avgRate}%
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Print Signatures Block */}
            <div className="hidden print:flex justify-between items-center mt-12 pt-6 border-t border-slate-300 text-xs font-bold text-slate-800">
              <div className="text-center w-48">
                <div>مشرف الحلقات</div>
                <div className="mt-8">...................................</div>
              </div>
              <div className="text-center w-48">
                <div>المشرف العام / المدير</div>
                <div className="mt-8">{centerInfo.managerName || '...................................'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
