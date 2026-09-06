const fs = require('fs');
let file = 'src/components/Admin/ReportsView.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `{/* Render Area */}
      <div className="p-4 bg-red-100 text-red-900 border border-red-300 rounded mb-4 font-bold text-sm">
        DEBUG INFO (For Developer): 
        Total Students: {students.length} | 
        Active Sheikh ID: {activeSheikh?.id} | 
        Halqa Students Length: {halqaStudents.length} |
        All Students Length: {students.filter(s => !s.status || s.status.toLowerCase().includes('active') || s.status.includes('نشط')).length}
      </div>`;

code = code.replace(target, `{/* Render Area */}`);

fs.writeFileSync(file, code);
