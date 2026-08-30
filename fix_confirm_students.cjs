const fs = require('fs');
let file = 'src/components/Admin/StudentsManager.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetHandleDelete = `  const handleDelete = (student: Student) => {
    if (window.confirm(\`هل أنت متأكد من رغبتك في حذف الطالب (\${student.name}) نهائياً من السجلات؟\`)) {
      deleteStudent(student.id);
    }
  };`;

const replacementHandleDelete = `  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const handleDelete = (student: Student) => {
    deleteStudent(student.id);
    setDeleteConfirm(null);
  };`;

if(code.includes(targetHandleDelete)) {
  code = code.replace(targetHandleDelete, replacementHandleDelete);
} else {
  console.log("targetHandleDelete not found in StudentsManager!");
}

const targetButton = `                          <button
                            onClick={() => handleDelete(student)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="حذف الطالب"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>`;

const replacementButton = `                          {deleteConfirm === student.id ? (
                            <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-900/30 p-1 rounded-lg">
                              <span className="text-[10px] text-rose-600 font-bold px-1">حذف؟</span>
                              <button onClick={() => handleDelete(student)} className="p-1 text-rose-700 hover:bg-rose-200 dark:hover:bg-rose-800 rounded">نعم</button>
                              <button onClick={() => setDeleteConfirm(null)} className="p-1 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 rounded">لا</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(student.id)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="حذف الطالب"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}`;

if(code.includes(targetButton)) {
  code = code.replace(targetButton, replacementButton);
} else {
  console.log("targetButton not found in StudentsManager!");
}

fs.writeFileSync(file, code);
console.log("Fixed StudentsManager");
