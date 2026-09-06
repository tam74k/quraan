import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, TrackingRecord } from '../../types';
import { SmartSurahInput } from '../Common/SmartSurahInput';
import { QuranMushafVisualizer } from '../Common/QuranMushafVisualizer';
import {
  FileSpreadsheet,
  X,
  Save,
  CheckCircle2,
  Clock,
  History,
  Sparkles,
  BookOpen,
  MessageSquare,
  Award
} from 'lucide-react';

interface FullTrackingModalProps {
  student: Student;
  selectedDate: string;
  onClose: () => void;
}

export const FullTrackingModal: React.FC<FullTrackingModalProps> = ({
  student,
  selectedDate: initialDate,
  onClose
}) => {
  const { tracking, saveTrackingRecord, sheikhs } = useApp();

  const [date, setDate] = useState(initialDate);
  const [activeTab, setActiveTab] = useState<'form' | 'history' | 'mushaf'>('form');

  const [formData, setFormData] = useState({
    id: undefined as number | undefined,
    newSurah: '',
    newFrom: '' as number | '',
    newTo: '' as number | '',
    revSurah: '',
    revFrom: '' as number | '',
    revTo: '' as number | '',
    revToSurah: '',
    revToFrom: '' as number | '',
    revToTo: '' as number | '',
    bigRevSurah: '',
    bigRevFrom: '' as number | '',
    bigRevTo: '' as number | '',
    eval: 'ممتاز' as TrackingRecord['eval'],
    tajweedEval: 'متقن' as TrackingRecord['tajweedEval'],
    notes: '',
    status: 'approved' as TrackingRecord['status']
  });

  // Load record on date change
  useEffect(() => {
    const existing = tracking.find(t => t.studentId === student.id && t.date === date);
    if (existing) {
      setFormData({
        id: existing.id,
        newSurah: existing.newSurah || '',
        newFrom: existing.newFrom ?? '',
        newTo: existing.newTo ?? '',
        revSurah: existing.revSurah || '',
        revFrom: existing.revFrom ?? '',
        revTo: existing.revTo ?? '',
        revToSurah: existing.revToSurah || '',
        revToFrom: existing.revToFrom ?? '',
        revToTo: existing.revToTo ?? '',
        bigRevSurah: existing.bigRevSurah || '',
        bigRevFrom: existing.bigRevFrom ?? '',
        bigRevTo: existing.bigRevTo ?? '',
        eval: existing.eval || 'ممتاز',
        tajweedEval: existing.tajweedEval || 'متقن',
        notes: existing.notes || '',
        status: existing.status || 'approved'
      });
    } else {
      setFormData({
        id: undefined,
        newSurah: '',
        newFrom: '',
        newTo: '',
        revSurah: '',
        revFrom: '',
        revTo: '',
        revToSurah: '',
        revToFrom: '',
        revToTo: '',
        bigRevSurah: '',
        bigRevFrom: '',
        bigRevTo: '',
        eval: 'ممتاز',
        tajweedEval: 'متقن',
        notes: '',
        status: 'approved'
      });
    }
  }, [date, student.id, tracking]);

  const handleSubmit = (statusType: 'draft' | 'approved') => {
    saveTrackingRecord({
      id: formData.id,
      studentId: student.id,
      date,
      newSurah: formData.newSurah,
      newFrom: formData.newFrom === '' ? null : Number(formData.newFrom),
      newTo: formData.newTo === '' ? null : Number(formData.newTo),
      revSurah: formData.revSurah,
      revFrom: formData.revFrom === '' ? null : Number(formData.revFrom),
      revTo: formData.revTo === '' ? null : Number(formData.revTo),
      revToSurah: formData.revToSurah,
      revToFrom: formData.revToFrom === '' ? null : Number(formData.revToFrom),
      revToTo: formData.revToTo === '' ? null : Number(formData.revToTo),
      bigRevSurah: formData.bigRevSurah,
      bigRevFrom: formData.bigRevFrom === '' ? null : Number(formData.bigRevFrom),
      bigRevTo: formData.bigRevTo === '' ? null : Number(formData.bigRevTo),
      eval: formData.eval,
      tajweedEval: formData.tajweedEval,
      notes: formData.notes,
      status: statusType,
      readByParent: false,
      sheikhId: student.sheikhId || undefined
    });

    onClose();
  };

  const studentHistory = tracking
    .filter(t => t.studentId === student.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black flex items-center justify-center">
              {student.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                استمارة التسميع التفصيلية: {student.name}
              </h3>
              <p className="text-xs text-slate-400">
                المرحلة: {student.grade} • الهدف: {student.targetJuz || 5} أجزاء
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mb-6 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('form')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'form'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            استمارة التسميع والرصد
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'history'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            السجل التاريخي ({studentHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('mushaf')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'mushaf'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            مصحف الإنجاز (خريطة السور)
          </button>
        </div>

        {/* Tab 1: Recitation Form */}
        {activeTab === 'form' && (
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit('approved'); }} className="space-y-5">
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">تاريخ التسميع</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            {/* 1. New Memorization Section */}
            <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-emerald-800 dark:text-emerald-300">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>مقرر الحفظ الجديد (الدرس اليومي)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">السورة</label>
                  <SmartSurahInput
                    value={formData.newSurah}
                    onChange={(name) => setFormData({ ...formData, newSurah: name })}
                    placeholder="اختر السورة..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">من آية</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.newFrom}
                    onChange={(e) => setFormData({ ...formData, newFrom: e.target.value === '' ? '' : Number(e.target.value) })}
                    placeholder="1"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">إلى آية</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.newTo}
                    onChange={(e) => setFormData({ ...formData, newTo: e.target.value === '' ? '' : Number(e.target.value) })}
                    placeholder="20"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 2. Revision Section (Range: من السورة - من آية - إلى آية - إلى السورة - من آية - إلى آية) */}
            <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-amber-800 dark:text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>مقرر المراجعة (من السورة - من آية - إلى آية - إلى السورة - من آية - إلى آية)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">من السورة</label>
                  <SmartSurahInput
                    value={formData.revSurah}
                    onChange={(name) => setFormData({ ...formData, revSurah: name })}
                    placeholder="سورة البداية..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">من آية</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.revFrom}
                    onChange={(e) => setFormData({ ...formData, revFrom: e.target.value === '' ? '' : Number(e.target.value) })}
                    placeholder="1"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">إلى آية</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.revTo}
                    onChange={(e) => setFormData({ ...formData, revTo: e.target.value === '' ? '' : Number(e.target.value) })}
                    placeholder="20"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-amber-200/50">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">إلى السورة</label>
                  <SmartSurahInput
                    value={formData.revToSurah}
                    onChange={(name) => setFormData({ ...formData, revToSurah: name })}
                    placeholder="سورة النهاية..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">من آية</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.revToFrom}
                    onChange={(e) => setFormData({ ...formData, revToFrom: e.target.value === '' ? '' : Number(e.target.value) })}
                    placeholder="1"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">إلى آية</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.revToTo}
                    onChange={(e) => setFormData({ ...formData, revToTo: e.target.value === '' ? '' : Number(e.target.value) })}
                    placeholder="20"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Evaluation & Tajweed */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">التقييم العام للتسميع</label>
                <select
                  value={formData.eval}
                  onChange={(e) => setFormData({ ...formData, eval: e.target.value as TrackingRecord['eval'] })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="ممتاز">ممتاز ⭐⭐⭐</option>
                  <option value="جيد جدا">جيد جداً ⭐⭐</option>
                  <option value="جيد">جيد ⭐</option>
                  <option value="مقبول">مقبول</option>
                  <option value="ضعيف">ضعيف</option>
                  <option value="لم يحفظ">لم يحفظ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">تقييم أحكام التجويد ومخارج الحروف</label>
                <select
                  value={formData.tajweedEval}
                  onChange={(e) => setFormData({ ...formData, tajweedEval: e.target.value as TrackingRecord['tajweedEval'] })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="متقن">متقن ومجود تماماً</option>
                  <option value="جيد">جيد مع ملاحظات خفيفة</option>
                  <option value="يحتاج مراجعة أحكام">يحتاج تركيز في الغنن والمدود</option>
                </select>
              </div>
            </div>

            {/* Notes to Parents */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>ملاحظات وتوجيهات لولي الأمر (تظهر في حسابه فوراً)</span>
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="اكتب رسالة أو توجيه لولي أمر الطالب..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              ></textarea>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleSubmit('draft')}
                className="px-4 py-2.5 rounded-xl border border-amber-400 text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-xs font-bold transition-all cursor-pointer"
              >
                حفظ كمسودة مؤقتة
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
                >
                  اعتماد السجل النهائي
                </button>
              </div>
            </div>

          </form>
        )}

        {/* Tab 2: Historical Logs */}
        {activeTab === 'history' && (
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {studentHistory.length > 0 ? (
              studentHistory.map(record => (
                <div
                  key={record.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{record.date}</span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                        {record.eval || 'ممتاز'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {record.att}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                    <div>
                      <span className="text-slate-400">حفظ جديد:</span>{' '}
                      <strong>{record.newSurah ? `${record.newSurah} (${record.newFrom}-${record.newTo})` : '—'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">مراجعة:</span>{' '}
                      <strong>{record.revSurah ? `${record.revSurah} (${record.revFrom}-${record.revTo})` : '—'}</strong>
                    </div>
                  </div>

                  {record.notes && (
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-[11px] italic">
                      «{record.notes}»
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                لا توجد سجلات متابعة مسجلة لهذا الطالب بعد.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Mushaf Map Visualizer */}
        {activeTab === 'mushaf' && (
          <div className="max-h-[500px] overflow-y-auto">
            <QuranMushafVisualizer
              studentName={student.name}
              trackingHistory={studentHistory}
            />
          </div>
        )}

      </div>
    </div>
  );
};
