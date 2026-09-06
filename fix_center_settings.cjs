const fs = require('fs');
let file = 'src/components/Admin/CenterSettings.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "alert('فشل رفع الشعار: ' + error.message);",
  "setErrorMsg('فشل رفع الشعار: ' + error.message);\n        setTimeout(() => setErrorMsg(''), 5000);"
);

// Add errorMsg state
code = code.replace(
  'const [successMsg, setSuccessMsg] = useState("");',
  'const [successMsg, setSuccessMsg] = useState("");\n  const [errorMsg, setErrorMsg] = useState("");'
);

const mainMsgTarget = `{successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}`;

const mainMsgReplace = `{successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl text-rose-800 text-sm font-bold flex items-center gap-2">
          <span>{errorMsg}</span>
        </div>
      )}`;
      
code = code.replace(mainMsgTarget, mainMsgReplace);

fs.writeFileSync(file, code);
