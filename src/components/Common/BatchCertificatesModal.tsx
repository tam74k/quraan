import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Award, Printer, X, Sparkles, RotateCw, CheckSquare, Square } from 'lucide-react';

export interface BatchCertificateItem {
  id: number | string;
  studentName: string;
  sheikhName?: string;
  halqaName?: string;
  halqaType?: string;
  title: string;
  achievementText: string;
  grade?: string;
  date?: string;
}

interface BatchCertificatesModalProps {
  certificates: BatchCertificateItem[];
  halqaTitle?: string;
  onClose: () => void;
  autoPrint?: boolean;
}

export const BatchCertificatesModal: React.FC<BatchCertificatesModalProps> = ({
  certificates,
  halqaTitle = 'الحلقة القرآنية',
  onClose,
  autoPrint = false
}) => {
  const { centerInfo } = useApp();
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(
    () => new Set(certificates.map(c => c.id))
  );

  const effectiveManagerSignature =
    centerInfo.managerSignature ||
    (typeof window !== 'undefined' ? localStorage.getItem('center_manager_signature') : '') ||
    '';
  const effectiveLogo =
    centerInfo.logo ||
    (typeof window !== 'undefined' ? localStorage.getItem('center_logo') : '') ||
    '';

  // Filter certificates to only selected ones
  const activeCerts = certificates.filter(c => selectedIds.has(c.id));

  // Trigger print dialog automatically when autoPrint is true
  useEffect(() => {
    if (autoPrint && activeCerts.length > 0) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPrint, activeCerts.length]);

  const handlePrint = () => {
    window.print();
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === certificates.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(certificates.map(c => c.id)));
    }
  };

  const toggleItem = (id: number | string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <>
      {/* Print CSS Rules for Exact A4 Page Sizing across All Certificates */}
      <style>{`
        @media print {
          @page {
            size: ${orientation === 'landscape' ? 'A4 landscape' : 'A4 portrait'};
            margin: 6mm 7mm !important;
          }
          html, body {
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .batch-certificates-overlay {
            position: static !important;
            width: 100% !important;
            height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
            display: block !important;
            overflow: visible !important;
            z-index: 1 !important;
          }
          .batch-modal-wrapper {
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            max-width: none !important;
            width: 100% !important;
            border-radius: 0 !important;
            background: transparent !important;
          }
          .batch-certificates-list {
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
          }
          /* Individual Certificate Page (Exact A4 per page) */
          .batch-certificate-page {
            width: 100% !important;
            height: 100% !important;
            max-width: 100% !important;
            max-height: 100% !important;
            page-break-before: auto !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            box-sizing: border-box !important;
            padding: 0 !important;
            margin: 0 auto !important;
            background: #fffdfa !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
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
      <div className="batch-certificates-overlay fixed inset-0 z-50 flex flex-col items-center justify-start sm:justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
        <div
          className={`batch-modal-wrapper relative w-full ${
            orientation === 'landscape' ? 'max-w-5xl' : 'max-w-3xl'
          } max-h-[96vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-amber-300 dark:border-amber-600/40 my-auto transition-all`}
        >
          {/* Actions Bar (sticky top, immediately visible without scrolling) */}
          <div className="no-print sticky top-0 z-50 shrink-0 flex flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6 sm:py-2.5 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-2xs">
            <div className="flex items-center gap-3">
              <span className="p-1.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded-xl shadow-xs">
                <Award className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 block">
                    شهادات {halqaTitle}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full font-bold">
                    {activeCerts.length} شهادة محددة
                  </span>
                </div>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block mt-0.5">
                  ✓ طباعة الكل دفعة واحدة مع مراعاة خروج كل شهادة في صفحة A4 مستقلة وهوامش آمنة
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
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
                disabled={activeCerts.length === 0}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الكل أو حفظ PDF ({activeCerts.length})</span>
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

          {/* Quick Selection Filter Bar (hidden in print) */}
          <div className="no-print bg-amber-50/70 dark:bg-slate-800/80 px-6 py-2.5 border-b border-amber-200/60 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200 hover:underline cursor-pointer"
            >
              {selectedIds.size === certificates.length ? (
                <CheckSquare className="w-4 h-4 text-emerald-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>{selectedIds.size === certificates.length ? 'إلغاء تحديد الكل' : 'تحديد جميع الطلاب'}</span>
            </button>

            <div className="text-slate-500 text-[11px]">
              ملاحظة: يمكنك إلغاء تحديد أي طالب لا ترغب بطباعة شهادته حالياً
            </div>
          </div>

          {/* Certificates List (Print and Screen Preview Area) */}
          <div className="batch-certificates-list p-4 sm:p-6 bg-slate-100 dark:bg-slate-950 space-y-8 max-h-[80vh] overflow-y-auto">
            {activeCerts.length === 0 ? (
              <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl">
                لم يتم تحديد أي طالب للطباعة. يرجى تحديد طالب واحد على الأقل من القائمة أعلاه.
              </div>
            ) : (
              activeCerts.map((cert, index) => (
                <div key={cert.id} className="relative group">
                  {/* Screen Header Badge for each certificate (hidden in print) */}
                  <div className="no-print flex items-center justify-between px-3 py-1.5 mb-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        شهادة رقم ({index + 1} من {activeCerts.length}):
                      </span>
                      <span className="font-extrabold text-emerald-800 dark:text-emerald-400 font-serif">
                        {cert.studentName}
                      </span>
                      {cert.halqaName && (
                        <span className="text-[10px] text-slate-400">({cert.halqaName})</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleItem(cert.id)}
                      className="text-[11px] text-rose-600 hover:underline font-bold"
                    >
                      استبعاد من الطباعة
                    </button>
                  </div>

                  {/* Individual Certificate Page */}
                  <div className="batch-certificate-page p-4 sm:p-6 md:p-8 bg-gradient-to-b from-[#fbf8f0] to-[#fffdf9] text-slate-800 text-center relative selection:bg-amber-200 rounded-2xl shadow-lg border border-amber-200">
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
                          {effectiveLogo && (
                            <img
                              src={effectiveLogo}
                              alt={centerInfo.name}
                              className="h-12 sm:h-14 w-auto object-contain mb-1 drop-shadow-xs bg-white/90 p-1 rounded-xl"
                            />
                          )}
                          <h2 className="text-lg sm:text-xl font-black text-emerald-950 font-serif">
                            {centerInfo.name || 'مركز تحفيظ القرآن الكريم'}
                          </h2>
                          <div className="text-[10px] text-slate-500">
                            تحت إشراف إدارة شؤون القرآن الكريم والدراسات الإسلامية
                          </div>
                        </div>
                      </div>

                      {/* 2. Certificate Title */}
                      <div className="my-2 sm:my-3">
                        <div className="inline-block px-6 sm:px-10 py-1 border-y-2 border-amber-500/80 bg-amber-500/10 text-xl sm:text-2xl font-black text-amber-800 tracking-wide rounded-sm font-serif">
                          {cert.title}
                        </div>
                      </div>

                      {/* 3. Certificate Body */}
                      <div className="space-y-2 max-w-2xl mx-auto text-slate-700 text-xs sm:text-sm leading-relaxed">
                        <p className="text-slate-600 text-xs sm:text-sm">
                          يَسر إدارة المركز أن تمنح هذه الشهادة المباركة للطالب النجيب /
                        </p>

                        <div className="student-certificate-name text-3xl sm:text-4xl md:text-5xl font-black text-emerald-950 py-1 sm:py-2 font-serif underline decoration-amber-500/60 underline-offset-8 tracking-wide drop-shadow-xs">
                          {cert.studentName}
                        </div>

                        <p className="text-slate-700 font-medium text-xs sm:text-sm px-4">
                          {cert.achievementText}
                        </p>

                        {cert.grade && (
                          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            <span>التقدير العام: {cert.grade}</span>
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
                            {cert.sheikhName || 'فضيلة المحفظ'}
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
                        <span>تاريخ التحرير: {cert.date || new Date().toISOString().split('T')[0]}</span>
                        <span>العام الهجري: {centerInfo.hijriYear || '1448هـ'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};
