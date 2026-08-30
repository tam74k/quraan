const fs = require('fs');
let file = 'src/components/Common/SmartSurahInput.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetStr = '<div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50 animate-in fade-in zoom-in-95 duration-100">';

const replaceStr = '<div className="absolute right-0 z-50 w-[320px] sm:w-[360px] max-w-[90vw] mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto overflow-x-hidden divide-y divide-slate-100 dark:divide-slate-700/50 animate-in fade-in zoom-in-95 duration-100">';

if(code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync(file, code);
  console.log("Replaced successfully!");
} else {
  console.log("Target string not found.");
}
