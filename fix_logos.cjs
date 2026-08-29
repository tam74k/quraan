const fs = require('fs');

const fixNavbar = () => {
  const file = 'src/components/Layout/Navbar.tsx';
  let code = fs.readFileSync(file, 'utf8');
  
  // Update the container
  code = code.replace(
    /<div className="w-10 h-10 rounded-xl bg-linear-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-amber-300 shadow-md">/,
    '<div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center text-amber-300 shadow-sm border border-slate-100 dark:border-slate-800 p-1">'
  );
  
  // Update the image object-cover -> object-contain
  code = code.replace(
    /<img src=\{centerInfo\.logo\} alt="Center Logo" className="w-full h-full object-cover rounded-xl" \/>/,
    '<img src={centerInfo.logo} alt="Center Logo" className="w-full h-full object-contain rounded-lg" />'
  );
  
  fs.writeFileSync(file, code);
  console.log('Fixed Navbar');
}

const fixLogin = () => {
  const file = 'src/components/Auth/LoginModal.tsx';
  let code = fs.readFileSync(file, 'utf8');
  
  code = code.replace(
    /<div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-amber-300 mx-auto mb-4 shadow-lg overflow-hidden">/,
    '<div className="w-24 h-24 rounded-3xl bg-white p-2 flex items-center justify-center text-amber-300 mx-auto mb-4 shadow-xl overflow-hidden">'
  );
  
  code = code.replace(
    /<img src=\{centerInfo\.logo\} alt=\{centerInfo\.name\} className="w-full h-full object-cover" \/>/,
    '<img src={centerInfo.logo} alt={centerInfo.name} className="w-full h-full object-contain" />'
  );

  fs.writeFileSync(file, code);
  console.log('Fixed LoginModal');
}

const fixReports = () => {
  const file = 'src/components/Admin/ReportsView.tsx';
  let code = fs.readFileSync(file, 'utf8');
  
  code = code.replace(
    /<img src=\{centerInfo\.logo\} alt=\{centerInfo\.name\} className="w-12 h-12 object-contain rounded-lg" \/>/,
    '<img src={centerInfo.logo} alt={centerInfo.name} className="w-16 h-16 object-contain rounded-xl bg-white p-1" />'
  );
  
  code = code.replace(
    /<img src=\{centerInfo\.logo\} alt=\{centerInfo\.name\} className="w-16 h-16 object-contain rounded-xl" \/>/,
    '<img src={centerInfo.logo} alt={centerInfo.name} className="w-24 h-24 object-contain rounded-2xl bg-white p-2 shadow-sm" />'
  );
  
  fs.writeFileSync(file, code);
  console.log('Fixed ReportsView');
}

const fixCertificate = () => {
  const file = 'src/components/Common/CertificateModal.tsx';
  let code = fs.readFileSync(file, 'utf8');
  
  code = code.replace(
    /<img src=\{centerInfo\.logo\} alt=\{centerInfo\.name\} className="w-20 h-20 sm:w-24 sm:h-24 object-contain mb-3 drop-shadow-sm" \/>/,
    '<img src={centerInfo.logo} alt={centerInfo.name} className="w-28 h-28 sm:w-32 sm:h-32 object-contain mb-3 drop-shadow-md bg-white p-2 rounded-2xl" />'
  );
  
  fs.writeFileSync(file, code);
  console.log('Fixed CertificateModal');
}

fixNavbar();
fixLogin();
fixReports();
fixCertificate();

