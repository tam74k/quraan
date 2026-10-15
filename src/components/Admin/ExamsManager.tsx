import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Exam } from '../../types';
import { Award, Plus, Printer, X, Sparkles, CheckCircle, FileCheck, Search, Users, CheckSquare, Square, GraduationCap } from 'lucide-react';
import { CertificateModal } from '../Common/CertificateModal';
import { BatchCertificatesModal, BatchCertificateItem } from '../Common/BatchCertificatesModal';

export const ExamsManager: React.FC = () => {
  const { exams, students, sheikhs, addExam, halqaTypes } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [certExam, setCertExam] = useState<{ exam: Exam; studentName: string; sheikhName: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Batch Certificates State
  const [isBatchConfigOpen, setIsBatchConfigOpen] = useState(false);
  const [batchCertificatesData, setBatchCertificatesData] = useState<{
    certificates: BatchCertificateItem[];
    halqaTitle: string;
  } | null>(null);

  const [batchHalqaType, setBatchHalqaType] = useState<string>('all');
  const [batchSheikhId, setBatchSheikhId] = useState<string>('all');
  const [batchTitle, setBatchTitle] = useState('شهادة إتمام وتفوق قرآني');
  const [batchAchievement, setBatchAchievement] = useState('نظير تميزه واجتهاده في حلقة القرآن الكريم ومواظبته على حفظ ومراجعة آيات الذكر الحكيم وإتقانه لأحكام التلاوة والتجويد.');
  const [batchGrade, setBatchGrade] = useState('ممتاز مرتفع');
  const [batchDate, setBatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

  // Compute target students based on filters
  const targetStudents = students.filter(s => {
    if (s.status !== 'Active') return false;
    if (batchHalqaType !== 'all' && (s.halqaType || '') !== batchHalqaType) return false;
    if (batchSheikhId !== 'all' && String(s.sheikhId) !== batchSheikhId) return false;
    return true;
  });

  // Keep selected students in sync when target students change
  useEffect(() => {
    setSelectedStudentIds(targetStudents.map(s => s.id));
  }, [batchHalqaType, batchSheikhId, students]);

  // Dynamic template text when Halqa Type changes
  const handleHalqaTypeChange = (type: string) => {
    setBatchHalqaType(type);
    if (type === 'حلقة تلقين') {
      setBatchTitle('شهادة اجتياز حلقة التلقين');
      setBatchAchievement('نظير اجتهاده وتميزه في حلقة التلقين ومواظبته على حفظ وتلقين السور الكريمة وضبط مخارج الحروف وأحكام التجويد.');
    } else if (type === 'حلقة مميزة') {
      setBatchTitle('شهادة شرف وتميز قرآني');
      setBatchAchievement('نظير تفوقه واجتهاده المتميز في الحلقة المميزة ومواظبته على الحفظ المتقن والمراجعة الدقيقة لأجزاء القرآن الكريم.');
    } else if (type === 'حلقة نشء') {
      setBatchTitle('شهادة تفوق لحلقة النشء');
      setBatchAchievement('نظير تفوقه وتميزه في حلقة النشء ومواظبته على حفظ وتلاوة آيات كتاب الله العزيز وحسن الخلق.');
    } else if (type === 'حلقة تأسيس') {
      setBatchTitle('شهادة اجتياز حلقة التأسيس');
      setBatchAchievement('لاجتيازه مرحلة التأسيس القرآني بنجاح وإتقانه لمبادئ القراءة والتلاوة الصحيحة.');
    } else {
      setBatchTitle('شهادة إتمام وتفوق قرآني');
      setBatchAchievement('نظير تميزه واجتهاده في حلقة القرآن الكريم ومواظبته على حفظ ومراجعة آيات الذكر الحكيم وإتقانه لأحكام التلاوة والتجويد.');
    }
  };

  const [formData, setFormData] = useState({
    studentId: students[0]?.id || 1,
    type: 'اختبار 5 أجزاء' as Exam['type'],
    partOrSurah: 'من الجزء 1 إلى الجزء 5',
    grade: 'ممتاز' as Exam['grade'],
    score: 95,
    examiner: sheikhs[0]?.name || 'فضيلة الشيخ المختبر',
    notes: 'إتقان تام وتلاوة عذبة ومخارج حروف منضبطة.'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newExam = addExam({
      studentId: Number(formData.studentId),
      date: new Date().toISOString().split('T')[0],
      type: formData.type,
      partOrSurah: formData.partOrSurah,
      grade: formData.grade,
      score: Number(formData.score),
      examiner: formData.examiner,
      notes: formData.notes,
      certificateGenerated: true
    });

    setIsModalOpen(false);

    // Prompt to view certificate
    const st = students.find(s => s.id === Number(formData.studentId));
    if (st) {
      setCertExam({
        exam: newExam,
        studentName: st.name,
        sheikhName: formData.examiner
      });
    }
  };

  const filteredExams = exams.filter(e => {
    const st = students.find(s => s.id === e.studentId);
    return st?.name.includes(searchQuery) || e.type.includes(searchQuery) || e.partOrSurah.includes(searchQuery);
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">سجل الاختبارات القرآنية والشهادات</h2>
              <p className="text-xs text-slate-400">توثيق نتائج اختبارات الأجزاء وإصدار الشهادات الرسمية المعتمدة</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsBatchConfigOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-emerald-950 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            title="استخراج شهادات لجميع طلاب حلقة معينة (مثل حلقة مميزة أو تلقين) وطباعة الكل A4"
          >
            <GraduationCap className="w-4 h-4" />
            <span>+ استخراج شهادات حلقة كاملة (A4)</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ رصد نتيجة اختبار جديد</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم الطالب أو نوع الاختبار أو السورة..."
            className="w-full px-3.5 py-2 pl-9 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredExams.map(exam => {
          const student = students.find(s => s.id === exam.studentId);
          return (
            <div
              key={exam.id}
              className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
                    {exam.type}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{exam.date}</span>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{student?.name || 'طالب'}</h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">{exam.partOrSurah}</p>

                <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">التقدير:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{exam.grade}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">الدرجة:</span>
                    <span className="font-mono font-bold">{exam.score} / 100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">المختبِر:</span>
                    <span>{exam.examiner}</span>
                  </div>
                </div>

                {exam.notes && (
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic">
                    «{exam.notes}»
                  </p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setCertExam({
                    exam,
                    studentName: student?.name || 'الطالب',
                    sheikhName: exam.examiner
                  })}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-emerald-950 text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>معاينة وطباعة الشهادة</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Exam Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">رصد نتيجة اختبار قرآني</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">اختر الطالب</label>
                <select
                  required
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">نوع الاختبار</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Exam['type'] })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="اختبار جزء">اختبار جزء</option>
                    <option value="اختبار 3 أجزاء">اختبار 3 أجزاء</option>
                    <option value="اختبار 5 أجزاء">اختبار 5 أجزاء</option>
                    <option value="اختبار 10 أجزاء">اختبار 10 أجزاء</option>
                    <option value="اختبار نصف القرآن">اختبار نصف القرآن</option>
                    <option value="اختبار القرآن كاملاً">اختبار القرآن كاملاً</option>
                    <option value="اختبار سورة">اختبار سورة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">المقرر / النطاق</label>
                  <input
                    type="text"
                    required
                    value={formData.partOrSurah}
                    onChange={(e) => setFormData({ ...formData, partOrSurah: e.target.value })}
                    placeholder="من الجزء 1 إلى 5"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">التقدير</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value as Exam['grade'] })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="ممتاز مرتفع">ممتاز مرتفع</option>
                    <option value="ممتاز">ممتاز</option>
                    <option value="جيد جداً">جيد جداً</option>
                    <option value="جيد">جيد</option>
                    <option value="إعادة">إعادة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الدرجة (من 100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">اسم الشيخ / لجنة الاختبار</label>
                <input
                  type="text"
                  required
                  value={formData.examiner}
                  onChange={(e) => setFormData({ ...formData, examiner: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">ملاحظات التقييم والتجويد</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="ملاحظات حول ضبط الوقف والابتداء وأحكام التجويد..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
                >
                  اعتماد النتيجة والشهادة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Modal Preview */}
      {certExam && (
        <CertificateModal
          studentName={certExam.studentName}
          sheikhName={certExam.sheikhName}
          title={`شهادة اجتياز ${certExam.exam.type}`}
          achievementText={`لاجتيازه اختبار حفظ وإتقان ${certExam.exam.partOrSurah} بتقدير (${certExam.exam.grade}) وبدرجة (${certExam.exam.score}/100).`}
          grade={certExam.exam.grade}
          date={certExam.exam.date}
          autoPrint={true}
          onClose={() => setCertExam(null)}
        />
      )}

      {/* Batch Halqa Certificates Configuration Modal */}
      {isBatchConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 my-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                  <GraduationCap className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100">
                    استخراج شهادات لحلقة كاملة (طباعة الكل A4)
                  </h3>
                  <p className="text-xs text-slate-400">
                    إنشاء وتوليد شهادات مخصصة لجميع طلاب حلقة معينة وطباعتها دفعة واحدة
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBatchConfigOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const studentsToPrint = targetStudents.filter(s => selectedStudentIds.includes(s.id));
                if (studentsToPrint.length === 0) {
                  alert('يرجى تحديد طالب واحد على الأقل لاستخراج شهادته.');
                  return;
                }
                const certs: BatchCertificateItem[] = studentsToPrint.map(st => {
                  const sheikh = sheikhs.find(s => s.id === st.sheikhId);
                  return {
                    id: st.id,
                    studentName: st.name,
                    sheikhName: sheikh?.name || 'فضيلة المحفظ',
                    halqaName: sheikh?.halqaName || st.halqaType || 'الحلقة القرآنية',
                    halqaType: st.halqaType,
                    title: batchTitle,
                    achievementText: batchAchievement,
                    grade: batchGrade,
                    date: batchDate
                  };
                });

                const titleLabel = batchHalqaType !== 'all' ? batchHalqaType : (sheikhs.find(s => String(s.id) === batchSheikhId)?.halqaName || 'الحلقة');

                setBatchCertificatesData({
                  certificates: certs,
                  halqaTitle: titleLabel
                });
                setIsBatchConfigOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              {/* Halqa Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-amber-50/60 dark:bg-slate-800/60 border border-amber-200/80 dark:border-slate-700">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نوع الحلقة المستهدفة:
                  </label>
                  <select
                    value={batchHalqaType}
                    onChange={(e) => handleHalqaTypeChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="all">جميع أنواع الحلقات</option>
                    {halqaTypes.map(ht => (
                      <option key={ht} value={ht}>{ht}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    تصفية بحلقة الشيخ / المحفظ:
                  </label>
                  <select
                    value={batchSheikhId}
                    onChange={(e) => setBatchSheikhId(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="all">جميع المشايخ والحلقات</option>
                    {sheikhs.map(s => (
                      <option key={s.id} value={String(s.id)}>{s.name} ({s.halqaName})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title & Suggested Titles */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    عنوان الشهادة:
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setBatchTitle('شهادة حلقة مميزة')}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-amber-100 dark:bg-slate-800 text-[10px] text-amber-900 dark:text-amber-300 cursor-pointer"
                    >
                      حلقة مميزة
                    </button>
                    <button
                      type="button"
                      onClick={() => setBatchTitle('شهادة اجتياز حلقة التلقين')}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-amber-100 dark:bg-slate-800 text-[10px] text-amber-900 dark:text-amber-300 cursor-pointer"
                    >
                      حلقة تلقين
                    </button>
                    <button
                      type="button"
                      onClick={() => setBatchTitle('شهادة إتمام وتفوق قرآني')}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-amber-100 dark:bg-slate-800 text-[10px] text-amber-900 dark:text-amber-300 cursor-pointer"
                    >
                      إتمام وتفوق
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  required
                  value={batchTitle}
                  onChange={(e) => setBatchTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-bold"
                />
              </div>

              {/* Achievement Text */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نص التقدير والإنجاز المطبوع بالشهادة:
                </label>
                <textarea
                  rows={2}
                  required
                  value={batchAchievement}
                  onChange={(e) => setBatchAchievement(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Grade and Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    التقدير العام بالشهادة:
                  </label>
                  <select
                    value={batchGrade}
                    onChange={(e) => setBatchGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="ممتاز مرتفع">ممتاز مرتفع</option>
                    <option value="ممتاز">ممتاز</option>
                    <option value="جيد جداً">جيد جداً</option>
                    <option value="مجتاز للحلقة بنجاح">مجتاز للحلقة بنجاح</option>
                    <option value="">بدون تقدير</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    تاريخ التحرير:
                  </label>
                  <input
                    type="date"
                    required
                    value={batchDate}
                    onChange={(e) => setBatchDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Students Selection List */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-3 bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedStudentIds.length === targetStudents.length) {
                          setSelectedStudentIds([]);
                        } else {
                          setSelectedStudentIds(targetStudents.map(s => s.id));
                        }
                      }}
                      className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300 hover:underline cursor-pointer"
                    >
                      {selectedStudentIds.length === targetStudents.length && targetStudents.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                      <span>تحديد الكل ({targetStudents.length} طلاب)</span>
                    </button>
                  </div>

                  <span className="font-bold text-amber-800 dark:text-amber-300 text-xs">
                    المحدد للطباعة: {selectedStudentIds.length} من أصل {targetStudents.length} طالب
                  </span>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5">
                  {targetStudents.length === 0 ? (
                    <div className="p-4 text-center text-slate-400">
                      لا يوجد طلاب مطابقين للخيارات المحددة.
                    </div>
                  ) : (
                    targetStudents.map(st => {
                      const isSelected = selectedStudentIds.includes(st.id);
                      const sheikh = sheikhs.find(s => s.id === st.sheikhId);
                      return (
                        <label
                          key={st.id}
                          className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-white dark:bg-slate-900 border-emerald-300 dark:border-emerald-700 shadow-2xs'
                              : 'bg-transparent border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                setSelectedStudentIds(prev =>
                                  prev.includes(st.id) ? prev.filter(id => id !== st.id) : [...prev, st.id]
                                );
                              }}
                              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                            />
                            <span className="font-bold text-slate-800 dark:text-slate-100">{st.name}</span>
                            <span className="text-[10px] text-slate-400">({st.grade})</span>
                          </div>

                          <div className="flex items-center gap-2 text-[10px]">
                            {st.halqaType && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold">
                                {st.halqaType}
                              </span>
                            )}
                            <span className="text-slate-500">{sheikh?.name || 'بدون شيخ'}</span>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBatchConfigOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={selectedStudentIds.length === 0}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>معاينة وطباعة شهادات الحلقة ({selectedStudentIds.length} شهادة A4)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Certificates Modal Preview & Print */}
      {batchCertificatesData && (
        <BatchCertificatesModal
          certificates={batchCertificatesData.certificates}
          halqaTitle={batchCertificatesData.halqaTitle}
          onClose={() => setBatchCertificatesData(null)}
          autoPrint={true}
        />
      )}

    </div>
  );
};
