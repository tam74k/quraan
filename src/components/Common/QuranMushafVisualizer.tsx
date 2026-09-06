import React, { useState } from 'react';
import { QURAN_SURAHS } from '../../data/quranSurahs';
import { TrackingRecord } from '../../types';
import { BookOpen, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface QuranMushafVisualizerProps {
  studentName: string;
  trackingHistory: TrackingRecord[];
}

export const QuranMushafVisualizer: React.FC<QuranMushafVisualizerProps> = ({
  studentName,
  trackingHistory
}) => {
  const [activeTab, setActiveTab] = useState<'surahs' | 'juz'>('surahs');
  const [filter, setFilter] = useState<'all' | 'memorized' | 'in_progress'>('all');

  // Identify status for each Surah based on tracking
  const surahStatusMap = React.useMemo<Map<string, { status: 'memorized' | 'in_progress' | 'unmemorized'; count: number }>>(() => {
    const map = new Map<string, { status: 'memorized' | 'in_progress' | 'unmemorized'; count: number }>();
    
    QURAN_SURAHS.forEach(s => {
      map.set(s.name, { status: 'unmemorized', count: 0 });
    });

    trackingHistory.forEach(record => {
      if (record.newSurah) {
        const current = map.get(record.newSurah) || { status: 'unmemorized', count: 0 };
        const surahData = QURAN_SURAHS.find(s => s.name === record.newSurah);
        
        // If they recited all ayahs or recorded repeatedly with high score
        const isFull = record.newTo && surahData && record.newTo >= surahData.ayahCount;
        map.set(record.newSurah, {
          status: isFull ? 'memorized' : 'in_progress',
          count: current.count + 1
        });
      }
      if (record.revSurah) {
        const current = map.get(record.revSurah) || { status: 'unmemorized', count: 0 };
        map.set(record.revSurah, {
          status: 'memorized',
          count: current.count + 1
        });
      }
    });

    return map;
  }, [trackingHistory]);

  const memorizedCount = (Array.from(surahStatusMap.values()) as any[]).filter(v => v.status === 'memorized').length;
  const inProgressCount = (Array.from(surahStatusMap.values()) as any[]).filter(v => v.status === 'in_progress').length;
  const percent = Math.min(100, Math.round(((memorizedCount + inProgressCount * 0.5) / 114) * 100));

  const filteredSurahs = QURAN_SURAHS.filter(surah => {
    const item = surahStatusMap.get(surah.name);
    if (filter === 'memorized') return item?.status === 'memorized';
    if (filter === 'in_progress') return item?.status === 'in_progress';
    return true;
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-700">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                مصحف الإنجاز وخريطة الحفظ
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                متابعة بصرية لسور وأجزاء القرآن الكريم للطالب: <span className="font-semibold text-emerald-700 dark:text-emerald-400">{studentName}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Progress pill & metrics */}
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="text-center">
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{percent}%</div>
            <div className="text-[11px] text-slate-400">نسبة الختمة</div>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
          <div className="text-center">
            <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{memorizedCount}</div>
            <div className="text-[11px] text-slate-400">سورة متقنة</div>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
          <div className="text-center">
            <div className="text-sm font-bold text-amber-600 dark:text-amber-400">{inProgressCount}</div>
            <div className="text-[11px] text-slate-400">قيد التسميع</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 mb-5">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('surahs')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'surahs'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            عرض السور (114)
          </button>
          <button
            onClick={() => setActiveTab('juz')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'juz'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            عرض الأجزاء (30 جزء)
          </button>
        </div>

        {activeTab === 'surahs' && (
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg border transition-all ${
                filter === 'all'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              الكل ({QURAN_SURAHS.length})
            </button>
            <button
              onClick={() => setFilter('memorized')}
              className={`px-2.5 py-1 rounded-lg border transition-all ${
                filter === 'memorized'
                  ? 'border-emerald-500 bg-emerald-500 text-white font-bold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              المتقنة ({memorizedCount})
            </button>
            <button
              onClick={() => setFilter('in_progress')}
              className={`px-2.5 py-1 rounded-lg border transition-all ${
                filter === 'in_progress'
                  ? 'border-amber-500 bg-amber-500 text-white font-bold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              قيد الحفظ ({inProgressCount})
            </button>
          </div>
        )}
      </div>

      {/* Surahs Grid */}
      {activeTab === 'surahs' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-96 overflow-y-auto pr-1">
          {filteredSurahs.map((surah) => {
            const statusInfo = surahStatusMap.get(surah.name);
            const isDone = statusInfo?.status === 'memorized';
            const isProgress = statusInfo?.status === 'in_progress';

            return (
              <div
                key={surah.id}
                className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                  isDone
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700/60 text-emerald-900 dark:text-emerald-200 shadow-xs'
                    : isProgress
                    ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200'
                    : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10">
                    {surah.id}
                  </span>
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : isProgress ? (
                    <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  ) : null}
                </div>
                <div className="font-bold text-xs truncate">{surah.name}</div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 flex justify-between">
                  <span>جزء {surah.startJuz}</span>
                  <span>{surah.ayahCount} آية</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Juz Grid */}
      {activeTab === 'juz' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3 max-h-96 overflow-y-auto pr-1">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNum) => {
            const surahsInJuz = QURAN_SURAHS.filter(s => s.startJuz === juzNum);
            const doneInJuz = surahsInJuz.filter(s => surahStatusMap.get(s.name)?.status === 'memorized').length;
            const isCompleted = doneInJuz === surahsInJuz.length && surahsInJuz.length > 0;
            const isPartial = doneInJuz > 0 && !isCompleted;

            return (
              <div
                key={juzNum}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isCompleted
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-md'
                    : isPartial
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="text-xs font-semibold opacity-80">الجزء</div>
                <div className="text-xl font-black my-0.5">{juzNum}</div>
                <div className="text-[11px] opacity-90">
                  {isCompleted ? '⭐ مكتمل' : isPartial ? `${doneInJuz}/${surahsInJuz.length} سورة` : 'لم يبدأ'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
