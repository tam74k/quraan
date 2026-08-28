const fs = require('fs');
let code = fs.readFileSync('src/components/Auth/LoginModal.tsx', 'utf8');

code = code.replace(
  /const handleSubmit = \(e: React\.FormEvent\) => \{\s*e\.preventDefault\(\);\s*setError\(''\);\s*const success = login\(email\);\s*if \(!success\) \{/s,
  `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    let loginEmail = email;
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

    const success = login(loginEmail);
    if (!success) {`
);

fs.writeFileSync('src/components/Auth/LoginModal.tsx', code);
console.log("Fixed handleSubmit async");
