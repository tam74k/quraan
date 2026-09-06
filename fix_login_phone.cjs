const fs = require('fs');
let code = fs.readFileSync('src/components/Auth/LoginModal.tsx', 'utf8');

if (!code.includes('const [childrenCount, setChildrenCount] = useState<number | null>(null);')) {
  code = code.replace(
    /const \[forgotEmail, setForgotEmail\] = useState\(''\);/,
    `const [forgotEmail, setForgotEmail] = useState('');
  const [childrenCount, setChildrenCount] = useState<number | null>(null);

  React.useEffect(() => {
    if (regPhone.length >= 8) {
      supabase.from('students').select('id', { count: 'exact', head: true }).eq('parent_phone', regPhone)
        .then(({ count }) => {
          setChildrenCount(count);
        });
    } else {
      setChildrenCount(null);
    }
  }, [regPhone]);`
  );
}

// Add the UI notification below the phone field
code = code.replace(
  /<input type="text" required value=\{regPhone\} onChange=\{\(e\) => setRegPhone\(e.target.value\)\} [^>]+ \/>\s*<\/div>/,
  `$&
            {childrenCount !== null && (
              <div className="mt-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {childrenCount > 0 
                  ? \`تم العثور على \${childrenCount} أبناء مسجلين بهذا الرقم\` 
                  : 'لم يتم العثور على أبناء مسجلين بهذا الرقم في النظام'}
              </div>
            )}`
);

fs.writeFileSync('src/components/Auth/LoginModal.tsx', code);
console.log("Fixed phone children count");
