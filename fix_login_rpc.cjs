const fs = require('fs');
let code = fs.readFileSync('src/components/Auth/LoginModal.tsx', 'utf8');

code = code.replace(
  /\/\/ Use standard auth signUp for parents creating their own accounts[\s\S]*?if \(res\.error\) \{/m,
  `const res = await supabase.rpc('admin_create_auth_user', {
              p_email: forgotEmail,
              p_password: password,
              p_username: regUsername,
              p_name: regName,              
              p_phone: regPhone,
              p_role: 'parent'
            });
            if (res.error) {`
);

fs.writeFileSync('src/components/Auth/LoginModal.tsx', code);
console.log("Fixed login to use RPC");
