import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Users2, ArrowLeft, ArrowRight, Search, Check, Sparkles, UserPlus, UserMinus } from 'lucide-react';

export const HalaqatManager: React.FC = () => {
  const { sheikhs, students, assignStudentToSheikh } = useApp();
  const [selectedSheikhId, setSelectedSheikhId] = useState<number>(sheikhs[0]?.id || 1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unassigned'>('all');

  const selectedSheikh = sheikhs.find(s => s.id === selectedSheikhId) || sheikhs[0];

  // Students in selected halqa
  const assignedStudents = students.filter(s => s.sheikhId === selectedSheikhId && s.status === 'Active');

  // Available students to assign (either without a sheikh or in other halaqat)
  const candidateStudents = students.filter(s => {
    if (s.status !== 'Active') return false;
    if (activeTab === 'unassigned') {
      return s.sheikhId === null;
    }
    return s.sheikhId !== selectedSheikhId;
  }).filter(s => s.name.includes(searchQuery) || s.civilId.includes(searchQuery));

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
              <p className="text-xs text-slate-400">إسناد الطلاب للمشايخ ونقلهم بين الحلقات بمرونة وسرعة</p>
            </div>
          </div>
        </div>

        {/* Sheikh Selector Tabs / Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {sheikhs.filter(s => s.active).map(sheikh => {
            const count = students.filter(s => s.sheikhId === sheikh.id && s.status === 'Active').length;
            const isSelected = selectedSheikhId === sheikh.id;
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
                  {count}
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">الطلاب المتاحين للتسكين والنقل</h3>
              <p className="text-xs text-slate-400">انقر على الزر لإضافة الطالب إلى حلقة {selectedSheikh?.name}</p>
            </div>

            {/* Filter tab */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${activeTab === 'all' ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-xs' : 'text-slate-500'}`}
              >
                الكل
              </button>
              <button
                onClick={() => setActiveTab('unassigned')}
                className={`px-2.5 py-1 rounded-lg transition-all ${activeTab === 'unassigned' ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-xs' : 'text-slate-500'}`}
              >
                غير مسكنين فقط
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
          <div className="space-y-2.5 overflow-y-auto max-h-[480px] pr-1 flex-1">
            {candidateStudents.length > 0 ? (
              candidateStudents.map(student => {
                const currentSheikhOfStudent = sheikhs.find(s => s.id === student.sheikhId);
                return (
                  <div
                    key={student.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-100">{student.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>المرحلة: {student.grade}</span>
                        <span>•</span>
                        <span>
                          {currentSheikhOfStudent ? `حلقة: ${currentSheikhOfStudent.name}` : 'غير مسكن بحلقة'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => assignStudentToSheikh(student.id, selectedSheikhId)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>إضافة للحلقة</span>
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                لا يوجد طلاب متاحين بهذا البحث
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
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-black">
                  {assignedStudents.length} طلاب
                </span>
              </h3>
              <p className="text-xs text-slate-400">المحفظ: {selectedSheikh?.name}</p>
            </div>
          </div>

          {/* Assigned Students List */}
          <div className="space-y-2.5 overflow-y-auto max-h-[530px] pr-1 flex-1">
            {assignedStudents.length > 0 ? (
              assignedStudents.map((student, idx) => (
                <div
                  key={student.id}
                  className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-100">{student.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>هاتف ولي الأمر: {student.parentPhone}</span>
                        <span>•</span>
                        <span>المرحلة: {student.grade}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => assignStudentToSheikh(student.id, null)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800 transition-all cursor-pointer"
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                    <span>إزالة</span>
                  </button>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                لا يوجد طلاب في هذه الحلقة حالياً، يمكنك إضافة طلاب من القائمة المقابلة.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
