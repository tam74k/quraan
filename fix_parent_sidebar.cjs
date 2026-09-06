const fs = require('fs');
let file = 'src/components/Layout/Sidebar.tsx';
let code = fs.readFileSync(file, 'utf8');

const parentNavTarget = `  const parentNavItems = [
    { id: 'parent-kids', label: 'متابعة الأبناء ومصحف الإنجاز', icon: HeartHandshake, badge: null },
    { id: 'reports', label: 'الاستمارة الشهرية والشهادات', icon: FileText, badge: null },
    { id: 'honor', label: 'لوحة الشرف والمتميزين', icon: Crown, badge: null }
  ];`;

const parentNavReplace = `  const parentNavItems = [
    { id: 'parent-kids', label: 'متابعة الأبناء ومصحف الإنجاز', icon: HeartHandshake, badge: null },
    { id: 'honor', label: 'لوحة الشرف والمتميزين', icon: Crown, badge: null }
  ];`;

code = code.replace(parentNavTarget, parentNavReplace);
fs.writeFileSync(file, code);
