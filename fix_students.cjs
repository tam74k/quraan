const fs = require('fs');
let code = fs.readFileSync('src/components/Admin/StudentsManager.tsx', 'utf8');

// Remove required from civilId
code = code.replace(/<input([^>]*?)value={newStudent.civilId}([^>]*?)required([^>]*?)>/g, '<input$1value={newStudent.civilId}$2$3>');

// Remove parentEmail completely from UI
code = code.replace(/<div[^>]*>\s*<label[^>]*>البريد الإلكتروني \(ولي الأمر\).*?<\/div>/s, '');
// If it was mapped as an input, let's just regex the block out more safely by finding the label and removing the div.
