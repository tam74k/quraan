const fs = require('fs');
let code = fs.readFileSync('src/components/Auth/LoginModal.tsx', 'utf8');

const target = `<div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-amber-300 mx-auto mb-4 shadow-lg">
            <BookOpen className="w-8 h-8" />
          </div>`;

const replacement = `<div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-amber-300 mx-auto mb-4 shadow-lg overflow-hidden">
            {centerInfo.logo ? (
              <img src={centerInfo.logo} alt={centerInfo.name} className="w-full h-full object-cover" />
            ) : (
              <BookOpen className="w-8 h-8" />
            )}
          </div>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/Auth/LoginModal.tsx', code);
console.log("Fixed LoginModal logo");
