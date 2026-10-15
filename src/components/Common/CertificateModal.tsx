import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Award, Printer, X, Sparkles, Check, RotateCw } from 'lucide-react';

interface CertificateModalProps {
  studentName: string;
  sheikhName?: string;
  title?: string;
  achievementText?: string;
  grade?: string;
  date?: string;
  onClose: () => void;
  autoPrint?: boolean;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  studentName,
  sheikhName,
  title = 'شهادة تقدير وإتقان قرآني',
  achievementText = 'نظير تميزه واجتهاده في حفظ ومراجعة القرآن الكريم وإتقانه لأحكام التلاوة والتجويد.',
  grade = 'ممتاز مرتفع',
  date = new Date().toISOString().split('T')[0],
  onClose,
  autoPrint = true
}) => {
  const { centerInfo } = useApp();
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');

  // Trigger print dialog automatically when autoPrint is true
  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Print CSS Rules for Exact A4 Page Sizing */}
      <style>{`
        @media print {
          @page {
            size: ${orientation === 'landscape' ? 'A4 landscape' : 'A4 portrait'};
            margin: 0 !important;
          }
          html, body {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          /* Cover everything else and isolate certificate on page 1 */
          .certificate-modal-overlay {
            position: fixed !important;
            inset: 0 !important;
            width: ${orientation === 'landscape' ? '297mm' : '210mm'} !important;
            height: ${orientation === 'landscape' ? '210mm' : '297mm'} !important;
            max-width: ${orientation === 'landscape' ? '297mm' : '210mm'} !important;
            max-height: ${orientation === 'landscape' ? '210mm' : '297mm'} !important;
            margin: 0 auto !important;
            padding: 0 !important;
            background: #ffffff !important;
            z-index: 9999999 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
            overflow: hidden !important;
          }
          .certificate-modal-content {
            width: ${orientation === 'landscape' ? '297mm' : '210mm'} !important;
            height: ${orientation === 'landscape' ? '210mm' : '297mm'} !important;
            max-width: ${orientation === 'landscape' ? '297mm' : '210mm'} !important;
            max-height: ${orientation === 'landscape' ? '210mm' : '297mm'} !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            padding: ${orientation === 'landscape' ? '6mm 8mm' : '8mm 6mm'} !important;
            box-sizing: border-box !important;
            background: #fffdfa !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
            overflow: hidden !important;
          }
          .certificate-frame-inner {
            height: 100% !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            padding: ${orientation === 'landscape' ? '5mm 8mm' : '8mm 6mm'} !important;
            border: 4px double #b45309 !important;
            border-radius: 12px !important;
            background: #fffdf9 !important;
          }
        }
      `}</style>

      {/* Modal Overlay */}
      <div className="certificate-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs overflow-y-auto">
        <div
          className={`relative w-full ${
            orientation === 'landscape' ? 'max-w-4xl' : 'max-w-2xl'
          } bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-amber-300 dark:border-amber-600/40 my-6 transition-all`}
        >
          {/* Actions Bar (hidden in print) */}
          <div className="no-print flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded-lg">
                <Award className="w-5 h-5" />
              </span>
              <div>
                <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 block">
                  معاينة وطباعة الشهادة القرآنية
                </span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block">
                  ✓ مضبوطة ومطابقة لمقاس ورق A4 الرسمية بدقة
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Orientation Toggle */}
              <div className="flex items-center bg-slate-200/80 dark:bg-slate-700 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setOrientation('landscape')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    orientation === 'landscape'
                      ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                  title="طباعة بالعرض"
                >
                  أفقي (A4 بالعرض)
                </button>
                <button
                  type="button"
                  onClick={() => setOrientation('portrait')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    orientation === 'portrait'
                      ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                  title="طباعة بالطول"
                >
                  رأسي (A4 بالطول)
                </button>
              </div>

              {/* Print Button */}
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الشهادة (A4)</span>
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Certificate Body (Print Area) */}
          <div className="certificate-modal-content p-4 sm:p-6 md:p-8 bg-gradient-to-b from-[#fbf8f0] to-[#fffdf9] text-slate-800 text-center relative selection:bg-amber-200">
            {/* Islamic Ornate Frame */}
            <div className="certificate-frame-inner border-[4px] border-double border-amber-600/90 rounded-2xl p-4 sm:p-6 md:p-8 relative shadow-inner bg-[#fffdfa]/95">
              {/* Corner Stars / Embellishments */}
              <div className="absolute top-2 right-2 text-amber-600 text-lg font-serif select-none">✦ ۞</div>
              <div className="absolute top-2 left-2 text-amber-600 text-lg font-serif select-none">۞ ✦</div>
              <div className="absolute bottom-2 right-2 text-amber-600 text-lg font-serif select-none">✦ ۞</div>
              <div className="absolute bottom-2 left-2 text-amber-600 text-lg font-serif select-none">۞ ✦</div>

              {/* 1. Header: Basmalah & Center Info */}
              <div className="space-y-1.5">
                <div className="text-base sm:text-lg font-serif text-amber-800 font-extrabold tracking-wide">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </div>
                <div className="text-[11px] text-slate-500 font-serif">
                  « خَيْرُكُمْ مَنْ تَعَلَّمَ القُرْآنَ وَعَلَّمَهُ »
                </div>

                <div className="pt-2 flex flex-col items-center justify-center">
                  {centerInfo.logo && (
                    <img
                      src={centerInfo.logo}
                      alt={centerInfo.name}
                      className="h-14 sm:h-16 w-auto object-contain mb-1 drop-shadow-xs bg-white/90 p-1 rounded-xl"
                    />
                  )}
                  <h2 className="text-lg sm:text-xl font-black text-emerald-950 font-serif">
                    {centerInfo.name}
                  </h2>
                  <div className="text-[10px] text-slate-500">
                    تحت إشراف إدارة شؤون القرآن الكريم والدراسات الإسلامية
                  </div>
                </div>
              </div>

              {/* 2. Certificate Title */}
              <div className="my-2.5 sm:my-3.5">
                <div className="inline-block px-6 sm:px-10 py-1.5 border-y-2 border-amber-500/80 bg-amber-500/10 text-xl sm:text-2xl font-black text-amber-800 tracking-wide rounded-sm">
                  {title}
                </div>
              </div>

              {/* 3. Certificate Body */}
              <div className="space-y-2.5 max-w-2xl mx-auto text-slate-700 text-xs sm:text-sm leading-relaxed">
                <p className="text-slate-600 text-xs sm:text-sm">
                  يَسر إدارة المركز أن تمنح هذه الشهادة المباركة للطالب النجيب /
                </p>

                <div className="text-2xl sm:text-3xl font-black text-emerald-900 py-0.5 font-serif underline decoration-amber-500/50 underline-offset-6">
                  {studentName}
                </div>

                <p className="text-slate-700 font-medium text-xs sm:text-sm px-4">
                  {achievementText}
                </p>

                {grade && (
                  <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>التقدير العام: {grade}</span>
                  </div>
                )}

                <p className="text-[10px] sm:text-xs text-slate-500 italic max-w-lg mx-auto">
                  سائلين الله العلي القدير أن يجعله من أهل القرآن الذين هم أهل الله وخاصته، وأن ينفع به والديه وأمته.
                </p>
              </div>

              {/* 4. Signatures Block */}
              <div className="grid grid-cols-2 gap-8 mt-4 pt-3 border-t border-slate-200 text-xs sm:text-sm">
                <div className="text-center">
                  <div className="font-bold text-slate-700 text-[11px] sm:text-xs">شيخ ومحفظ الحلقة</div>
                  <div className="mt-4 font-semibold text-emerald-900 font-serif text-xs sm:text-sm">
                    {sheikhName || 'فضيلة المحفظ'}
                  </div>
                </div>

                <div className="text-center">
                  <div className="font-bold text-slate-700 text-[11px] sm:text-xs">مدير المركز</div>
                  {centerInfo.managerSignature ? (
                    <div className="flex flex-col items-center justify-center mt-1">
                      <img
                        src={centerInfo.managerSignature}
                        alt="توقيع مدير المركز"
                        className="h-9 sm:h-11 w-auto object-contain max-w-[130px]"
                      />
                      <div className="font-semibold text-emerald-900 font-serif text-xs">
                        {centerInfo.managerName || 'مدير المركز'}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 font-semibold text-emerald-900 font-serif text-xs sm:text-sm">
                      {centerInfo.managerName || 'مدير المركز'}
                    </div>
                  )}
                </div>
              </div>

              {/* 5. Date & Meta Footer */}
              <div className="mt-3 text-[10px] text-slate-400 flex justify-between items-center px-2 pt-1 border-t border-amber-200/50">
                <span>تاريخ التحرير: {date}</span>
                <span>العام الهجري: {centerInfo.hijriYear || '1448هـ'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
