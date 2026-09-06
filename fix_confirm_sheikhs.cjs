const fs = require('fs');
let file = 'src/components/Admin/SheikhsManager.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetHandleDelete = `  const handleDelete = (sheikh: Sheikh) => {
    if (window.confirm(\`هل أنت متأكد من حذف الشيخ (\${sheikh.name})؟\`)) {
      deleteSheikh(sheikh.id);
      if (sheikh.userId) {
        deleteUser(sheikh.userId);
      }
    }
  };`;

const replacementHandleDelete = `  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const handleDelete = (sheikh: Sheikh) => {
    deleteSheikh(sheikh.id);
    if (sheikh.userId) {
      deleteUser(sheikh.userId);
    }
    setDeleteConfirm(null);
  };`;

if(code.includes(targetHandleDelete)) {
  code = code.replace(targetHandleDelete, replacementHandleDelete);
} else {
  console.log("targetHandleDelete not found in SheikhsManager!");
}

const targetButton = `                  <button
                    onClick={() => handleDelete(sheikh)}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>`;

const replacementButton = `                  {deleteConfirm === sheikh.id ? (
                    <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-900/30 p-1 rounded-lg">
                      <span className="text-[10px] text-rose-600 font-bold px-1">تأكيد؟</span>
                      <button onClick={() => handleDelete(sheikh)} className="p-1 text-rose-700 hover:bg-rose-200 dark:hover:bg-rose-800 rounded">نعم</button>
                      <button onClick={() => setDeleteConfirm(null)} className="p-1 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 rounded">لا</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(sheikh.id)}
                      className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}`;

if(code.includes(targetButton)) {
  code = code.replace(targetButton, replacementButton);
} else {
  console.log("targetButton not found in SheikhsManager!");
}

fs.writeFileSync(file, code);
console.log("Fixed SheikhsManager");
