const fs = require('fs');
let file = 'src/components/Admin/StudentsManager.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الحلقة والشيخ المسند إليه</label>
                  <select
                    value={formData.sheikhId}
                    onChange={(e) => setFormData({ ...formData, sheikhId: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="">-- بدون حلقة حالياً --</option>
                    {sheikhs.map(s => (
                      <option key={s.id} value={s.id.toString()}>{s.name} {s.halqaName ? \`(\${s.halqaName})\` : ''}</option>
                    ))}
                  </select>
                </div>`;

const replaceStr = `                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الحلقة والشيخ المسند إليه</label>
                  <select
                    value={formData.sheikhId}
                    onChange={(e) => setFormData({ ...formData, sheikhId: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="">-- بدون حلقة حالياً --</option>
                    {sheikhs.map(s => (
                      <option key={s.id} value={s.id.toString()}>{s.name} {s.halqaName ? \`(\${s.halqaName})\` : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">حالة الحساب</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-bold"
                  >
                    <option value="Active">نشط</option>
                    <option value="Inactive">غير نشط (معطل)</option>
                  </select>
                </div>`;

code = code.replace(targetStr, replaceStr);

// Also need to ensure `status` is in formData
code = code.replace(/grade: 'المتوسط',/g, "grade: 'المتوسط',\n    status: 'Active',");

// Also add it in handleOpenEdit
const targetHandleOpenEdit = `    setFormData({
      name: student.name,
      civilId: student.civilId,
      dob: student.dob,
      grade: student.grade,
      parentName: student.parentName || '',
      parentPhone: student.parentPhone,
      parentEmail: student.parentEmail || '',
      sheikhId: student.sheikhId ? student.sheikhId.toString() : ''
    });`;

const replaceHandleOpenEdit = `    setFormData({
      name: student.name,
      civilId: student.civilId,
      dob: student.dob,
      grade: student.grade,
      parentName: student.parentName || '',
      parentPhone: student.parentPhone,
      parentEmail: student.parentEmail || '',
      sheikhId: student.sheikhId ? student.sheikhId.toString() : '',
      status: student.status
    });`;
code = code.replace(targetHandleOpenEdit, replaceHandleOpenEdit);

// And update payload
const targetPayload = `    const payload = {
      name: formData.name,
      civilId: formData.civilId,
      dob: formData.dob,
      grade: formData.grade,
      parentName: formData.parentName,
      parentPhone: formData.parentPhone,
      parentEmail: formData.parentEmail,
      sheikhId: formData.sheikhId ? parseInt(formData.sheikhId) : null
    };`;

const replacePayload = `    const payload = {
      name: formData.name,
      civilId: formData.civilId,
      dob: formData.dob,
      grade: formData.grade,
      parentName: formData.parentName,
      parentPhone: formData.parentPhone,
      parentEmail: formData.parentEmail,
      sheikhId: formData.sheikhId ? parseInt(formData.sheikhId) : null,
      status: formData.status
    };`;

code = code.replace(targetPayload, replacePayload);

fs.writeFileSync(file, code);
console.log('Fixed StudentsManager form status');
