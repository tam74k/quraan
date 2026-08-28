const fs = require('fs');
let code = fs.readFileSync('src/components/Admin/CenterSettings.tsx', 'utf8');

// Ensure supabase is imported
if (!code.includes('import { supabase }')) {
  code = code.replace(/import \{([^}]+)\} from 'lucide-react';/, "import {$1} from 'lucide-react';\nimport { supabase } from '../../lib/supabase';");
}

code = code.replace(
  /const handleLogoUpload = \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?reader\.readAsDataURL\(file\);\s*\}\s*\};/,
  `const [isUploading, setIsUploading] = useState(false);
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = \`logo-\${Date.now()}.\${fileExt}\`;
        const { data, error } = await supabase.storage.from('pics').upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

        if (error) {
          throw error;
        }

        const { data: publicUrlData } = supabase.storage.from('pics').getPublicUrl(fileName);
        if (publicUrlData) {
          setFormData(prev => ({ ...prev, logo: publicUrlData.publicUrl }));
        }
      } catch (error: any) {
        alert('فشل رفع الشعار: ' + error.message);
      } finally {
        setIsUploading(false);
      }
    }
  };`
);

// We need to add isUploading to the UI somehow. Let's find the Logo upload button.
code = code.replace(
  /<button\s+type="button"\s+onClick=\{[^}]+\}\s+className="[^"]+"\s*>\s*<Upload className="w-4 h-4" \/>\s*تغيير الشعار\s*<\/button>/,
  `<button
                        type="button"
                        onClick={() => document.getElementById('logo-upload')?.click()}
                        disabled={isUploading}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        {isUploading ? 'جاري الرفع...' : 'تغيير الشعار'}
                      </button>`
);

fs.writeFileSync('src/components/Admin/CenterSettings.tsx', code);
console.log("Updated CenterSettings.tsx");
