import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SmartSurahInput } from '../Common/SmartSurahInput';
import { FullTrackingModal } from './FullTrackingModal';
import { Student, TrackingRecord } from '../../types';
import {
  BookOpenCheck,
  Calendar,
  Save,
  CheckCircle2,
  Clock,
  UserCheck,
  Eye,
  Sparkles,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export const DailyRecitationSheet: React.FC = () => {
  const {
    currentUser,
    students,
    sheikhs,
    currentSheikh,
    tracking,
    saveBatchTrackingRecords,
    halqaTypes
  } = useApp();

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'data_entry';
  const [selectedSheikhId, setSelectedSheikhId] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedSheikhId && sheikhs.length > 0) {
      setSelectedSheikhId(currentSheikh?.id || sheikhs[0].id);
    }
  }, [sheikhs, currentSheikh, selectedSheikhId]);

  const activeSheikh = isAdmin ? sheikhs.find(s => s.id === selectedSheikhId) || sheikhs[0] : (currentSheikh || sheikhs[0]);
  const myStudents = students.filter(s => s.sheikhId === activeSheikh?.id && (s.status === 'Active' || s.status === 'active' || s.status === 'نشط' || !s.status));

  const [recitationDate, setRecitationDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTrackingStudent, setActiveTrackingStudent] = useState<Student | null>(null);

  // Bulk assignment state for "تسجيل مقرر الحفظ الجديد"
  const [bulkSurah, setBulkSurah] = useState('');
  const [bulkFrom, setBulkFrom] = useState<number | ''>('');
  const [bulkTo, setBulkTo] = useState<number | ''>('');
  const [bulkSuccess, setBulkSuccess] = useState('');

  const handleApplyBulk = () => {
    if (!bulkSurah) {
      alert('يرجى اختيار السورة أولاً.');
      return;
    }
    if (bulkFrom === '' || bulkTo === '') {
      alert('يرجى تحديد رقم آية البداية ونهاية الآيات.');
      return;
    }

    setGridRows(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(sId => {
        const idNum = Number(sId);
        // Only apply if student is present (or default)
        if (updated[idNum].att === 'حضوري' || updated[idNum].att === 'اونلاين') {
          updated[idNum] = {
            ...updated[idNum],
            newSurah: bulkSurah,
            newFrom: Number(bulkFrom),
            newTo: Number(bulkTo)
          };
        }
      });
      return updated;
    });

    setBulkSuccess(`تم تطبيق مقرر الحفظ الجديد (${bulkSurah} من ${bulkFrom} إلى ${bulkTo}) على جميع طلاب الحلقة في تاريخ ${recitationDate} بنجاح!`);
    setTimeout(() => setBulkSuccess(''), 4500);
  };

  // Local grid state for swift inline data-entry
  interface RowState {
    studentId: number;
    recordId?: number;
    newSurah: string;
    newFrom: number | '' | null;
    newTo: number | '' | null;
    revSurah: string;
    revFrom: number | '' | null;
    revTo: number | '' | null;
    revToSurah: string;
    revToFrom: number | '' | null;
    revToTo: number | '' | null;
    eval: TrackingRecord['eval'];
    notes: string;
    status: 'draft' | 'approved';
  }

  const [gridRows, setGridRows] = useState<Record<number, RowState>>({});

  // Populate gridRows based on selected date and tracking records
  useEffect(() => {
    const newGrid: Record<number, RowState> = {};
    myStudents.forEach(st => {
      const existing = tracking.find(t => t.studentId === st.id && t.date === recitationDate);
      if (existing) {
        newGrid[st.id] = {
          studentId: st.id,
          recordId: existing.id,
          newSurah: existing.newSurah || '',
          newFrom: existing.newFrom ?? '',
          newTo: existing.newTo ?? '',
          revSurah: existing.revSurah || '',
          revFrom: existing.revFrom ?? '',
          revTo: existing.revTo ?? '',
          revToSurah: existing.revToSurah || '',
          revToFrom: existing.revToFrom ?? '',
          revToTo: existing.revToTo ?? '',
          eval: existing.eval || '',
          notes: existing.notes || '',
          status: existing.status || 'approved'
        };
      } else {
        newGrid[st.id] = {
          studentId: st.id,
          newSurah: '',
          newFrom: '',
          newTo: '',
          revSurah: '',
          revFrom: '',
          revTo: '',
          revToSurah: '',
          revToFrom: '',
          revToTo: '',
          eval: 'ممتاز',
          notes: '',
          status: 'approved'
        };
      }
    });
    setGridRows(newGrid);
  }, [recitationDate, myStudents.length, tracking]);

  const updateRow = (studentId: number, fields: Partial<RowState>) => {
    setGridRows(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        ...fields
      }
    }));
  };

  const handleSaveAll = () => {
    const payload = Object.entries(gridRows).map(([sId, row]: [string, any]) => ({
      id: row.recordId,
      studentId: Number(sId),
      date: recitationDate,
      newSurah: row.newSurah,
      newFrom: row.newFrom === '' ? null : Number(row.newFrom),
      newTo: row.newTo === '' ? null : Number(row.newTo),
      revSurah: row.revSurah,
      revFrom: row.revFrom === '' ? null : Number(row.revFrom),
      revTo: row.revTo === '' ? null : Number(row.revTo),
      revToSurah: row.revToSurah,
      revToFrom: row.revToFrom === '' ? null : Number(row.revToFrom),
      revToTo: row.revToTo === '' ? null : Number(row.revToTo),
      eval: row.eval,
      notes: row.notes,
      status: row.status,
      readByParent: false,
      sheikhId: activeSheikh?.id
    }));

    saveBatchTrackingRecords(payload);
    setSuccessMsg('تم حفظ وتحديث جدول متابعة الحلقة لجميع الطلاب بنجاح!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const evalOptions: TrackingRecord['eval'][] = ['ممتاز', 'جيد جدا', 'جيد', 'مقبول', 'ضعيف', 'لم يحفظ'];
  const attOptions: TrackingRecord['att'][] = ['حضوري', 'اونلاين', 'غائب', 'مستأذن'];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              <BookOpenCheck className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">
                جدول متابعة وتسميع الحلقة اليومية
              </h2>
              <p className="text-xs text-slate-400">
                {activeSheikh?.halqaName} — فضيلة الشيخ / <strong className="text-emerald-700 dark:text-emerald-400">{activeSheikh?.name}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Date Selector & Save All Button */}
        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && (
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">اختر الحلقة:</span>
              <select
                value={activeSheikh?.id || ''}
                onChange={(e) => setSelectedSheikhId(Number(e.target.value))}
                className="text-xs font-bold bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
              >
                {sheikhs.map(s => (
                  <option key={s.id} value={s.id}>{s.halqaName} ({s.name})</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">تاريخ التسميع:</span>
            <input
              type="date"
              value={recitationDate}
              onChange={(e) => setRecitationDate(e.target.value)}
              className="text-xs font-bold bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleSaveAll}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>حفظ واعتماد جدول الحلقة</span>
          </button>
        </div>
      </div>

      {/* Bulk New Memorization Card */}
      <div className="bg-gradient-to-l from-emerald-900/10 via-slate-900/5 to-emerald-900/5 dark:from-emerald-950/40 dark:to-slate-900/80 p-5 sm:p-6 rounded-3xl border border-emerald-500/30 dark:border-emerald-500/20 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100">تسجيل مقرر الحفظ الجديد (الإدخال الجماعي)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">اختر السورة والآيات لتطبيقها دفعة واحدة على جميع طلاب الحلقة في التاريخ المحدد أعلاه</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="w-44">
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">السورة</label>
              <SmartSurahInput
                value={bulkSurah}
                onChange={setBulkSurah}
                placeholder="اختر السورة..."
              />
            </div>

            <div className="w-20">
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">من آية</label>
              <input
                type="number"
                min={1}
                value={bulkFrom === '' ? '' : bulkFrom}
                onChange={(e) => setBulkFrom(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="1"
                className="w-full px-3 py-2 text-center text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="w-20">
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">إلى آية</label>
              <input
                type="number"
                min={1}
                value={bulkTo === '' ? '' : bulkTo}
                onChange={(e) => setBulkTo(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="10"
                className="w-full px-3 py-2 text-center text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="pt-5">
              <button
                type="button"
                onClick={handleApplyBulk}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <span>تطبيق على كل الطلاب</span>
              </button>
            </div>
          </div>
        </div>

        {bulkSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{bulkSuccess}</span>
          </div>
        )}
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Recitation Grid Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold">
                <th className="p-4 w-48" rowSpan={2}>الطالب</th>
                <th className="p-2 text-center bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300 border-l border-slate-200 dark:border-slate-700" colSpan={3}>
                  مقرر الحفظ الجديد
                </th>
                <th className="p-2 text-center bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300 border-l border-slate-200 dark:border-slate-700" colSpan={6}>
                  مقرر المراجعة (من السورة - من آية - إلى آية - إلى السورة - من آية - إلى آية)
                </th>
                <th className="p-4 w-32 text-center" rowSpan={2}>التقييم</th>
                <th className="p-4 text-center w-24" rowSpan={2}>استمارة مفصلة</th>
              </tr>
              <tr className="bg-slate-100/70 dark:bg-slate-900/50 text-[11px] border-b border-slate-200 dark:border-slate-700">
                <th className="p-2 w-32">السورة</th>
                <th className="p-2 w-14 text-center">من آية</th>
                <th className="p-2 w-14 text-center border-l border-slate-200 dark:border-slate-700">إلى آية</th>
                <th className="p-2 w-32">من السورة</th>
                <th className="p-2 w-14 text-center">من آية</th>
                <th className="p-2 w-14 text-center">إلى آية</th>
                <th className="p-2 w-32 border-r border-slate-200 dark:border-slate-700">إلى السورة</th>
                <th className="p-2 w-14 text-center">من آية</th>
                <th className="p-2 w-14 text-center border-l border-slate-200 dark:border-slate-700">إلى آية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-800 dark:text-slate-200">
              {myStudents.length > 0 ? (
                myStudents.map(student => {
                  const row = gridRows[student.id] || {
                    newSurah: '',
                    newFrom: '',
                    newTo: '',
                    revSurah: '',
                    revFrom: '',
                    revTo: '',
                    revToSurah: '',
                    revToFrom: '',
                    revToTo: '',
                    eval: 'ممتاز',
                    notes: '',
                    status: 'approved'
                  };

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      {/* Student Name */}
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{student.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <span>المرحلة: {student.grade}</span>
                          <span>•</span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold">{student.currentJuz || 1} أجزاء</span>
                        </div>
                      </td>

                      {/* New Memorization */}
                      <td className="p-2">
                        {row.newSurah && (
                          <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 mb-1 truncate">
                            {row.newSurah} {row.newFrom !== '' && row.newTo !== '' ? `(${row.newFrom}-${row.newTo})` : ''}
                          </div>
                        )}
                        <SmartSurahInput
                          value={row.newSurah}
                          onChange={(name) => updateRow(student.id, { newSurah: name })}
                          placeholder="سورة الحفظ..."
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          min={1}
                          value={row.newFrom ?? ''}
                          onChange={(e) => updateRow(student.id, { newFrom: e.target.value === '' ? '' : Number(e.target.value) })}
                          placeholder="1"
                          className="w-14 px-2 py-1.5 text-center text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        />
                      </td>
                      <td className="p-2 text-center border-l border-slate-200 dark:border-slate-700">
                        <input
                          type="number"
                          min={1}
                          value={row.newTo ?? ''}
                          onChange={(e) => updateRow(student.id, { newTo: e.target.value === '' ? '' : Number(e.target.value) })}
                          placeholder="10"
                          className="w-14 px-2 py-1.5 text-center text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        />
                      </td>

                      {/* Revision Range (6 inputs) */}
                      <td className="p-2">
                        {row.revSurah && (
                          <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 mb-1 truncate">
                            {row.revSurah} {row.revFrom !== '' && row.revTo !== '' ? `(${row.revFrom}-${row.revTo})` : ''}
                          </div>
                        )}
                        <SmartSurahInput
                          value={row.revSurah}
                          onChange={(name) => updateRow(student.id, { revSurah: name })}
                          placeholder="سورة البداية..."
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          min={1}
                          value={row.revFrom ?? ''}
                          onChange={(e) => updateRow(student.id, { revFrom: e.target.value === '' ? '' : Number(e.target.value) })}
                          placeholder="1"
                          className="w-14 px-2 py-1.5 text-center text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          min={1}
                          value={row.revTo ?? ''}
                          onChange={(e) => updateRow(student.id, { revTo: e.target.value === '' ? '' : Number(e.target.value) })}
                          placeholder="20"
                          className="w-14 px-2 py-1.5 text-center text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        />
                      </td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700">
                        {row.revToSurah && (
                          <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 mb-1 truncate">
                            {row.revToSurah} {row.revToFrom !== '' && row.revToTo !== '' ? `(${row.revToFrom}-${row.revToTo})` : ''}
                          </div>
                        )}
                        <SmartSurahInput
                          value={row.revToSurah}
                          onChange={(name) => updateRow(student.id, { revToSurah: name })}
                          placeholder="سورة النهاية..."
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          min={1}
                          value={row.revToFrom ?? ''}
                          onChange={(e) => updateRow(student.id, { revToFrom: e.target.value === '' ? '' : Number(e.target.value) })}
                          placeholder="1"
                          className="w-14 px-2 py-1.5 text-center text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        />
                      </td>
                      <td className="p-2 text-center border-l border-slate-200 dark:border-slate-700">
                        <input
                          type="number"
                          min={1}
                          value={row.revToTo ?? ''}
                          onChange={(e) => updateRow(student.id, { revToTo: e.target.value === '' ? '' : Number(e.target.value) })}
                          placeholder="20"
                          className="w-14 px-2 py-1.5 text-center text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        />
                      </td>

                      {/* Evaluation */}
                      <td className="p-2 text-center">
                        <select
                          value={row.eval}
                          onChange={(e) => updateRow(student.id, { eval: e.target.value as TrackingRecord['eval'] })}
                          className={`px-2 py-1.5 rounded-xl text-xs font-bold border focus:outline-none disabled:opacity-40 ${
                            row.eval === 'ممتاز'
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-300'
                              : row.eval === 'جيد جدا'
                              ? 'bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-200 border-teal-300'
                              : row.eval === 'جيد'
                              ? 'bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border-blue-300'
                              : 'bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border-amber-300'
                          }`}
                        >
                          {evalOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </td>

                      {/* Detail Drawer Button */}
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => setActiveTrackingStudent(student)}
                          className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          title="عرض الاستمارة المفصلة والسجل التاريخي"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-slate-400">
                    لا يوجد طلاب مسجلين في حلقتك حالياً، يرجى مراجعة إدارة المركز لإسناد الطلاب.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Full Tracking Modal */}
      {activeTrackingStudent && (
        <FullTrackingModal
          student={activeTrackingStudent}
          selectedDate={recitationDate}
          onClose={() => setActiveTrackingStudent(null)}
        />
      )}

    </div>
  );
};
