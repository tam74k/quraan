const fs = require('fs');

function fixStudents() {
  let code = fs.readFileSync('src/components/Admin/StudentsManager.tsx', 'utf8');
  
  // Make civil_id optional
  code = code.replace(/<input\s+type="text"\s+required\s+value=\{newStudent.civilId\}/g, '<input type="text" value={newStudent.civilId}');
  code = code.replace(/<input\s+type="text"\s+required\s+value=\{editingStudent.civilId\}/g, '<input type="text" value={editingStudent.civilId}');
  
  // Remove parent_email fields
  code = code.replace(/<div>\s*<label[^>]*>البريد الإلكتروني \(ولي الأمر\)[\s\S]*?<\/div>/g, '');
  code = code.replace(/<div>\s*<label[^>]*>البريد الإلكتروني لولي الأمر[\s\S]*?<\/div>/g, '');
  code = code.replace(/parentEmail:\s*''/g, ''); // when initializing
  
  fs.writeFileSync('src/components/Admin/StudentsManager.tsx', code);
}

function fixSheikhs() {
  let code = fs.readFileSync('src/components/Admin/SheikhsManager.tsx', 'utf8');
  
  // Make civil_id optional
  code = code.replace(/<input\s+type="text"\s+required\s+value=\{newSheikh.civilId\}/g, '<input type="text" value={newSheikh.civilId}');
  code = code.replace(/<input\s+type="text"\s+required\s+value=\{editingSheikh.civilId\}/g, '<input type="text" value={editingSheikh.civilId}');
  
  fs.writeFileSync('src/components/Admin/SheikhsManager.tsx', code);
}

function fixAdmins() {
  let code = fs.readFileSync('src/components/Admin/AdminsManager.tsx', 'utf8');
  
  // Make civil_id optional
  code = code.replace(/<input\s+type="text"\s+required\s+value=\{newAdmin.civilId\}/g, '<input type="text" value={newAdmin.civilId}');
  code = code.replace(/<input\s+type="text"\s+required\s+value=\{editingAdmin.civilId\}/g, '<input type="text" value={editingAdmin.civilId}');
  
  fs.writeFileSync('src/components/Admin/AdminsManager.tsx', code);
}

fixStudents();
fixSheikhs();
fixAdmins();
console.log("Fixed forms");
