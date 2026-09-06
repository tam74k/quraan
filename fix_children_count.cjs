const fs = require('fs');
let code = fs.readFileSync('src/components/Auth/LoginModal.tsx', 'utf8');

code = code.replace(
  /const \{ login, switchRole, centerInfo \} = useApp\(\);/,
  `const { login, switchRole, centerInfo, students } = useApp();`
);

code = code.replace(
  /React\.useEffect\(\(\) => \{[\s\S]*?\}, \[regPhone\]\);/,
  `React.useEffect(() => {
    if (regPhone.length >= 8) {
      const count = students.filter(s => s.parentPhone === regPhone).length;
      setChildrenCount(count);
    } else {
      setChildrenCount(null);
    }
  }, [regPhone, students]);`
);

fs.writeFileSync('src/components/Auth/LoginModal.tsx', code);
console.log("Fixed children count");
