const fs = require('fs');
let file = 'src/components/Admin/AdminsManager.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldRoleBlock = `                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">صلاحية النظام</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'data_entry')}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="admin">مدير النظام (كامل الصلاحيات)</option>
                    <option value="data_entry">مدخل بيانات / شؤون طلاب</option>
                  </select>
                </div>`;

const gridBlock = `                {allowLogin && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">`;

const newGridBlock = `                {allowLogin && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">صلاحية النظام</label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'data_entry')}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                      >
                        <option value="admin">مدير النظام</option>
                        <option value="data_entry">مدخل بيانات</option>
                      </select>
                    </div>`;

if(code.includes(oldRoleBlock)) {
  code = code.replace(oldRoleBlock, '');
  code = code.replace(gridBlock, newGridBlock);
  
  // also, in the previous row, we need to adjust the grid since we removed the role block
  // The row was: grid-cols-1 md:grid-cols-2 with Phone and Email? Wait.
  // Let's check what was in the same grid.
  fs.writeFileSync(file, code);
  console.log("Replaced role block.");
} else {
  console.log("Could not find oldRoleBlock");
}
