const fs = require('fs');
let file = 'src/components/Sheikh/DailyRecitationSheet.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Add currentUser to useApp destructured variables
code = code.replace(
  'const {\n    students,\n    sheikhs,\n    currentSheikh,\n    tracking,\n    saveBatchTrackingRecords\n  } = useApp();',
  'const {\n    currentUser,\n    students,\n    sheikhs,\n    currentSheikh,\n    tracking,\n    saveBatchTrackingRecords\n  } = useApp();'
);

// 2. Add state for selected sheikh and redefine activeSheikh
const oldActiveSheikh = `  const activeSheikh = currentSheikh || sheikhs[0];
  const myStudents = students.filter(s => s.sheikhId === activeSheikh?.id && s.status === 'Active');`;

const newActiveSheikh = `  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'data_entry';
  const [selectedSheikhId, setSelectedSheikhId] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedSheikhId && sheikhs.length > 0) {
      setSelectedSheikhId(currentSheikh?.id || sheikhs[0].id);
    }
  }, [sheikhs, currentSheikh, selectedSheikhId]);

  const activeSheikh = isAdmin ? sheikhs.find(s => s.id === selectedSheikhId) || sheikhs[0] : (currentSheikh || sheikhs[0]);
  const myStudents = students.filter(s => s.sheikhId === activeSheikh?.id && (s.status === 'Active' || s.status === 'active' || s.status === 'نشط' || !s.status));`;

code = code.replace(oldActiveSheikh, newActiveSheikh);

// 3. Add Sheikh Selector to the UI for admins
const oldDateSelector = `<div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">`;

const newDateSelector = `<div className="flex flex-wrap items-center gap-3">
          {isAdmin && (
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">اختر الحلقة:</span>
              <select
                value={activeSheikh?.id || ''}
                onChange={(e) => setSelectedSheikhId(Number(e.target.value))}
                className="text-xs font-bold bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
              >
                {sheikhs.map(s => (
                  <option key={s.id} value={s.id}>{s.halqaName} ({s.name})</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">`;

code = code.replace(oldDateSelector, newDateSelector);

fs.writeFileSync(file, code);
