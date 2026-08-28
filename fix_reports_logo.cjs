const fs = require('fs');
let code = fs.readFileSync('src/components/Admin/ReportsView.tsx', 'utf8');

// The main monthly sheet header
const headerTarget = `<div className="flex justify-between items-center border-b-2 border-emerald-800 pb-3 mb-4">
          <div className="text-right">
            <h2 className="font-serif font-black text-emerald-950 text-base">{centerInfo.name}</h2>
            <p className="text-[11px] text-slate-600">{centerInfo.address}</p>
          </div>`;

const headerReplacement = `<div className="flex justify-between items-center border-b-2 border-emerald-800 pb-3 mb-4">
          <div className="flex items-center gap-3">
            {centerInfo.logo && (
              <img src={centerInfo.logo} alt={centerInfo.name} className="w-12 h-12 object-contain rounded-lg" />
            )}
            <div className="text-right">
              <h2 className="font-serif font-black text-emerald-950 text-base">{centerInfo.name}</h2>
              <p className="text-[11px] text-slate-600">{centerInfo.address}</p>
            </div>
          </div>`;

code = code.replace(headerTarget, headerReplacement);

// The all students report header
const allStudentsTarget = `<div className="text-center border-b-2 border-emerald-800 pb-4 mb-6">
              <h2 className="text-xl font-bold text-emerald-950">{centerInfo.name}</h2>
              <p className="text-xs text-slate-500">{centerInfo.address} - هاتف: {centerInfo.phone}</p>
            </div>`;

const allStudentsReplacement = `<div className="flex justify-between items-center border-b-2 border-emerald-800 pb-4 mb-6">
              <div className="flex items-center gap-4">
                {centerInfo.logo && (
                  <img src={centerInfo.logo} alt={centerInfo.name} className="w-16 h-16 object-contain rounded-xl" />
                )}
                <div className="text-right">
                  <h2 className="text-xl font-bold text-emerald-950">{centerInfo.name}</h2>
                  <p className="text-xs text-slate-500">{centerInfo.address} - هاتف: {centerInfo.phone}</p>
                </div>
              </div>
              <div className="text-left text-sm font-bold text-slate-600">
                كشف بأسماء جميع طلاب المركز
              </div>
            </div>`;

code = code.replace(allStudentsTarget, allStudentsReplacement);

fs.writeFileSync('src/components/Admin/ReportsView.tsx', code);
console.log("Fixed reports logo");
