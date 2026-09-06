const fs = require('fs');
let file = 'src/components/Admin/ReportsView.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Add print date to Sheikh Students Report
const sheikhHeaderOld = `<div className="text-left text-sm font-bold text-slate-600">
                كشف بأسماء طلاب حلقة: {activeSheikh?.halqaName || 'عامة'}
              </div>`;
const sheikhHeaderNew = `<div className="text-left text-sm font-bold text-slate-600">
                <div>كشف بأسماء طلاب حلقة: {activeSheikh?.halqaName || 'عامة'}</div>
                <div className="text-[10px] mt-2 font-normal text-slate-400">تاريخ الطباعة: {new Date().toLocaleDateString('ar-KW')}</div>
              </div>`;
code = code.replace(sheikhHeaderOld, sheikhHeaderNew);

// 2. Add print date to All Students Report
const allHeaderOld = `<div className="text-left text-sm font-bold text-slate-600">
                كشف بأسماء جميع طلاب المركز
              </div>`;
const allHeaderNew = `<div className="text-left text-sm font-bold text-slate-600">
                <div>كشف بأسماء جميع طلاب المركز</div>
                <div className="text-[10px] mt-2 font-normal text-slate-400">تاريخ الطباعة: {new Date().toLocaleDateString('ar-KW')}</div>
              </div>`;
code = code.replace(allHeaderOld, allHeaderNew);

// 3. Relax active condition for halqaStudents and allStudents
code = code.replace(
  "const halqaStudents = students.filter(s => s.sheikhId === selectedSheikhId && s.status === 'Active');",
  "const halqaStudents = students.filter(s => s.sheikhId === selectedSheikhId && (!s.status || s.status === 'Active' || s.status === 'active' || s.status === 'نشط'));"
);

code = code.replace(
  "{students.filter(s => s.status === 'Active').map((st, i) => (",
  "{students.filter(s => !s.status || s.status === 'Active' || s.status === 'active' || s.status === 'نشط').map((st, i) => ("
);

// 4. Update the default selectedSheikhId dynamically.
// In ReportsView: const [selectedSheikhId, setSelectedSheikhId] = useState<number>(sheikhs[0]?.id || 1);
// That doesn't update when sheikhs loads later. Let's fix selectedSheikhId to use activeSheikh which falls back to sheikhs[0]
// Or better, let's just make activeSheikh = sheikhs.find(s => s.id === selectedSheikhId) || sheikhs[0];
// And halqaStudents use activeSheikh?.id instead of selectedSheikhId.
code = code.replace(
  "const activeSheikh = sheikhs.find(s => s.id === selectedSheikhId) || sheikhs[0];",
  "const activeSheikh = sheikhs.find(s => s.id === selectedSheikhId) || sheikhs[0];"
);
code = code.replace(
  "const halqaStudents = students.filter(s => s.sheikhId === selectedSheikhId && (!s.status || s.status === 'Active' || s.status === 'active' || s.status === 'نشط'));",
  "const halqaStudents = students.filter(s => s.sheikhId === activeSheikh?.id && (!s.status || s.status === 'Active' || s.status === 'active' || s.status === 'نشط'));"
);

fs.writeFileSync(file, code);
