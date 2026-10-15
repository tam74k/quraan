import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Award, Printer, X, Sparkles, Check, RotateCw } from 'lucide-react';

interface CertificateModalProps {
  studentName: string;
  sheikhName?: string;
  title?: string;
  achievementText?: string;
  grade?: string;
  badgeIcon?: string;
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
  badgeIcon,
  date = new Date().toISOString().split('T')[0],
  onClose,
  autoPrint = true
}) => {
  const { centerInfo } = useApp();
  const effectiveManagerSignature =
    centerInfo.managerSignature ||
    (typeof window !== 'undefined' ? localStorage.getItem('center_manager_signature') : '') ||
    '';
  const effectiveLogo =
    centerInfo.logo ||
    (typeof window !== 'undefined' ? localStorage.getItem('center_logo') : '') ||
    '';
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
            margin: 6mm 7mm !important;
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
            position: static !important;
            width: 100% !important;
            height: 100% !important;
            max-width: 100% !important;
            max-height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            overflow: hidden !important;
          }
          .certificate-modal-content {
            width: 100% !important;
            height: 100% !important;
            max-width: 100% !important;
            max-height: 100% !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 auto !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            background: #fffdfa !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            overflow: hidden !important;
          }
          .certificate-frame-inner {
            height: 100% !important;
            width: 100% !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            padding: ${orientation === 'landscape' ? '3mm 6mm' : '6mm 4mm'} !important;
            border: 4px double #b45309 !important;
            border-radius: 12px !important;
            background: #fffdf9 !important;
          }
          .student-certificate-name {
            font-size: ${orientation === 'landscape' ? '28pt' : '24pt'} !important;
            line-height: 1.25 !important;
            font-weight: 900 !important;
          }
          .manager-signature-img {
            max-height: 16mm !important;
            width: auto !important;
            display: block !important;
          }
          .center-seal-stamp {
            width: 20mm !important;
            height: 20mm !important;
          }
        }
      `}</style>

      {/* Modal Overlay */}
      <div className="certificate-modal-overlay fixed inset-0 z-50 flex flex-col items-center justify-start sm:justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
        <div
          className={`relative w-full ${
            orientation === 'landscape' ? 'max-w-4xl' : 'max-w-2xl'
          } max-h-[96vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-amber-300 dark:border-amber-600/40 my-auto transition-all`}
        >
          {/* Actions Bar (sticky top, immediately visible without scrolling) */}
          <div className="no-print sticky top-0 z-50 shrink-0 flex flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6 sm:py-2.5 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded-lg">
                <Award className="w-5 h-5" />
              </span>
              <div>
                <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 block">
                  معاينة وطباعة الشهادة القرآنية
                </span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block">
                  ✓ مضبوطة ومطابقة لمقاس ورق A4 بدقة وهوامش آمنة
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Orientation Toggle */}
              <div className="flex items-center bg-slate-200/80 dark:bg-slate-700 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setOrientation('landscape')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
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
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
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
                <span>طباعة أو حفظ بتنسيق PDF</span>
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
          <div className="certificate-modal-content flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 bg-gradient-to-b from-[#fbf8f0] to-[#fffdf9] text-slate-800 text-center relative selection:bg-amber-200">
            {/* Islamic Ornate Frame */}
            <div className="certificate-frame-inner border-[4px] border-double border-amber-600/90 rounded-2xl p-3 sm:p-5 md:p-6 relative shadow-inner bg-[#fffdfa]/95">
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
                  {effectiveLogo && (
                    <img
                      src={effectiveLogo}
                      alt={centerInfo.name}
                      className="h-12 sm:h-14 w-auto object-contain mb-1 drop-shadow-xs bg-white/90 p-1 rounded-xl"
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

              {/* 2. Certificate Title & Badge Emblem */}
              <div className="my-1.5 sm:my-2.5 flex flex-col items-center">
                {badgeIcon && (
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-200 border-2 border-amber-500 shadow-md flex items-center justify-center text-2xl sm:text-3xl mb-1.5 transform hover:scale-105 transition-all">
                    {badgeIcon}
                  </div>
                )}
                <div className="inline-block px-6 sm:px-10 py-1 border-y-2 border-amber-500/80 bg-amber-500/10 text-xl sm:text-2xl font-black text-amber-800 tracking-wide rounded-sm">
                  {title}
                </div>
              </div>

              {/* 3. Certificate Body */}
              <div className="space-y-2 max-w-2xl mx-auto text-slate-700 text-xs sm:text-sm leading-relaxed">
                <p className="text-slate-600 text-xs sm:text-sm">
                  يَسر إدارة المركز أن تمنح هذه الشهادة المباركة للطالب النجيب /
                </p>

                <div className="student-certificate-name text-3xl sm:text-4xl md:text-5xl font-black text-emerald-950 py-1 sm:py-2 font-serif underline decoration-amber-500/60 underline-offset-8 tracking-wide drop-shadow-xs">
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
              <div className="grid grid-cols-2 gap-8 mt-3 pt-2.5 border-t border-slate-200/80 text-xs sm:text-sm">
                <div className="text-center flex flex-col items-center justify-between min-h-[70px] sm:min-h-[80px]">
                  <div className="font-bold text-slate-700 text-xs sm:text-sm">شيخ ومحفظ الحلقة</div>
                  <div className="font-semibold text-emerald-950 font-serif text-xs sm:text-sm border-t border-dotted border-slate-400 pt-1 w-36">
                    {sheikhName || 'فضيلة المحفظ'}
                  </div>
                </div>

                <div className="text-center flex flex-col items-center justify-between min-h-[70px] sm:min-h-[80px]">
                  <div className="font-bold text-slate-700 text-xs sm:text-sm">مدير المركز</div>
                  {effectiveManagerSignature ? (
                    <div className="flex flex-col items-center justify-center">
                      <img
                        src={effectiveManagerSignature}
                        alt="توقيع مدير المركز"
                        className="manager-signature-img h-12 sm:h-14 md:h-16 w-auto object-contain max-w-[140px] drop-shadow-2xs"
                      />
                      <div className="font-semibold text-emerald-950 font-serif text-xs sm:text-sm mt-0.5">
                        {centerInfo.managerName || 'مدير المركز'}
                      </div>
                    </div>
                  ) : (
                    <div className="font-semibold text-emerald-950 font-serif text-xs sm:text-sm border-t border-dotted border-slate-400 pt-1 w-36">
                      {centerInfo.managerName || 'مدير المركز'}
                    </div>
                  )}
                </div>
              </div>

              {/* 5. Center Seal / Stamp (اسفل التواقيع في المنتصف كختم) */}
              <div className="flex flex-col items-center justify-center my-1.5 sm:my-2">
                <div className="relative flex flex-col items-center justify-center">
                  {effectiveLogo ? (
                    <div className="center-seal-stamp relative w-16 h-16 sm:w-20 sm:h-20 p-1 rounded-full border-2 border-double border-amber-700/80 bg-amber-50/40 shadow-xs flex items-center justify-center">
                      <img
                        src={effectiveLogo}
                        alt="ختم المركز"
                        className="w-full h-full object-contain rounded-full opacity-90"
                      />
                      <div className="absolute inset-0 rounded-full border border-dashed border-amber-600/50 pointer-events-none" />
                    </div>
                  ) : (
                    <div className="center-seal-stamp w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-double border-amber-700/80 bg-amber-50/50 flex flex-col items-center justify-center p-1 text-center text-amber-900 select-none shadow-xs">
                      <span className="text-[8px] font-bold text-amber-800">ختم معتمد</span>
                      <span className="text-[9px] font-extrabold text-emerald-950 font-serif leading-tight line-clamp-2 px-1">
                        {centerInfo.name || 'المركز القرآني'}
                      </span>
                      <span className="text-[7px] text-amber-700 mt-0.5">الختم الرسمي</span>
                    </div>
                  )}
                  <div className="mt-1 bg-amber-100/90 border border-amber-600/40 px-2.5 py-0.5 rounded-full text-[9px] font-bold text-amber-950 shadow-2xs font-serif whitespace-nowrap">
                    ختم المركز الرسمي
                  </div>
                </div>
              </div>

              {/* 6. Date & Meta Footer */}
              <div className="mt-2 text-[10px] text-slate-400 flex justify-between items-center px-2 pt-1 border-t border-amber-200/50">
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
