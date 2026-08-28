const fs = require('fs');

function fixManager(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  // We need to inject imports if supabase is not there
  if (!code.includes('import { supabase }')) {
    code = code.replace(/import \{([^}]+)\} from 'lucide-react';/, "import {$1} from 'lucide-react';\nimport { supabase } from '../../lib/supabase';");
  }

  // Add state for auth
  code = code.replace(
    /const \[isModalOpen, setIsModalOpen\] = useState\(false\);/,
    `const [isModalOpen, setIsModalOpen] = useState(false);
  const [allowLogin, setAllowLogin] = useState(false);
  const [authUsername, setAuthUsername] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirm, setAuthConfirm] = useState('');`
  );

  // Generate username on name change
  const isAdmin = filePath.includes('AdminsManager');
  const roleName = isAdmin ? 'admin' : 'sheikh';
  const roleObj = isAdmin ? 'newAdmin' : 'newSheikh';
  const roleEditObj = isAdmin ? 'editingAdmin' : 'editingSheikh';

  // We need to intercept the form submit.
  // Original is: const handleSubmit = (e: React.FormEvent) => {
  code = code.replace(
    /const handleSubmit = \(e: React\.FormEvent\) => \{/,
    `const handleSubmit = async (e: React.FormEvent) => {
    if (allowLogin) {
      if (authPassword !== authConfirm) {
        alert("كلمة المرور غير متطابقة");
        e.preventDefault();
        return;
      }
      e.preventDefault();
      const res = await supabase.rpc('admin_create_auth_user', {
        p_email: authEmail,
        p_password: authPassword,
        p_username: authUsername,
        p_name: ${roleEditObj} ? ${roleEditObj}.name : ${roleObj}.name,
        p_phone: ${roleEditObj} ? ${roleEditObj}.phone : ${roleObj}.phone,
        p_role: '${roleName}'
      });
      if (res.error) {
        alert('فشل إنشاء حساب الدخول: ' + res.error.message);
        return;
      }
      // Assuming we continue to add the actual record
    }`
  );

  // Add the UI fields in the form
  const authFields = `
              <div className="md:col-span-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={allowLogin} onChange={(e) => setAllowLogin(e.target.checked)} className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-600" />
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">السماح بتسجيل الدخول إلى النظام</span>
                </label>
              </div>
              {allowLogin && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">اسم المستخدم *</label>
                    <input type="text" required={allowLogin} value={authUsername} onChange={(e) => setAuthUsername(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">البريد الإلكتروني *</label>
                    <input type="email" required={allowLogin} value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">كلمة المرور *</label>
                    <input type="password" required={allowLogin} value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">تأكيد كلمة المرور *</label>
                    <input type="password" required={allowLogin} value={authConfirm} onChange={(e) => setAuthConfirm(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                  </div>
                </>
              )}
  `;

  // Insert before the submit button
  code = code.replace(
    /<div className="md:col-span-2 flex justify-end gap-2 pt-4">/,
    authFields + '\n<div className="md:col-span-2 flex justify-end gap-2 pt-4">'
  );
  
  // In `openModalForEdit`, reset fields
  code = code.replace(
    /setEditing[A-Za-z]+\(.*\);\s*setIsModalOpen\(true\);/g,
    `$& setAllowLogin(false); setAuthUsername(''); setAuthEmail(''); setAuthPassword(''); setAuthConfirm('');`
  );

  // Auto-generate username from name if checked.
  // Actually, we can add a useEffect or just on name change:
  code = code.replace(
    /onChange=\{\(e\) => setNew[A-Za-z]+\(\{ \.\.\.new[A-Za-z]+, name: e\.target\.value \}\)\}/,
    `onChange={(e) => {
      const val = e.target.value;
      setNew${isAdmin?'Admin':'Sheikh'}({ ...new${isAdmin?'Admin':'Sheikh'}, name: val });
      if(!authUsername) setAuthUsername(val.toLowerCase().replace(/\\s+/g, '_') + '_' + Math.floor(1000 + Math.random() * 9000));
    }}`
  );

  fs.writeFileSync(filePath, code);
}

fixManager('src/components/Admin/SheikhsManager.tsx');
fixManager('src/components/Admin/AdminsManager.tsx');
console.log("Fixed manager auth flow");
