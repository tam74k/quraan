const fs = require('fs');
let file = 'src/components/Admin/UserSettings.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('const [modalError, setModalError]')) {
  code = code.replace(
    '  const [successMsg, setSuccessMsg] = useState(\'\');',
    '  const [successMsg, setSuccessMsg] = useState(\'\');\n  const [modalError, setModalError] = useState(\'\');\n  const [errorMsg, setErrorMsg] = useState(\'\');'
  );
  fs.writeFileSync(file, code);
  console.log("UserSettings fixed successfully!");
} else {
  console.log("States already exist in UserSettings");
}
