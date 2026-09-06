const fs = require('fs');
let file = 'src/components/Admin/CenterSettings.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Destructure halqaTypes, addHalqaType, updateHalqaType, deleteHalqaType
code = code.replace(
  '    resetToDemoData',
  '    resetToDemoData,\n    halqaTypes,\n    addHalqaType,\n    updateHalqaType,\n    deleteHalqaType'
);

// 2. Add local state for halqa type management
code = code.replace(
  '  const [isUploading, setIsUploading] = useState(false);',
  '  const [isUploading, setIsUploading] = useState(false);\n  const [newHalqaTypeName, setNewHalqaTypeName] = useState(\'\');\n  const [editingOld, setEditingOld] = useState<string | null>(null);\n  const [editingName, setEditingName] = useState(\'\');'
);

// 3. Add UI section for Halqa Types management before Backup & Restore
const targetSection = '      {/* Backup & Restore Tools */}';
const halqaTypesUI = `      {/* Halqa Types Management */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xs mb-6">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">إدارة أنواع الحلقات (القائمة المنسدلة للطلاب)</h3>
        <p className="text-xs text-slate-400 mb-6">يمكنك إضافة أو تعديل أو حذف أنواع الحلقات التي تظهر عند تسجيل وتعديل بيانات الطلاب.</p>
        
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newHalqaTypeName}
            onChange={(e) => setNewHalqaTypeName(e.target.value)}
            placeholder="اسم نوع الحلقة الجديدة (مثل: حلقة تلاوة وتدبر)..."
            className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              if (newHalqaTypeName.trim()) {
                addHalqaType(newHalqaTypeName);
                setNewHalqaTypeName('');
                setSuccessMsg('تم إضافة نوع الحلقة بنجاح');
                setTimeout(() => setSuccessMsg(''), 3000);
              }
            }}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            إضافة نوع جديد
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {halqaTypes.map((ht) => (
            <div key={ht} className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between gap-2">
              {editingOld === ht ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-850 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (editingName.trim()) {
                        updateHalqaType(ht, editingName);
                        setEditingOld(null);
                        setSuccessMsg('تم تحديث نوع الحلقة بنجاح');
                        setTimeout(() => setSuccessMsg(''), 3000);
                      }
                    }}
                    className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg"
                  >
                    حفظ
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingOld(null)}
                    className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-lg"
                  >
                    إلغاء
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{ht}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => { setEditingOld(ht); setEditingName(ht); }}
                      className="p-1.5 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                      title="تعديل"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(\`هل أنت متأكد من حذف النوع (\${ht})؟\`)) {
                          deleteHalqaType(ht);
                          setSuccessMsg('تم حذف نوع الحلقة بنجاح');
                          setTimeout(() => setSuccessMsg(''), 3000);
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                      title="حذف"
                    >
                      🗑️
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Backup & Restore Tools */}`;

code = code.replace(targetSection, halqaTypesUI);
fs.writeFileSync(file, code);
console.log("CenterSettings updated successfully!");
