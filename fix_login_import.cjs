const fs = require('fs');
let code = fs.readFileSync('src/components/Auth/LoginModal.tsx', 'utf8');
if (!code.includes('import { supabase }')) {
  code = code.replace(
    /import \{ useApp \} from '\.\.\/\.\.\/context\/AppContext';/,
    `import { useApp } from '../../context/AppContext';\nimport { supabase } from '../../lib/supabase';`
  );
  fs.writeFileSync('src/components/Auth/LoginModal.tsx', code);
  console.log("Fixed import");
}
