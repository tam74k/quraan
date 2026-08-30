const fs = require('fs');
let file = 'src/components/Admin/SheikhsManager.tsx';
let code = fs.readFileSync(file, 'utf8');

const startIdx = code.indexOf('  const handleSubmit = async (e: React.FormEvent) => {');
const endIdx = code.indexOf('  };', startIdx) + 4;

const newHandleSubmit = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let newAuthId = undefined;
    if (allowLogin) {
      if (authPassword !== authConfirm) {
        alert("كلمة المرور غير متطابقة");
        return;
      }
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
            role: 'sheikh'
          }
        }
      });
      if (res.error) {
        alert('فشل إنشاء حساب الدخول: ' + res.error.message);
        return;
      }
      newAuthId = res.data.user?.id;
    }
    
    const payload = {
      userId: editingSheikh?.userId || (typeof newAuthId !== 'undefined' ? newAuthId : null),
      name: formData.name,
      civilId: formData.civilId,
      phone: formData.phone,
      email: formData.email,
      halqaName: formData.halqaName || '',
      bio: formData.bio,
      active: formData.active
    };
    
    if (editingSheikh) {
      updateSheikh(editingSheikh.id, payload);
    } else {
      addSheikh(payload);
      if (payload.userId) { 
        addUser({
          id: payload.userId,
          name: formData.name,
          email: formData.email || '',
          role: 'sheikh',
          phone: formData.phone
        });
      }
    }
    setIsModalOpen(false);
  };`;

code = code.substring(0, startIdx) + newHandleSubmit + code.substring(endIdx);
fs.writeFileSync(file, code);
console.log('Fixed submit for real');
