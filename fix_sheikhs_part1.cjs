const fs = require('fs');
let file = 'src/components/Admin/SheikhsManager.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Remove duplicate email & update labels
code = code.replace(/البريد الإلكتروني \(لتسجيل الدخول\)/g, 'البريد الإلكتروني');

// Remove authEmail state
code = code.replace(/const \[authEmail, setAuthEmail\] = useState\(''\);\s*/, '');
// Replace authEmail with formData.email in the signup call
code = code.replace(/email: authEmail,/g, 'email: formData.email,');

// Remove the authEmail input field from the UI
const authEmailSection = `                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">البريد الإلكتروني</label>
                      <input type="email" required={allowLogin} value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none" />
                    </div>`;
code = code.replace(authEmailSection, '');

// Make halqa name optional
const halqaInputRequired = `type="text"
                    required
                    value={formData.halqaName}`;
const halqaInputOptional = `type="text"
                    value={formData.halqaName}`;
code = code.replace(halqaInputRequired, halqaInputOptional);

// 2. Add Status Toggle in Table (instead of just span)
const statusSpan = `<span className={\`px-2.5 py-0.5 rounded-full text-[10px] font-bold \${
                    sheikh.active
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }\`}>
                    {sheikh.active ? 'نشط' : 'معطل'}
                  </span>`;

const statusToggleBtn = `<button
                    onClick={() => updateSheikh(sheikh.id, { active: !sheikh.active })}
                    className={\`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors \${
                      sheikh.active
                        ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
                    }\`}
                    title="انقر لتغيير حالة الحساب"
                  >
                    {sheikh.active ? 'نشط' : 'غير نشط'}
                  </button>`;
code = code.replace(statusSpan, statusToggleBtn);

// Also remove "معطل" to "غير نشط" where applicable
code = code.replace(/'معطل'/g, "'غير نشط'");

fs.writeFileSync(file, code);
console.log('Fixed SheikhsManager part 1');
