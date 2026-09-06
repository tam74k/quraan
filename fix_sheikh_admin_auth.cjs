const fs = require('fs');

const fixFile = (file) => {
  let code = fs.readFileSync(file, 'utf8');

  // Remove civilId required
  code = code.replace(
    /type="text"\s+required\s+value=\{formData\.civilId\}/g,
    'type="text" value={formData.civilId}'
  );

  // Add UI for allowLogin
  const loginUI = `
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-2 mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowLogin}
                    onChange={(e) => setAllowLogin(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">السماح بالدخول على النظام</span>
                </label>
                {allowLogin && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">اسم المستخدم</label>
                      <input type="text" required={allowLogin} value={authUsername} onChange={e => setAuthUsername(e.target.value)} className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">البريد الإلكتروني</label>
                      <input type="email" required={allowLogin} value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">كلمة المرور</label>
                      <input type="password" required={allowLogin} value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">تأكيد كلمة المرور</label>
                      <input type="password" required={allowLogin} value={authConfirm} onChange={e => setAuthConfirm(e.target.value)} className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none" />
                    </div>
                  </div>
                )}
              </div>
`;

  // Insert login UI before the actions div
  code = code.replace(
    /(\s*)<div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">/,
    `\n${loginUI}$1<div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">`
  );
  
  // also add resetting states on handleClose / handleOpenEdit
  // In setFormData of openEdit, we also need to reset allowLogin
  code = code.replace(
    /setEditingSheikh\(null\);\s*setFormData\(\{/g,
    'setEditingSheikh(null);\n    setAllowLogin(false);\n    setAuthUsername("");\n    setAuthEmail("");\n    setAuthPassword("");\n    setAuthConfirm("");\n    setFormData({'
  );

  code = code.replace(
    /setEditingAdmin\(null\);\s*setFormData\(\{/g,
    'setEditingAdmin(null);\n    setAllowLogin(false);\n    setAuthUsername("");\n    setAuthEmail("");\n    setAuthPassword("");\n    setAuthConfirm("");\n    setFormData({'
  );

  fs.writeFileSync(file, code);
  console.log("Fixed", file);
}

fixFile('src/components/Admin/SheikhsManager.tsx');
fixFile('src/components/Admin/AdminsManager.tsx');

