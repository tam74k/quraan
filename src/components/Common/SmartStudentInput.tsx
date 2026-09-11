import React, { useState, useRef, useEffect } from 'react';
import { Student } from '../../types';
import { Search, X, User } from 'lucide-react';

interface SmartStudentInputProps {
  students: Student[];
  selectedStudent: Student | null;
  onSelectStudent: (student: Student | null) => void;
  placeholder?: string;
  className?: string;
}

export const SmartStudentInput: React.FC<SmartStudentInputProps> = ({
  students,
  selectedStudent,
  onSelectStudent,
  placeholder = 'جميع طلاب الحلقة (أو ابحث بالاسم)...',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredStudents = students.filter(s => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      s.name.toLowerCase().includes(term) ||
      (s.civilId && s.civilId.includes(term)) ||
      (s.grade && s.grade.includes(term))
    );
  });

  const handleSelect = (student: Student) => {
    onSelectStudent(student);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectStudent(null);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="relative flex items-center">
        {selectedStudent ? (
          <div className="w-full flex items-center justify-between px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="w-6 h-6 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold flex items-center justify-center text-[11px] shrink-0">
                {selectedStudent.name.charAt(0)}
              </span>
              <span className="font-bold text-emerald-900 dark:text-emerald-200 truncate">
                {selectedStudent.name}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded shrink-0">
                {selectedStudent.grade}
              </span>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-emerald-600 hover:text-rose-600 dark:text-emerald-400 dark:hover:text-rose-400 transition-colors cursor-pointer"
              title="إلغاء التحديد وعرض كل الطلاب"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="relative w-full">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className="w-full pl-8 pr-8 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:focus:ring-emerald-500 transition-all font-medium"
            />
            <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {isOpen && !selectedStudent && (
        <div className="absolute right-0 z-50 w-full min-w-[260px] mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50 animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 bg-slate-50 dark:bg-slate-900/60 text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>اختر طالباً للمتابعة بين تاريخين:</span>
            <span>({filteredStudents.length} طالب)</span>
          </div>

          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <button
                key={student.id}
                type="button"
                onClick={() => handleSelect(student)}
                className="w-full px-3 py-2 text-right flex items-center justify-between hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors text-xs text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center text-[10px] shrink-0">
                    <User className="w-3 h-3" />
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-slate-800 dark:text-slate-100 truncate">{student.name}</div>
                    <div className="text-[10px] text-slate-400">
                      {student.grade} • {student.currentJuz || 1} أجزاء
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                  {student.civilId ? student.civilId.slice(-4) : ''}
                </span>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-xs text-slate-400">
              لا يوجد طلاب مطابقين للبحث
            </div>
          )}
        </div>
      )}
    </div>
  );
};
