const fs = require('fs');

const file = 'src/context/AppContext.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /name: newSheikh\.name, civil_id: newSheikh\.civilId, phone: newSheikh\.phone, email: newSheikh\.email, halqa_name: newSheikh\.halqaName, bio: newSheikh\.bio, active: newSheikh\.active/,
  'user_id: newSheikh.userId, name: newSheikh.name, civil_id: newSheikh.civilId, phone: newSheikh.phone, email: newSheikh.email, halqa_name: newSheikh.halqaName, bio: newSheikh.bio, active: newSheikh.active'
);

code = code.replace(
  /name: newAdmin\.name, civil_id: newAdmin\.civilId, phone: newAdmin\.phone, email: newAdmin\.email, job_title: newAdmin\.jobTitle/,
  'user_id: newAdmin.userId, name: newAdmin.name, civil_id: newAdmin.civilId, phone: newAdmin.phone, email: newAdmin.email, job_title: newAdmin.jobTitle'
);

// update also
code = code.replace(
  /if \(sheikhData\.name !== undefined\) payload\.name = sheikhData\.name;/g,
  'if (sheikhData.userId !== undefined) payload.user_id = sheikhData.userId;\n    if (sheikhData.name !== undefined) payload.name = sheikhData.name;'
);

code = code.replace(
  /if \(adminData\.name !== undefined\) payload\.name = adminData\.name;/g,
  'if (adminData.userId !== undefined) payload.user_id = adminData.userId;\n    if (adminData.name !== undefined) payload.name = adminData.name;'
);

fs.writeFileSync(file, code);
console.log("Fixed AppContext");
