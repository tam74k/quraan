const fs = require('fs');
let code = fs.readFileSync('src/components/Auth/LoginModal.tsx', 'utf8');

// The user wants to login by username AND email. 
// We will update handleSubmit to check if the email doesn't have @, then fetch the profile email.

code = code.replace(
  /const handleSubmit = async \(e: React\.FormEvent\) => \{[\s\S]*?if \(!success\) \{/,
  `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    let loginEmail = email;
    // If not email format, assume it's a username and fetch email from profiles
    if (!email.includes('@')) {
        const { data, error: profileErr } = await supabase.from('profiles').select('email').eq('username', email).single();
        if (profileErr || !data) {
            setError('اسم المستخدم غير صحيح أو غير مسجل.');
            return;
        }
        loginEmail = data.email;
    }

    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password
    });

    if (authErr) {
        setError('بيانات الدخول غير صحيحة.');
        return;
    }

    const success = login(loginEmail, password);
    if (!success) {`
);

// We also need to add "إنشاء حساب ولي أمر" UI state
code = code.replace(
  /const \[isForgot, setIsForgot\] = useState\(false\);/,
  `const [isForgot, setIsForgot] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPhone, setRegPhone] = useState('');`
);

const registerForm = `
        ) : isRegister ? (
          <form onSubmit={async (e) => {
            e.preventDefault();
            setError('');
            const res = await supabase.rpc('admin_create_auth_user', {
              p_email: forgotEmail,
              p_password: password,
              p_username: regUsername,
              p_name: regName,
              p_phone: regPhone,
              p_role: 'parent'
            });
            if (res.error) {
              setError('حدث خطأ أثناء إنشاء الحساب: ' + res.error.message);
            } else {
              setForgotMsg('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.');
              setIsRegister(false);
            }
          }} className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">إنشاء حساب ولي أمر</h3>
            {error && (
              <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">الاسم الكامل</label>
              <input type="text" required value={regName} onChange={(e) => setRegName(e.target.value)} className="w-full px-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">اسم المستخدم</label>
              <input type="text" required value={regUsername} onChange={(e) => setRegUsername(e.target.value)} className="w-full px-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">البريد الإلكتروني</label>
              <input type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="w-full px-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">رقم الجوال</label>
              <input type="text" required value={regPhone} onChange={(e) => setRegPhone(e.target.value)} className="w-full px-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">كلمة المرور</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition-all">إنشاء الحساب</button>
            <button type="button" onClick={() => setIsRegister(false)} className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 py-1">إلغاء</button>
          </form>
`;

code = code.replace(/\{!isForgot \? \(/, '{!isForgot && !isRegister ? (');
code = code.replace(/\) : \(\s*<form onSubmit=\{handleForgotSubmit\}/, registerForm + ') : (\n          <form onSubmit={handleForgotSubmit}');

// Add the "إنشاء حساب ولي أمر" button under Login
const createBtn = `<button
              type="button"
              onClick={() => { setIsRegister(true); setIsForgot(false); setForgotMsg(''); setError(''); }}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl shadow-sm transition-all mt-2 cursor-pointer"
            >
              إنشاء حساب ولي أمر جديد
            </button>`;
code = code.replace(/تسجيل الدخول للنظام\s*<\/button>/, 'تسجيل الدخول للنظام\n            </button>\n            ' + createBtn);

// Also change label 'البريد الإلكتروني' to 'البريد الإلكتروني أو اسم المستخدم'
code = code.replace(
  /<label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1\.5">البريد الإلكتروني<\/label>/,
  '<label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">البريد الإلكتروني أو اسم المستخدم</label>'
);
code = code.replace(
  /type="email"\s*required\s*value=\{email\}/,
  'type="text"\n                required\n                value={email}'
);
code = code.replace(
  /import \{ useApp \} from '\.\.\/context\/AppContext';/,
  `import { useApp } from '../context/AppContext';\nimport { supabase } from '../lib/supabase';`
);

fs.writeFileSync('src/components/Auth/LoginModal.tsx', code);
console.log("Fixed LoginModal");
