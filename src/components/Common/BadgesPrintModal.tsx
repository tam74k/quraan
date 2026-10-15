import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import {
  Award,
  Printer,
  X,
  Sparkles,
  Check,
  CheckSquare,
  Square,
  Filter,
  Users,
  Calendar,
  Layers,
  Scissors
} from 'lucide-react';

export interface PrintableBadgeItem {
  id?: number | string;
  studentId?: number;
  studentName: string;
  sheikhName?: string;
  halqaName?: string;
  badgeName: string;
  badgeIcon: string;
  description: string;
  dateEarned: string;
}

interface BadgesPrintModalProps {
  onClose: () => void;
  // If preselected badge is passed, opens directly for that badge
  preselectedBadge?: PrintableBadgeItem;
  // If initial halqa/sheikh filter is passed
  initialSheikhId?: number;
}

const DEFAULT_TEMPLATES = [
  {
    name: 'وسام قارئ الأسبوع المتميز',
    icon: '🏆',
    description: 'تقديراً لتميزه وجهوده المباركة وحضوره اليومي المتألق في حلقة القرآن الكريم.'
  },
  {
    name: 'وسام الإتقان والتجويد',
    icon: '🌟',
    description: 'تقديراً لإتقانه لأحكام التلاوة والتجويد ومخارج الحروف وحسن الأداء القرآني.'
  },
  {
    name: 'وسام المواظبة والانضباط',
    icon: '🎖️',
    description: 'تقديراً لحرصه العالي على الحضور مبكراً والالتزام بآداب حلقة القرآن الكريم.'
  },
  {
    name: 'وسام حفظ جزء عمّ',
    icon: '👑',
    description: 'بمناسبة إتمام حفظ ومراجعة جزء عمّ كاملاً بإتقان وضبط متميز.'
  },
  {
    name: 'وسام الماهر بالقرآن',
    icon: '💎',
    description: 'نظير مهارته الفائقة في استحضار الآيات المتشابهة ودقة الحفظ وسرعة الاسترجاع.'
  },
  {
    name: 'وسام همة الحفاظ العالية',
    icon: '🥇',
    description: 'تقديراً لهمته المتوقدة ومضاعفته لمقدار الحفظ والمراجعة بتفوق واجتهاد.'
  }
];

const BADGE_ICONS = ['🏆', '🌟', '🎖️', '👑', '💎', '📜', '🥇', '🌙', '✨', '🕌', '🏅', '📖'];

export const BadgesPrintModal: React.FC<BadgesPrintModalProps> = ({
  onClose,
  preselectedBadge,
  initialSheikhId
}) => {
  const { students, sheikhs, badges, centerInfo, addBadge } = useApp();

  const effectiveManagerSignature =
    centerInfo.managerSignature ||
    (typeof window !== 'undefined' ? localStorage.getItem('center_manager_signature') : '') ||
    '';
  const effectiveLogo =
    centerInfo.logo ||
    (typeof window !== 'undefined' ? localStorage.getItem('center_logo') : '') ||
    '';

  // Modal print isolation on body
  useEffect(() => {
    document.body.classList.add('printing-modal-active');
    return () => {
      document.body.classList.remove('printing-modal-active');
    };
  }, []);

  // Tabs: 'batch_unify' (وسام موحد لمجموعة طلاب) or 'existing_feed' (الأوسمة الممنوحة مسبقاً)
  const [activeTab, setActiveTab] = useState<'batch_unify' | 'existing_feed'>(
    preselectedBadge ? 'existing_feed' : 'batch_unify'
  );

  // Layout mode for printing / distribution:
  // '2-per-page': وسامان في صفحة A4 (الأفضل للقص والتوزيع)
  // '1-per-page': وسام كامل لكل صفحة A4
  // '4-per-page': 4 بطاقات وسام في كل صفحة A4
  const [layoutMode, setLayoutMode] = useState<'2-per-page' | '1-per-page' | '4-per-page'>('2-per-page');

  // Filter Sheikh / Halqa
  const [selectedSheikhId, setSelectedSheikhId] = useState<number | 'all'>(
    initialSheikhId !== undefined ? initialSheikhId : 'all'
  );

  // Form for Unified Badge (Tab 1)
  const [badgeForm, setBadgeForm] = useState({
    name: preselectedBadge?.badgeName || DEFAULT_TEMPLATES[0].name,
    icon: preselectedBadge?.badgeIcon || DEFAULT_TEMPLATES[0].icon,
    description: preselectedBadge?.description || DEFAULT_TEMPLATES[0].description,
    dateEarned: preselectedBadge?.dateEarned || new Date().toISOString().split('T')[0],
    saveToDb: false
  });

  // Selected students for Tab 1
  const filteredStudents = students.filter(s => {
    if (selectedSheikhId === 'all') return true;
    return s.sheikhId === selectedSheikhId;
  });

  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<number>>(() => {
    if (preselectedBadge?.studentId) {
      return new Set([preselectedBadge.studentId]);
    }
    // Default: select all students in the filtered halqa (up to 15)
    return new Set(filteredStudents.slice(0, 10).map(s => s.id));
  });

  // Selected badge IDs for Tab 2 (Existing badges)
  const [selectedBadgeIds, setSelectedBadgeIds] = useState<Set<string | number>>(() => {
    if (preselectedBadge?.id) {
      return new Set([preselectedBadge.id]);
    }
    return new Set(badges.map(b => b.id));
  });

  // Handlers for student selection
  const toggleStudent = (id: number) => {
    setSelectedStudentIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllStudents = () => {
    if (selectedStudentIds.size === filteredStudents.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(filteredStudents.map(s => s.id)));
    }
  };

  // Compile the list of badges to print based on current active tab
  const getBadgesToPrint = (): PrintableBadgeItem[] => {
    if (activeTab === 'batch_unify') {
      return filteredStudents
        .filter(s => selectedStudentIds.has(s.id))
        .map(s => {
          const sheikh = sheikhs.find(sh => sh.id === s.sheikhId);
          return {
            id: `unified-${s.id}`,
            studentId: s.id,
            studentName: s.name,
            halqaName: sheikh?.halqaName || 'الحلقة القرآنية',
            sheikhName: sheikh?.name || 'فضيلة المحفظ',
            badgeName: badgeForm.name,
            badgeIcon: badgeForm.icon,
            description: badgeForm.description,
            dateEarned: badgeForm.dateEarned
          };
        });
    } else {
      // From existing awarded badges
      const list = preselectedBadge ? [preselectedBadge] : badges;
      return list
        .filter(b => selectedBadgeIds.has(b.id || ''))
        .map(b => {
          const student = students.find(s => s.id === b.studentId);
          const sheikh = sheikhs.find(s => s.id === student?.sheikhId);
          return {
            id: b.id,
            studentId: b.studentId,
            studentName: b.studentName || student?.name || 'الطالب المكرم',
            halqaName: b.halqaName || sheikh?.halqaName || 'الحلقة القرآنية',
            sheikhName: b.sheikhName || sheikh?.name || 'فضيلة المحفظ',
            badgeName: b.badgeName || (b as any).name || 'وسام التميز',
            badgeIcon: b.badgeIcon || (b as any).icon || '🏆',
            description: b.description || 'تقديراً لتميزه في حفظ القرآن الكريم.',
            dateEarned: b.dateEarned || new Date().toISOString().split('T')[0]
          };
        });
    }
  };

  const badgesToPrint = getBadgesToPrint();

  const handlePrint = () => {
    // Optionally persist newly granted badges if requested
    if (activeTab === 'batch_unify' && badgeForm.saveToDb) {
      filteredStudents
        .filter(s => selectedStudentIds.has(s.id))
        .forEach(s => {
          addBadge({
            studentId: s.id,
            name: badgeForm.name,
            icon: badgeForm.icon,
            description: badgeForm.description,
            dateEarned: badgeForm.dateEarned
          });
        });
    }
    window.print();
  };

  // Group badges into chunks based on layoutMode for printing
  // '2-per-page' -> pairs of 2
  // '4-per-page' -> chunks of 4
  // '1-per-page' -> single item per page
  const chunkSize = layoutMode === '4-per-page' ? 4 : layoutMode === '2-per-page' ? 2 : 1;
  const badgeChunks: PrintableBadgeItem[][] = [];
  for (let i = 0; i < badgesToPrint.length; i += chunkSize) {
    badgeChunks.push(badgesToPrint.slice(i, i + chunkSize));
  }

  // Render a Single Badge Card Component
  const renderBadgeCard = (item: PrintableBadgeItem, compact: boolean = false) => {
    return (
      <div
        key={item.id}
        className={`badge-card-container relative flex flex-col justify-between bg-gradient-to-b from-[#fffcf7] via-[#fffdfa] to-[#fcf8f0] text-slate-800 rounded-2xl border-[3.5px] border-double border-amber-600/90 shadow-sm ${
          compact ? 'p-3' : 'p-4 sm:p-5'
        } overflow-hidden`}
        style={{ boxSizing: 'border-box' }}
      >
        {/* Subtle decorative background watermark */}
        <div className="absolute inset-0 bg-radial from-amber-500/5 via-transparent to-transparent pointer-events-none" />

        {/* Corner Stars / Islamic Embellishments */}
        <div className="absolute top-1.5 right-2 text-amber-600 text-xs sm:text-sm font-serif select-none">✦ ۞</div>
        <div className="absolute top-1.5 left-2 text-amber-600 text-xs sm:text-sm font-serif select-none">۞ ✦</div>
        <div className="absolute bottom-1.5 right-2 text-amber-600 text-xs sm:text-sm font-serif select-none">✦ ۞</div>
        <div className="absolute bottom-1.5 left-2 text-amber-600 text-xs sm:text-sm font-serif select-none">۞ ✦</div>

        {/* 1. Header: Center Name & Logo */}
        <div className="flex items-center justify-between pb-1.5 border-b border-amber-200/70">
          <div className="flex items-center gap-2">
            {effectiveLogo ? (
              <img
                src={effectiveLogo}
                alt="Logo"
                className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} object-contain rounded-lg bg-white/80 p-0.5 border border-amber-200`}
              />
            ) : null}
            <div className="text-right">
              <h4 className={`font-black text-emerald-950 font-serif leading-tight ${compact ? 'text-[11px]' : 'text-xs sm:text-sm'}`}>
                {centerInfo.name || 'مركز تحفيظ القرآن الكريم'}
              </h4>
              <p className="text-[9px] text-slate-500 font-medium">
                إدارة شؤون القرآن الكريم والدراسات الإسلامية
              </p>
            </div>
          </div>

          <div className="text-left">
            <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[9px]">
              لوحة الشرف والتكريم
            </span>
          </div>
        </div>

        {/* 2. Badge Medallion & Title */}
        <div className="my-1.5 flex flex-col items-center justify-center text-center">
          <div className="relative mb-1">
            <div className={`rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-200 border-2 border-amber-500 shadow-sm flex items-center justify-center ${
              compact ? 'w-10 h-10 text-xl' : 'w-12 h-12 sm:w-14 sm:h-14 text-2xl sm:text-3xl'
            }`}>
              <span>{item.badgeIcon}</span>
            </div>
            <Sparkles className="absolute -top-1 -right-1 w-3.5 h-3.5 text-amber-500" />
          </div>

          <div className={`inline-block px-4 py-0.5 rounded-md bg-amber-500/15 border-y-2 border-amber-600 font-black text-amber-900 tracking-wide font-serif ${
            compact ? 'text-xs' : 'text-sm sm:text-base'
          }`}>
            « {item.badgeName} »
          </div>
        </div>

        {/* 3. Honored Student Body */}
        <div className="my-1 text-center space-y-1">
          <p className="text-[10px] sm:text-[11px] text-slate-600">
            يُمنح هذا الوسام الشرفي بكل فخر واعتزاز للطالب المبارك /
          </p>

          <div className={`font-black text-emerald-950 font-serif underline decoration-amber-500/60 underline-offset-4 tracking-wide ${
            compact ? 'text-base sm:text-lg' : 'text-xl sm:text-2xl md:text-3xl py-0.5'
          }`}>
            {item.studentName}
          </div>

          <div className="flex items-center justify-center gap-3 text-[10px] text-slate-600 font-medium">
            <span>حلقة: <strong className="text-amber-900">{item.halqaName}</strong></span>
            <span>•</span>
            <span>المحفظ: <strong className="text-emerald-950">{item.sheikhName}</strong></span>
          </div>

          <p className={`text-slate-700 font-medium bg-amber-50/60 p-1.5 rounded-lg border border-amber-200/50 leading-relaxed max-w-xl mx-auto ${
            compact ? 'text-[9px] line-clamp-2' : 'text-[10px] sm:text-xs'
          }`}>
            {item.description}
          </p>
        </div>

        {/* 4. Signatures, Official Seal & Date */}
        <div className="mt-1 pt-1.5 border-t border-amber-200/80">
          <div className="grid grid-cols-3 items-center text-center">
            {/* Sheikh Signature */}
            <div className="text-right">
              <span className="block text-[9px] text-slate-500 font-bold">محفظ الحلقة</span>
              <span className="block text-[10px] font-bold text-emerald-950 font-serif truncate">
                {item.sheikhName}
              </span>
            </div>

            {/* Official Center Seal */}
            <div className="flex flex-col items-center justify-center">
              {effectiveLogo ? (
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 border-double border-amber-700/80 bg-amber-50/50 p-0.5 flex items-center justify-center shadow-2xs">
                  <img src={effectiveLogo} alt="Seal" className="w-full h-full object-contain rounded-full opacity-90" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full border border-dashed border-amber-700 bg-amber-50 flex items-center justify-center text-[7px] font-bold text-amber-900">
                  ختم معتمد
                </div>
              )}
              <span className="text-[7px] text-amber-900 font-serif font-bold mt-0.5">الختم الرسمي</span>
            </div>

            {/* Manager Approval & Signature */}
            <div className="text-left flex flex-col items-end">
              <span className="block text-[9px] text-slate-500 font-bold">اعتماد الإدارة</span>
              {effectiveManagerSignature ? (
                <img
                  src={effectiveManagerSignature}
                  alt="التوقيع"
                  className="h-6 sm:h-7 w-auto object-contain max-w-[85px] my-0.5"
                />
              ) : null}
              <span className="block text-[10px] font-bold text-emerald-950 font-serif truncate">
                {centerInfo.managerName || 'مدير المركز'}
              </span>
            </div>
          </div>

          {/* Footer Dates */}
          <div className="mt-1 pt-1 border-t border-amber-100 flex justify-between items-center text-[8px] text-slate-400">
            <span>تاريخ المنح: {item.dateEarned}</span>
            <span>العام الهجري: {centerInfo.hijriYear || '1448هـ'}</span>
          </div>
        </div>
      </div>
    );
  };

  const modalJSX = (
    <>
      {/* Print Specific CSS */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
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
            overflow: visible !important;
          }
          /* Completely hide the background main application */
          body.printing-modal-active > #root {
            display: none !important;
          }
          .no-print {
            display: none !important;
          }
          .badges-modal-overlay {
            position: static !important;
            width: 100% !important;
            height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
            display: block !important;
            overflow: visible !important;
          }
          .badges-modal-wrapper {
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            max-width: none !important;
            max-height: none !important;
            width: 100% !important;
            border-radius: 0 !important;
            background: transparent !important;
            overflow: visible !important;
            display: block !important;
          }
          .badges-print-container {
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
          }
          /* Page chunk wrapper */
          .badges-print-sheet {
            width: 100% !important;
            height: 100% !important;
            max-width: 100% !important;
            max-height: 100% !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            box-sizing: border-box !important;
            padding: 0 !important;
            margin: 0 auto !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
          .badges-print-sheet:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
          /* Card Sizing in 2-per-page (half-page each) */
          .sheet-mode-2 .badge-card-container {
            height: 48.5% !important;
            max-height: 48.5% !important;
            margin: 0 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          /* Card Sizing in 1-per-page (full-page) */
          .sheet-mode-1 .badge-card-container {
            height: 100% !important;
            margin: 0 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          /* Card Sizing in 4-per-page (quarter-page 2x2 grid) */
          .sheet-mode-4 {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            grid-template-rows: repeat(2, 1fr) !important;
            gap: 4mm !important;
            height: 100% !important;
          }
          .sheet-mode-4 .badge-card-container {
            height: 100% !important;
            margin: 0 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          /* Cut guide */
          .cutting-guide-line {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 8px !important;
            margin: 2mm 0 !important;
            color: #94a3b8 !important;
            font-size: 8pt !important;
          }
        }
      `}</style>

      {/* Modal Screen Overlay */}
      <div className="badges-modal-overlay fixed inset-0 z-50 flex flex-col items-center justify-start p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
        <div className="badges-modal-wrapper relative w-full max-w-5xl max-h-[96vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-amber-300 dark:border-amber-600/40 my-auto transition-all">
          
          {/* Top Action Bar (Sticky & permanently visible without scrolling) */}
          <div className="no-print sticky top-0 z-50 shrink-0 flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded-xl">
                <Award className="w-5 h-5" />
              </span>
              <div>
                <span className="font-bold text-sm text-slate-800 dark:text-slate-100 block">
                  طباعة وتوزيع بطاقات الأوسمة الشرفية
                </span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold block">
                  جاهزة للطباعة والتوزيع بأسماء الطلاب • {badgesToPrint.length} وسام محدد
                </span>
              </div>
            </div>

            {/* Layout Options & Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Layout Mode Selector */}
              <div className="flex items-center bg-slate-200 dark:bg-slate-700 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setLayoutMode('2-per-page')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    layoutMode === '2-per-page'
                      ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                  title="وسامان في صفحة A4 - نصف صفحة لكل وسام، مقاس مثالي للقص والتوزيع"
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>وسامان بالصفحة (للقص والتوزيع)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLayoutMode('1-per-page')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    layoutMode === '1-per-page'
                      ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                  title="شهادة وسام كاملة صفحة A4"
                >
                  <span>وسام كامل (A4)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLayoutMode('4-per-page')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    layoutMode === '4-per-page'
                      ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                  title="4 بطاقات وسام في كل صفحة A4"
                >
                  <span>4 بطاقات بالصفحة</span>
                </button>
              </div>

              {/* Print Button */}
              <button
                type="button"
                onClick={handlePrint}
                disabled={badgesToPrint.length === 0}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة أو حفظ PDF ({badgesToPrint.length})</span>
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

          {/* Screen Controls & Configuration (hidden in print) */}
          <div className="no-print p-4 sm:p-5 bg-slate-100/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 space-y-4">
            
            {/* Tab navigation */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('batch_unify')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'batch_unify'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>طباعة وسام موحد لمجموعة طلاب / حلقة كاملة</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('existing_feed')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'existing_feed'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>طباعة من سجل الأوسمة الممنوحة ({badges.length})</span>
              </button>
            </div>

            {/* TAB 1: Unified Badge Configuration for Students */}
            {activeTab === 'batch_unify' && (
              <div className="space-y-4">
                {/* Quick Templates */}
                <div>
                  <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    أوسمة نموذجية سريعة:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {DEFAULT_TEMPLATES.map(tpl => (
                      <button
                        key={tpl.name}
                        type="button"
                        onClick={() =>
                          setBadgeForm(prev => ({
                            ...prev,
                            name: tpl.name,
                            icon: tpl.icon,
                            description: tpl.description
                          }))
                        }
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          badgeForm.name === tpl.name
                            ? 'bg-amber-100 border-amber-500 text-amber-950 font-black shadow-2xs'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span>{tpl.icon}</span>
                        <span>{tpl.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Badge Form Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      عنوان الوسام
                    </label>
                    <input
                      type="text"
                      value={badgeForm.name}
                      onChange={e => setBadgeForm({ ...badgeForm, name: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                      placeholder="عنوان الوسام"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      أيقونة الوسام
                    </label>
                    <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                      {BADGE_ICONS.map(ic => (
                        <button
                          key={ic}
                          type="button"
                          onClick={() => setBadgeForm({ ...badgeForm, icon: ic })}
                          className={`p-1 text-lg rounded-lg border transition-all ${
                            badgeForm.icon === ic
                              ? 'border-amber-500 bg-amber-100 dark:bg-amber-950 scale-110'
                              : 'border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {ic}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      تاريخ المنح
                    </label>
                    <input
                      type="date"
                      value={badgeForm.dateEarned}
                      onChange={e => setBadgeForm({ ...badgeForm, dateEarned: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      سبب المنح ورسالة التشجيع
                    </label>
                    <input
                      type="text"
                      value={badgeForm.description}
                      onChange={e => setBadgeForm({ ...badgeForm, description: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                      placeholder="عبارة التكريم"
                    />
                  </div>
                </div>

                {/* Halqa filter & Student selection */}
                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        تصفية الطلاب بالحلقة:
                      </span>
                      <select
                        value={selectedSheikhId}
                        onChange={e => {
                          const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                          setSelectedSheikhId(val);
                          // Auto select students of this halqa
                          const studentsInHalqa = students.filter(s => val === 'all' || s.sheikhId === val);
                          setSelectedStudentIds(new Set(studentsInHalqa.map(s => s.id)));
                        }}
                        className="px-3 py-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"
                      >
                        <option value="all">جميع طلاب المركز</option>
                        {sheikhs.map(sh => (
                          <option key={sh.id} value={sh.id}>
                            {sh.halqaName} ({sh.name})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={selectAllStudents}
                        className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-bold"
                      >
                        {selectedStudentIds.size === filteredStudents.length ? 'إلغاء تحديد الكل' : 'تحديد جميع طلاب الحلقة'}
                      </button>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                        {selectedStudentIds.size} من {filteredStudents.length} طالب
                      </span>
                    </div>
                  </div>

                  {/* Student Chips */}
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                    {filteredStudents.map(student => {
                      const isSelected = selectedStudentIds.has(student.id);
                      return (
                        <button
                          key={student.id}
                          type="button"
                          onClick={() => toggleStudent(student.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-700 text-white shadow-2xs font-bold'
                              : 'bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-3.5 h-3.5 text-white" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <span>{student.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Existing Badges Filter */}
            {activeTab === 'existing_feed' && (
              <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    حدد الأوسمة المراد طباعتها وتوزيعها:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedBadgeIds.size === badges.length) {
                        setSelectedBadgeIds(new Set());
                      } else {
                        setSelectedBadgeIds(new Set(badges.map(b => b.id)));
                      }
                    }}
                    className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-bold cursor-pointer"
                  >
                    {selectedBadgeIds.size === badges.length ? 'إلغاء تحديد الكل' : 'تحديد كل الأوسمة'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
                  {badges.map(b => {
                    const student = students.find(s => s.id === b.studentId);
                    const isSelected = selectedBadgeIds.has(b.id);
                    return (
                      <div
                        key={b.id}
                        onClick={() => {
                          setSelectedBadgeIds(prev => {
                            const next = new Set(prev);
                            if (next.has(b.id)) next.delete(b.id);
                            else next.add(b.id);
                            return next;
                          });
                        }}
                        className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-bold'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 opacity-70'
                        }`}
                      >
                        <span className="text-xl">{b.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs truncate">{b.name}</div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {student?.name || 'طالب'}
                          </div>
                        </div>
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Printable Body Content (Visible on Screen & Sent to Printer) */}
          <div className="badges-print-container flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-100/50 dark:bg-slate-950/30">
            {badgesToPrint.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-bold">
                لم يتم اختيار أي طالب أو وسام للطباعة. الرجاء تحديد طالب واحد على الأقل أعلاه.
              </div>
            ) : (
              <div className="space-y-6">
                {badgeChunks.map((chunk, pageIndex) => {
                  const modeClass =
                    layoutMode === '2-per-page'
                      ? 'sheet-mode-2'
                      : layoutMode === '4-per-page'
                      ? 'sheet-mode-4'
                      : 'sheet-mode-1';

                  return (
                    <div
                      key={`page-${pageIndex}`}
                      className={`badges-print-sheet ${modeClass} bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm print:p-0 print:border-none print:shadow-none print:rounded-none relative`}
                      style={{ minHeight: layoutMode === '1-per-page' ? '700px' : '850px' }}
                    >
                      {/* Screen badge page indicator (hidden in print) */}
                      <div className="no-print pb-2 mb-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs text-slate-400">
                        <span>صفحة الطباعة {pageIndex + 1} من {badgeChunks.length}</span>
                        <span>{chunk.length} {chunk.length === 1 ? 'وسام' : 'أوسمة'} في هذه الصفحة</span>
                      </div>

                      {/* In 2-per-page layout */}
                      {layoutMode === '2-per-page' && (
                        <>
                          {renderBadgeCard(chunk[0], false)}

                          {chunk[1] && (
                            <>
                              {/* Cutting Guide Line between the two badges */}
                              <div className="cutting-guide-line my-3 py-1 flex items-center justify-center gap-2 text-slate-400 border-y border-dashed border-slate-300 select-none text-[10px]">
                                <Scissors className="w-3.5 h-3.5 text-slate-400 transform rotate-90" />
                                <span>- - - - - - - - - - خط القص وتوزيع الأوسمة على الطلاب - - - - - - - - - -</span>
                                <Scissors className="w-3.5 h-3.5 text-slate-400 transform -rotate-90" />
                              </div>

                              {renderBadgeCard(chunk[1], false)}
                            </>
                          )}
                        </>
                      )}

                      {/* In 1-per-page layout */}
                      {layoutMode === '1-per-page' && renderBadgeCard(chunk[0], false)}

                      {/* In 4-per-page layout */}
                      {layoutMode === '4-per-page' &&
                        chunk.map(item => renderBadgeCard(item, true))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return typeof document !== 'undefined' ? createPortal(modalJSX, document.body) : modalJSX;
};
