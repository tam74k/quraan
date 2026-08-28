const fs = require('fs');
let code = fs.readFileSync('src/components/Auth/LoginModal.tsx', 'utf8');

code = code.replace(
  /const res = await supabase\.rpc\('admin_create_auth_user', \{[\s\S]*?\}\);/,
  `// Use standard auth signUp for parents creating their own accounts
            const res = await supabase.auth.signUp({
              email: forgotEmail,
              password: password,
              options: {
                data: {
                  username: regUsername,
                  name: regName,
                  phone: regPhone,
                  role: 'parent'
                }
              }
            });
            
            // If sign up successful, we also need to manually insert into profiles since the trigger might not handle username properly if we don't have it mapped, but let's assume trigger handles it or we can insert here.
            if (!res.error && res.data?.user) {
              const { error: profileErr } = await supabase.from('profiles').upsert({
                id: res.data.user.id,
                username: regUsername,
                email: forgotEmail,
                name: regName,
                phone: regPhone,
                role: 'parent'
              });
              if (profileErr) {
                console.error("Profile creation error:", profileErr);
              }
            }`
);

fs.writeFileSync('src/components/Auth/LoginModal.tsx', code);
console.log("Fixed login signup");
