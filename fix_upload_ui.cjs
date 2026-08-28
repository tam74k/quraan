const fs = require('fs');
let code = fs.readFileSync('src/components/Admin/CenterSettings.tsx', 'utf8');

code = code.replace(
  /<input\s*type="file"\s*accept="image\/\*"\s*onChange=\{handleLogoUpload\}\s*className="[^"]+"\s*\/>/,
  `{isUploading ? (
                  <div className="text-xs font-bold text-emerald-600 animate-pulse py-2">جاري الرفع...</div>
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="text-xs text-slate-500 file:mr-0 file:ml-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-950 dark:file:text-emerald-300 cursor-pointer"
                  />
                )}`
);

fs.writeFileSync('src/components/Admin/CenterSettings.tsx', code);
