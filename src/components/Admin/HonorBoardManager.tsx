import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Crown, Sparkles, Plus, Award, Star, Flame, Trophy, X, Printer, FileText, Scissors } from 'lucide-react';
import { Badge } from '../../types';
import { CertificateModal } from '../Common/CertificateModal';
import { BadgesPrintModal, PrintableBadgeItem } from '../Common/BadgesPrintModal';

export const HonorBoardManager: React.FC = () => {
  const { students, sheikhs, badges, addBadge, centerInfo } = useApp();

  const effectiveManagerSignature =
    centerInfo.managerSignature ||
    (typeof window !== 'undefined' ? localStorage.getItem('center_manager_signature') : '') ||
    '';
  const effectiveLogo =
    centerInfo.logo ||
    (typeof window !== 'undefined' ? localStorage.getItem('center_logo') : '') ||
    '';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBadgeForCert, setSelectedBadgeForCert] = useState<{
    studentName: string;
    sheikhName: string;
    title: string;
    achievementText: string;
    grade: string;
    badgeIcon: string;
    date: string;
  } | null>(null);

  const [showBadgesPrintModal, setShowBadgesPrintModal] = useState(false);
  const [selectedBadgeForPrintModal, setSelectedBadgeForPrintModal] = useState<PrintableBadgeItem | null>(null);

  const [formData, setFormData] = useState({
    studentId: students[0]?.id || 1,
    name: 'قارئ الشهر المتميز',
    icon: '👑',
    description: 'تحقيق أعلى معدل إتقان وتسميع يومي بدون أي غياب.'
  });

  const topStudents = [...students].sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 6);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBadge({
      studentId: Number(formData.studentId),
      name: formData.name,
      icon: formData.icon,
      description: formData.description,
      dateEarned: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(false);
  };

  const badgeIcons = ['👑', '⭐', '🌟', '🏆', '💎', '🎖️', '🔥', '📖'];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-linear-to-r from-amber-900 via-amber-800 to-amber-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold mb-3 border border-amber-400/30">
            <Crown className="w-3.5 h-3.5" />
            <span>لوحة الشرف والتميز القرآني</span>
          </div>
          <h2 className="text-2xl font-black mb-1">فرسان القرآن وحفاظ الوحي</h2>
          <p className="text-amber-100/80 text-xs sm:text-sm">
            تكريم الطلاب الأوائل والمواظبين في حلقات تحفيظ القرآن الكريم
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setSelectedBadgeForPrintModal(null);
              setShowBadgesPrintModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer"
            title="طباعة وتوزيع الأوسمة للطلاب بالتنسيق المناسب للقص والتوزيع"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة وتوزيع الأوسمة (PDF)</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ منح وسام / تكريم لطالب</span>
          </button>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topStudents.slice(0, 3).map((st, idx) => {
          const sheikh = sheikhs.find(s => s.id === st.sheikhId);
          const medal = idx === 0 ? '🥇 المركز الأول' : idx === 1 ? '🥈 المركز الثاني' : '🥉 المركز الثالث';
          const medalBg = idx === 0
            ? 'border-amber-400 bg-linear-to-b from-amber-50/80 to-white dark:from-amber-950/30 dark:to-slate-900'
            : idx === 1
            ? 'border-slate-300 bg-linear-to-b from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900'
            : 'border-amber-600/40 bg-linear-to-b from-amber-50/40 to-white dark:from-amber-950/20 dark:to-slate-900';

          return (
            <div
              key={st.id}
              className={`p-6 rounded-3xl border-2 shadow-xs text-center flex flex-col items-center justify-between ${medalBg}`}
            >
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 mb-4">
                  {medal}
                </span>

                <div className="w-16 h-16 rounded-full bg-linear-to-tr from-amber-500 to-amber-300 text-amber-950 font-black text-2xl flex items-center justify-center mx-auto shadow-md mb-3">
                  {st.name.charAt(0)}
                </div>

                <h3 className="font-black text-base text-slate-900 dark:text-slate-100">{st.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {sheikh ? sheikh.halqaName : 'حلقة عامة'}
                </p>

                <div className="mt-4 flex items-center justify-center gap-4 text-xs font-semibold">
                  <div>
                    <span className="block text-lg font-black text-emerald-700 dark:text-emerald-400">{st.points || 0}</span>
                    <span className="text-[10px] text-slate-400">نقطة تميز</span>
                  </div>
                  <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
                  <div>
                    <span className="block text-lg font-black text-amber-600 dark:text-amber-400">{st.currentJuz || 1}</span>
                    <span className="text-[10px] text-slate-400">أجزاء محفوظة</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 w-full pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                المرحلة: {st.grade}
              </div>
            </div>
          );
        })}
      </div>

      {/* Awarded Badges Feed */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">سجل الأوسمة والتكريمات الممنوحة</h3>
            <span className="text-xs px-2.5 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded-full font-bold">
              {badges.length} وسام
            </span>
          </div>

          {badges.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSelectedBadgeForPrintModal(null);
                setShowBadgesPrintModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs font-bold rounded-xl transition-all cursor-pointer border border-emerald-300 dark:border-emerald-700 shadow-xs"
              title="طباعة وتوزيع بطاقات الأوسمة على الطلاب"
            >
              <Printer className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>طباعة وتوزيع بطاقات الأوسمة (PDF)</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map(b => {
            const student = students.find(s => s.id === b.studentId);
            const sheikh = sheikhs.find(s => s.id === student?.sheikhId);
            return (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl p-2 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center shrink-0">
                    {b.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">{b.name}</h4>
                      <span className="text-[10px] text-slate-400 shrink-0 mr-1">{b.dateEarned}</span>
                    </div>
                    <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                      الطالب: {student?.name || 'طالب'}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {b.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedBadgeForPrintModal({
                      id: b.id,
                      studentId: b.studentId,
                      studentName: student?.name || 'الطالب المكرم',
                      sheikhName: sheikh?.name || 'فضيلة المحفظ',
                      halqaName: sheikh?.halqaName || 'الحلقة القرآنية',
                      badgeName: b.name,
                      badgeIcon: b.icon,
                      description: b.description,
                      dateEarned: b.dateEarned
                    });
                    setShowBadgesPrintModal(true);
                  }}
                  className="mt-3 w-full py-1.5 px-3 bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/80 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  title="طباعة بطاقة الوسام أو حفظها بتنسيق PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>طباعة بطاقة الوسام للتوزيع (PDF)</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grant Badge Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">منح وسام تشجيعي لطالب</h3>
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

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">عنوان الوسام / الجائزة</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: قارئ الأسبوع المتميز"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">أيقونة الوسام</label>
                <div className="flex items-center gap-2">
                  {badgeIcons.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`text-xl p-2 rounded-xl border transition-all ${
                        formData.icon === icon
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950 scale-110'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">سبب منح الوسام والرسالة التشجيعية</label>
                <textarea
                  rows={2}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-emerald-950 text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
                >
                  منح الوسام
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. Individual Badge Certificate Modal (A4 Print / Save PDF) */}
      {selectedBadgeForCert && (
        <CertificateModal
          studentName={selectedBadgeForCert.studentName}
          sheikhName={selectedBadgeForCert.sheikhName}
          title={selectedBadgeForCert.title}
          achievementText={selectedBadgeForCert.achievementText}
          grade={selectedBadgeForCert.grade}
          badgeIcon={selectedBadgeForCert.badgeIcon}
          date={selectedBadgeForCert.date}
          autoPrint={true}
          onClose={() => setSelectedBadgeForCert(null)}
        />
      )}

      {/* 2. Badges Printing & Distribution Modal (Individual or Batch with zero clipping) */}
      {showBadgesPrintModal && (
        <BadgesPrintModal
          onClose={() => {
            setShowBadgesPrintModal(false);
            setSelectedBadgeForPrintModal(null);
          }}
          preselectedBadge={selectedBadgeForPrintModal || undefined}
        />
      )}

    </div>
  );
};
