import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users2,
  Search,
  UserPlus,
  UserMinus,
  ArrowRightLeft,
  RefreshCw,
  Loader2,
  CheckCircle2
} from 'lucide-react';

export const HalaqatManager: React.FC = () => {
  const { sheikhs, students, assignStudentToSheikh, refreshData } = useApp();
  const activeSheikhs = sheikhs.filter(s => s.active);
  const [selectedSheikhId, setSelectedSheikhId] = useState<number>(activeSheikhs[0]?.id || 1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'unassigned' | 'other'>('all');
  const [loadingStudentId, setLoadingStudentId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (activeSheikhs.length > 0 && !activeSheikhs.find(s => s.id === selectedSheikhId)) {
      setSelectedSheikhId(activeSheikhs[0].id);
    }
  }, [activeSheikhs, selectedSheikhId]);

  const selectedSheikh = activeSheikhs.find(s => s.id === selectedSheikhId) || activeSheikhs[0];
  const activeSelectedId = selectedSheikh?.id || 0;

  // Students in selected halqa
  const assignedStudents = students.filter(s => s.sheikhId === activeSelectedId && s.status === 'Active');

  // Available students to assign or transfer (all active students NOT currently in this halqa)
  const candidateStudents = students.filter(s => {
    if (s.status !== 'Active') return false;
    // Exclude students already in the currently selected halqa
    if (s.sheikhId === activeSelectedId) return false;

    if (filterMode === 'unassigned') return !s.sheikhId;
    if (filterMode === 'other') return !!s.sheikhId;
    return true;
  }).filter(s => s.name.includes(searchQuery) || (s.civilId && s.civilId.includes(searchQuery)));

  const handleAssign = async (studentId: number, studentName: string, isTransfer: boolean) => {
    if (!activeSelectedId) return;
    setLoadingStudentId(studentId);
    try {
      const res = await assignStudentToSheikh(studentId, activeSelectedId);
      if (res && res.success) {
        setSuccessMsg(
          isTransfer
            ? `تم نقل الطالب (${studentName}) إلى حلقة (${selectedSheikh?.halqaName || selectedSheikh?.name}) بنجاح!`
            : `تم تسكين الطالب (${studentName}) في حلقة (${selectedSheikh?.halqaName || selectedSheikh?.name}) بنجاح!`
        );
        setTimeout(() => setSuccessMsg(''), 4500);
      }
    } finally {
      setLoadingStudentId(null);
    }
  };

  const handleRemove = async (studentId: number, studentName: string) => {
    setLoadingStudentId(studentId);
    try {
      const res = await assignStudentToSheikh(studentId, null);
      if (res && res.success) {
        setSuccessMsg(`تم إزالة الطالب (${studentName}) من الحلقة وأصبح غير مسكن.`);
        setTimeout(() => setSuccessMsg(''), 4500);
      }
    } finally {
      setLoadingStudentId(null);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (refreshData) {
        await refreshData();
      }
      setSuccessMsg('تم تحديث البيانات من السيرفر بنجاح.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              <Users2 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">تكوين وتوزيع الحلقات والمجموعات</h2>
              <p className="text-xs text-slate-400">إسناد الطلاب للمشايخ ونقلهم بين الحلقات بمرونة وسرعة مع الحفظ التلقائي في قاعدة البيانات</p>
            </div>
          </div>
        </div>

        {/* Action button: Refresh */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
            title="تحديث البيانات فورياً من الخادم ومزامنة الأجهزة"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{isRefreshing ? 'جاري المزامنة...' : 'تحديث البيانات'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 shadow-xs transition-all">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Sheikh Selector Tabs / Pills */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="text-xs font-bold text-slate-500 mb-2">اختر الحلقة المستهدفة للإدارة:</div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {sheikhs.filter(s => s.active).map(sheikh => {
            const count = students.filter(s => s.sheikhId === sheikh.id && s.status === 'Active').length;
            const isSelected = activeSelectedId === sheikh.id;
            return (
              <button
                key={sheikh.id}
                onClick={() => setSelectedSheikhId(sheikh.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-emerald-700 border-emerald-700 text-white shadow-md'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <span>{sheikh.halqaName}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isSelected ? 'bg-emerald-800 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>
                  {count} طلاب
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two columns management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Candidates & Available Students */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col h-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                الطلاب المتاحين للتسكين أو النقل
              </h3>
              <p className="text-xs text-slate-400">
                انقر على الزر لإضافة أو نقل الطالب إلى حلقة <strong className="text-emerald-700 dark:text-emerald-400">{selectedSheikh?.halqaName}</strong>
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  filterMode === 'all'
                    ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                الكل
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('unassigned')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  filterMode === 'unassigned'
                    ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                غير المسكنين
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('other')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  filterMode === 'other'
                    ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                حلقات أخرى (نقل)
              </button>
            </div>
          </div>

          {/* Search box */}
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم الطالب أو الرقم المدني..."
              className="w-full px-3.5 py-2 pl-9 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Candidates List */}
          <div className="space-y-2.5 overflow-y-auto max-h-[500px] pr-1 flex-1">
            {candidateStudents.length > 0 ? (
              candidateStudents.map(student => {
                const currentSheikhOfStudent = sheikhs.find(s => s.id === student.sheikhId);
                const isTransfer = !!student.sheikhId;
                const isLoading = loadingStudentId === student.id;

                return (
                  <div
                    key={student.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:border-emerald-300 dark:hover:border-emerald-700 transition-all gap-3"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-100">{student.name}</div>
                      <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2 mt-0.5">
                        <span>المرحلة: {student.grade}</span>
                        <span>•</span>
                        {isTransfer ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-[10px]">
                            حلقة: {currentSheikhOfStudent?.halqaName || currentSheikhOfStudent?.name || 'أخرى'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px]">
                            غير مسكن بحلقة
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAssign(student.id, student.name, isTransfer)}
                      disabled={!activeSelectedId || isLoading}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition-all shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-white ${
                        isTransfer
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>جاري الحفظ...</span>
                        </>
                      ) : isTransfer ? (
                        <>
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          <span>نقل للحلقة</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>إضافة للحلقة</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                لا يوجد طلاب متاحين يطابقون خيارات البحث أو التصفية الحالية
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Students in Selected Halqa */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
                <span>الطلاب المسجلين في: {selectedSheikh?.halqaName}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-black">
                  {assignedStudents.length} طلاب
                </span>
              </h3>
              <p className="text-xs text-slate-400">المحفظ: {selectedSheikh?.name}</p>
            </div>
          </div>

          {/* Assigned Students List */}
          <div className="space-y-2.5 overflow-y-auto max-h-[550px] pr-1 flex-1">
            {assignedStudents.length > 0 ? (
              assignedStudents.map((student, idx) => {
                const isLoading = loadingStudentId === student.id;

                return (
                  <div
                    key={student.id}
                    className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-xs text-slate-800 dark:text-slate-100">{student.name}</div>
                        <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2 mt-0.5">
                          <span>هاتف ولي الأمر: {student.parentPhone}</span>
                          <span>•</span>
                          <span>المرحلة: {student.grade}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemove(student.id, student.name)}
                      disabled={isLoading}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                      title="إزالة الطالب من هذه الحلقة ليصبح غير مسكن"
                    >
                      {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <UserMinus className="w-3.5 h-3.5" />
                      )}
                      <span>إزالة</span>
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                لا يوجد طلاب في هذه الحلقة حالياً، يمكنك إضافة طلاب أو نقلهم من القائمة المقابلة.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
