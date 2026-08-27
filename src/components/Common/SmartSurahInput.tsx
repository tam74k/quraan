import React, { useState, useRef, useEffect } from 'react';
import { QURAN_SURAHS } from '../../data/quranSurahs';
import { QuranSurah } from '../../types';
import { BookOpen, Check } from 'lucide-react';

interface SmartSurahInputProps {
  value: string;
  onChange: (surahName: string, surahData?: QuranSurah) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const SmartSurahInput: React.FC<SmartSurahInputProps> = ({
  value,
  onChange,
  placeholder = 'اختر أو ابحث عن السورة...',
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSurahs = QURAN_SURAHS.filter(s =>
    s.name.includes(search) || s.englishName.toLowerCase().includes(search.toLowerCase()) || s.id.toString() === search
  );

  const handleSelect = (surah: QuranSurah) => {
    setSearch(surah.name);
    onChange(surah.name, surah);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          value={search}
          disabled={disabled}
          onChange={(e) => {
            setSearch(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:focus:ring-emerald-500 focus:border-transparent transition-all pr-9"
        />
        <BookOpen className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50 animate-in fade-in zoom-in-95 duration-100">
          {filteredSurahs.length > 0 ? (
            filteredSurahs.map((surah) => {
              const isSelected = value === surah.name;
              return (
                <button
                  key={surah.id}
                  type="button"
                  onClick={() => handleSelect(surah)}
                  className={`w-full px-3 py-2.5 text-right flex items-center justify-between hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors ${
                    isSelected ? 'bg-emerald-50/80 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 font-semibold' : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-center font-bold">
                      {surah.id}
                    </span>
                    <span className="text-sm font-medium">{surah.name}</span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      ({surah.revelationType} - {surah.ayahCount} آية)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      الجزء {surah.startJuz}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-3 text-center text-xs text-slate-500 dark:text-slate-400">
              لم يتم العثور على سورة بهذا الاسم
            </div>
          )}
        </div>
      )}
    </div>
  );
};
