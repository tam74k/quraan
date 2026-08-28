import React from 'react';
import { useApp } from '../../context/AppContext';
import { Award, Printer, X, Sparkles } from 'lucide-react';

interface CertificateModalProps {
  studentName: string;
  sheikhName?: string;
  title?: string;
  achievementText?: string;
  grade?: string;
  date?: string;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  studentName,
  sheikhName,
  title = 'شهادة تقدير وإتقان قرآني',
  achievementText = 'نظير تميزه واجتهاده في حفظ ومراجعة القرآن الكريم وإتقانه لأحكام التلاوة والتجويد.',
  grade = 'ممتاز مرتفع',
  date = new Date().toISOString().split('T')[0],
  onClose
}) => {
  const { centerInfo } = useApp();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-amber-300 dark:border-amber-600/40 my-8">
        
        {/* Actions Bar (hidden in print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span className="font-bold text-slate-800 dark:text-slate-100">معاينة وطباعة الشهادة القرآنية</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              طباعة الشهادة الرسمية
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Body (Print Area) */}
        <div className="p-8 sm:p-12 bg-linear-to-b from-[#fbf8f0] to-[#fffdf9] dark:from-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 text-center relative selection:bg-amber-200">
          
          {/* Islamic Ornate Frame */}
          <div className="border-[6px] border-double border-amber-600/80 rounded-2xl p-6 sm:p-10 relative shadow-inner">
            
            {/* Corner Stars */}
            <div className="absolute top-2 right-2 text-amber-600 text-xl font-serif">✦</div>
            <div className="absolute top-2 left-2 text-amber-600 text-xl font-serif">✦</div>
            <div className="absolute bottom-2 right-2 text-amber-600 text-xl font-serif">✦</div>
            <div className="absolute bottom-2 left-2 text-amber-600 text-xl font-serif">✦</div>

            {/* Header / Bismillah */}
            <div className="mb-4">
              <div className="text-xl font-serif text-amber-800 dark:text-amber-400 font-bold">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                « خَيْرُكُمْ مَنْ تَعَلَّمَ القُرْآنَ وَعَلَّمَهُ »
              </div>
            </div>

            {/* Center Header */}
            <div className="my-3 flex flex-col items-center justify-center">
              {centerInfo.logo && (
                <img src={centerInfo.logo} alt={centerInfo.name} className="w-20 h-20 sm:w-24 sm:h-24 object-contain mb-3 drop-shadow-sm" />
              )}
              <h2 className="text-xl sm:text-2xl font-black text-emerald-900 dark:text-emerald-300">
                {centerInfo.name}
              </h2>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                تحت إشراف إدارة شؤون القرآن الكريم والدراسات الإسلامية
              </div>
            </div>

            {/* Certificate Title */}
            <div className="my-6">
              <div className="inline-block px-8 py-2 border-y-2 border-amber-500 text-2xl sm:text-3xl font-extrabold text-amber-700 dark:text-amber-400 tracking-wider">
                {title}
              </div>
            </div>

            {/* Body */}
            <div className="my-6 space-y-4 max-w-2xl mx-auto text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
              <p>يَسر إدارة المركز أن تمنح هذه الشهادة المباركة للطالب النجيب /</p>
              
              <div className="text-2xl sm:text-3xl font-black text-emerald-800 dark:text-emerald-400 py-1 font-serif underline decoration-amber-500/50 underline-offset-8">
                {studentName}
              </div>

              <p className="mt-3 text-slate-600 dark:text-slate-300">
                {achievementText}
              </p>

              {grade && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-sm border border-amber-300 dark:border-amber-700">
                  <Sparkles className="w-4 h-4" />
                  <span>التقدير العام: {grade}</span>
                </div>
              )}

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 italic">
                سائلين الله العلي القدير أن يجعله من أهل القرآن الذين هم أهل الله وخاصته، وأن ينفع به والديه وأمته.
              </p>
            </div>

            {/* Footer Signatures */}
            <div className="grid grid-cols-2 gap-8 mt-10 pt-6 border-t border-slate-200 dark:border-slate-700 text-xs sm:text-sm">
              <div className="text-center">
                <div className="font-bold text-slate-700 dark:text-slate-300">شيخ الحلقة</div>
                <div className="mt-6 font-semibold text-emerald-800 dark:text-emerald-400 font-serif">
                  {sheikhName || 'فضيلة المحفظ'}
                </div>
              </div>

              <div className="text-center">
                <div className="font-bold text-slate-700 dark:text-slate-300">مدير المركز</div>
                <div className="mt-6 font-semibold text-emerald-800 dark:text-emerald-400 font-serif">
                  {centerInfo.managerName}
                </div>
              </div>
            </div>

            {/* Date & Meta */}
            <div className="mt-8 text-[11px] text-slate-400 dark:text-slate-500 flex justify-between items-center px-4">
              <span>التاريخ: {date}</span>
              <span>العام الهجري: {centerInfo.hijriYear}</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
