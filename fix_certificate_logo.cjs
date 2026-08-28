const fs = require('fs');
let code = fs.readFileSync('src/components/Common/CertificateModal.tsx', 'utf8');

const target = `{/* Center Header */}
            <div className="my-3">
              <h2 className="text-xl sm:text-2xl font-black text-emerald-900 dark:text-emerald-300">
                {centerInfo.name}
              </h2>`;

const replacement = `{/* Center Header */}
            <div className="my-3 flex flex-col items-center justify-center">
              {centerInfo.logo && (
                <img src={centerInfo.logo} alt={centerInfo.name} className="w-20 h-20 sm:w-24 sm:h-24 object-contain mb-3 drop-shadow-sm" />
              )}
              <h2 className="text-xl sm:text-2xl font-black text-emerald-900 dark:text-emerald-300">
                {centerInfo.name}
              </h2>`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/Common/CertificateModal.tsx', code);
console.log("Fixed certificate logo");
