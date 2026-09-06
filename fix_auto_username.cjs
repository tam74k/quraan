const fs = require('fs');

function fix(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  
  // Replace the name onChange handler
  code = code.replace(
    /onChange=\{\(e\) => setFormData\(\{ \.\.\.formData, name: e\.target\.value \}\)\}/,
    `onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, name: val });
                    if(!authUsername) setAuthUsername(val.trim().replace(/\\s+/g, '_').toLowerCase() + '_' + Math.floor(1000 + Math.random() * 9000));
                  }}`
  );
  
  // Fix the editing check inside the RPC call
  code = code.replace(/editing[A-Za-z]+ \? formData\.name : formData\.name/, 'formData.name');
  code = code.replace(/editing[A-Za-z]+ \? formData\.phone : formData\.phone/, 'formData.phone');
  
  // But wait, the original logic in handleSubmit now has `e.preventDefault()` inside `if (allowLogin)`. 
  // Wait, if allowLogin is false, the form will still submit, but e.preventDefault() is missing!
  // Let's check handleSubmit structure.
  
  fs.writeFileSync(filePath, code);
}
fix('src/components/Admin/SheikhsManager.tsx');
fix('src/components/Admin/AdminsManager.tsx');
console.log("Fixed auto username");
