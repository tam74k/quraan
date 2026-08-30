const fs = require('fs');
let file = 'src/components/Sheikh/DailyRecitationSheet.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Destructure halqaTypes
code = code.replace(
  '    saveBatchTrackingRecords',
  '    saveBatchTrackingRecords,\n    halqaTypes'
);

// 2. Update selectedSheikhId default and type, and add halqaTypeFilter state
code = code.replace(
  '  const [selectedSheikhId, setSelectedSheikhId] = useState<number | null>(null);\n  useEffect(() => {\n    if (!selectedSheikhId && sheikhs.length > 0) {\n      setSelectedSheikhId(currentSheikh?.id || sheikhs[0].id);\n    }\n  }, [sheikhs, currentSheikh, selectedSheikhId]);\n\n  const activeSheikh = isAdmin ? sheikhs.find(s => s.id === selectedSheikhId) || sheikhs[0] : (currentSheikh || sheikhs[0]);\n  const myStudents = students.filter(s => s.sheikhId === activeSheikh?.id && (s.status === \'Active\' || s.status === \'active\' || s.status === \'نشط\' || !s.status));',
  '  const [selectedSheikhId, setSelectedSheikhId] = useState<number | \'all\' | null>(\'all\');\n  const [halqaTypeFilter, setHalqaTypeFilter] = useState<string>(\'all\');\n\n  const myStudents = students.filter(s => {\n    const isActive = s.status === \'Active\' || s.status === \'active\' || s.status === \'نشط\' || !s.status;\n    if (!isActive) return false;\n    const matchesSheikh = isAdmin && selectedSheikhId !== \'all\' && selectedSheikhId !== null ? s.sheikhId === Number(selectedSheikhId) : (!isAdmin ? s.sheikhId === currentSheikh?.id : true);\n    const matchesHalqaType = halqaTypeFilter === \'all\' || s.halqaType === halqaTypeFilter;\n    return matchesSheikh && matchesHalqaType;\n  });'
);

// 3. Update admin select in header to include "جميع الحلقات" and add Halqa Type filter
const adminFilterBlock = `          {isAdmin && (
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">اختر الحلقة:</span>
              <select
                value={activeSheikh?.id || \'\'}
                onChange={(e) => setSelectedSheikhId(e.target.value === \'all\' ? \'all\' : Number(e.target.value))}
                className="text-xs font-bold bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
              >
                {sheikhs.map(s => (
                  <option key={s.id} value={s.id}>{s.halqaName} ({s.name})</option>
                ))}
              </select>
            </div>
          )}`;

const updatedAdminFilterBlock = `          {isAdmin && (
            <>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">الحلقة:</span>
                <select
                  value={selectedSheikhId ?? \'all\'}
                  onChange={(e) => setSelectedSheikhId(e.target.value === \'all\' ? \'all\' : Number(e.target.value))}
                  className="text-xs font-bold bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
                >
                  <option value="all">جميع الحلقات والمشايخ</option>
                  {sheikhs.map(s => (
                    <option key={s.id} value={s.id}>{s.halqaName} ({s.name})</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">نوع الحلقة:</span>
                <select
                  value={halqaTypeFilter}
                  onChange={(e) => setHalqaTypeFilter(e.target.value)}
                  className="text-xs font-bold bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
                >
                  <option value="all">جميع أنواع الحلقات</option>
                  {halqaTypes.map(ht => (
                    <option key={ht} value={ht}>{ht}</option>
                  ))}
                </select>
              </div>
            </>
          )}`;

code = code.replace(adminFilterBlock, updatedAdminFilterBlock);

fs.writeFileSync(file, code);
console.log("DailyRecitationSheet updated successfully!");
