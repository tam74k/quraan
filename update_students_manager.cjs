const fs = require('fs');
let file = 'src/components/Admin/StudentsManager.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Destructure halqaTypes
code = code.replace(
  '    extractDOBFromCivilID',
  '    extractDOBFromCivilID,\n    halqaTypes'
);

// 2. Add halqaTypeFilter state
code = code.replace(
  '  const [sheikhFilter, setSheikhFilter] = useState(\'all\');',
  '  const [sheikhFilter, setSheikhFilter] = useState(\'all\');\n  const [halqaTypeFilter, setHalqaTypeFilter] = useState(\'all\');'
);

// 3. Add halqaType to formData init in handleOpenAdd and handleOpenEdit
code = code.replace(
  '    targetJuz: 5\n    });',
  '    targetJuz: 5,\n    halqaType: \'\'\n    });'
);

code = code.replace(
  '    targetJuz: student.targetJuz || 5\n    });',
  '    targetJuz: student.targetJuz || 5,\n    halqaType: student.halqaType || \'\'\n    });'
);

// 4. Update filteredStudents logic
code = code.replace(
  '    const matchesSheikh = sheikhFilter === \'all\' || (sheikhFilter === \'none\' ? s.sheikhId === null : s.sheikhId === Number(sheikhFilter));\n    const matchesStatus = statusFilter === \'all\' || s.status === statusFilter;\n    return matchesSearch && matchesGrade && matchesSheikh && matchesStatus;',
  '    const matchesSheikh = sheikhFilter === \'all\' || (sheikhFilter === \'none\' ? s.sheikhId === null : s.sheikhId === Number(sheikhFilter));\n    const matchesStatus = statusFilter === \'all\' || s.status === statusFilter;\n    const matchesHalqaType = halqaTypeFilter === \'all\' || s.halqaType === halqaTypeFilter;\n    return matchesSearch && matchesGrade && matchesSheikh && matchesStatus && matchesHalqaType;'
);

// 5. Add Halqa Type filter dropdown in filter bar next to Sheikh filter
const sheikhFilterBlock = `        {/* Sheikh */}
        <div>
          <select
            value={sheikhFilter}
            onChange={(e) => setSheikhFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="all">جميع الحلقات والمشايخ</option>
            {sheikhs.map(sh => (
              <option key={sh.id} value={sh.id}>{sh.name} ({sh.halqaName})</option>
            ))}
            <option value="none">بدون شيخ مسند</option>
          </select>
        </div>`;

const halqaTypeFilterBlock = sheikhFilterBlock + `
        {/* Halqa Type Filter */}
        <div>
          <select
            value={halqaTypeFilter}
            onChange={(e) => setHalqaTypeFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="all">جميع أنواع الحلقات</option>
            {halqaTypes.map(ht => (
              <option key={ht} value={ht}>{ht}</option>
            ))}
          </select>
        </div>`;

code = code.replace(sheikhFilterBlock, halqaTypeFilterBlock);

// 6. Add Halqa Type form field in modal form
const targetFormLocation = `            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الشيخ المشرف (الحلقة)</label>`;

const halqaTypeFormField = `            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">نوع الحلقة (اختياري)</label>
              <select
                value={formData.halqaType}
                onChange={(e) => setFormData({ ...formData, halqaType: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="">بدون تحديد نوع الحلقة</option>
                {halqaTypes.map(ht => (
                  <option key={ht} value={ht}>{ht}</option>
                ))}
              </select>
            </div>

            ` + targetFormLocation;

code = code.replace(targetFormLocation, halqaTypeFormField);

fs.writeFileSync(file, code);
console.log("StudentsManager updated successfully!");
