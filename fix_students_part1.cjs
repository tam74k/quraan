const fs = require('fs');
let file = 'src/components/Admin/StudentsManager.tsx';
let code = fs.readFileSync(file, 'utf8');

const statusSpan = `<span className={\`px-2.5 py-1 rounded-full font-bold text-[10px] \${
                          student.status === 'Active'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }\`}>
                          {student.status === 'Active' ? 'نشط' : 'غير نشط'}
                        </span>`;

const statusToggleBtn = `<button
                          onClick={() => updateStudent(student.id, { status: student.status === 'Active' ? 'Inactive' : 'Active' })}
                          className={\`px-2.5 py-1 rounded-full font-bold text-[10px] transition-colors \${
                            student.status === 'Active'
                              ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
                          }\`}
                          title="انقر لتغيير حالة الحساب"
                        >
                          {student.status === 'Active' ? 'نشط' : 'غير نشط'}
                        </button>`;
                        
code = code.replace(statusSpan, statusToggleBtn);

fs.writeFileSync(file, code);
console.log('Fixed StudentsManager part 1');
