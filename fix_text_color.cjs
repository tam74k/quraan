const fs = require('fs');
let file = 'src/components/Admin/ReportsView.tsx';
let code = fs.readFileSync(file, 'utf8');

// replace `<table className="w-full text-center text-xs border border-slate-300">`
// with `<table className="w-full text-center text-xs border border-slate-300 text-slate-900">`
code = code.replace(
  /<table className="w-full text-center text-xs border border-slate-300">/g,
  '<table className="w-full text-center text-xs border border-slate-300 text-slate-900 dark:text-slate-900">'
);

fs.writeFileSync(file, code);
