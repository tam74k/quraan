const fs = require('fs');
let file = 'src/components/Admin/AdminsManager.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Add error state
code = code.replace(
  'const [formData, setFormData] = useState({',
  'const [errorMsg, setErrorMsg] = useState("");\n  const [formData, setFormData] = useState({'
);

// 2. Reset error state on modal open
code = code.replace(
  'const handleOpenAdd = () => {\n    setEditingAdmin(null);',
  'const handleOpenAdd = () => {\n    setErrorMsg("");\n    setEditingAdmin(null);'
);
code = code.replace(
  'const handleOpenEdit = (admin: AdminRole) => {\n    setEditingAdmin(admin);',
  'const handleOpenEdit = (admin: AdminRole) => {\n    setErrorMsg("");\n    setEditingAdmin(admin);'
);

// 3. Replace alerts in handleSubmit
let handleSubmitTarget = `  const handleSubmit = async (e: React.FormEvent) => {
    if (allowLogin) {
      if (authPassword !== authConfirm) {
        alert("كلمة المرور غير متطابقة");
        e.preventDefault();
        return;
      }
      e.preventDefault();
      const { data: existingUser } = await supabase.from('profiles').select('id').eq('username', authUsername).maybeSingle();
      if (existingUser) {
        alert('اسم المستخدم هذا مستخدم بالفعل، الرجاء اختيار اسم آخر.');
        return;
      }
      const res = await supabaseSecondary.auth.signUp({
        email: formData.email,
        password: authPassword,
        options: {
          data: {
            username: authUsername,
            name: formData.name,
            phone: formData.phone,
            role: selectedRole
          }
        }
      });
      if (res.error) {
        alert('فشل إنشاء حساب الدخول: ' + res.error.message);
        return;
      }
      var newAuthId = res.data.user?.id;
      // Assuming we continue to add the actual record
    }
    e.preventDefault();`;

let handleSubmitReplace = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (allowLogin) {
      if (authPassword !== authConfirm) {
        setErrorMsg("كلمة المرور غير متطابقة");
        return;
      }
      const { data: existingUser } = await supabase.from('profiles').select('id').eq('username', authUsername).maybeSingle();
      if (existingUser) {
        setErrorMsg('اسم المستخدم هذا مستخدم بالفعل، الرجاء اختيار اسم آخر.');
        return;
      }
      const res = await supabaseSecondary.auth.signUp({
        email: formData.email,
        password: authPassword,
        options: {
          data: {
            username: authUsername,
            name: formData.name,
            phone: formData.phone,
            role: selectedRole
          }
        }
      });
      if (res.error) {
        if (res.error.message.includes('already registered')) {
          setErrorMsg('البريد الإلكتروني هذا مستخدم بالفعل، الرجاء اختيار بريد آخر.');
        } else {
          setErrorMsg('فشل إنشاء حساب الدخول: ' + res.error.message);
        }
        return;
      }
      var newAuthId = res.data.user?.id;
      // Assuming we continue to add the actual record
    }`;

code = code.replace(handleSubmitTarget, handleSubmitReplace);

// 4. Show error message in UI
const modalHeaderTarget = `<h2 className="text-xl font-black text-slate-800 dark:text-slate-100">
                {editingAdmin ? 'تعديل بيانات العضو' : 'إضافة عضو جديد'}
              </h2>
            </div>
            <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">`;

const modalHeaderReplace = `<h2 className="text-xl font-black text-slate-800 dark:text-slate-100">
                {editingAdmin ? 'تعديل بيانات العضو' : 'إضافة عضو جديد'}
              </h2>
            </div>
            <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {errorMsg && (
              <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <p className="text-sm font-bold text-rose-800 dark:text-rose-300">{errorMsg}</p>
              </div>
            )}`;

code = code.replace(modalHeaderTarget, modalHeaderReplace);

fs.writeFileSync(file, code);
