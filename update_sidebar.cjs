const fs = require('fs');
let file = 'src/components/Layout/Sidebar.tsx';
let code = fs.readFileSync(file, 'utf8');

const adminNavTarget = `  const adminNavItems = [
    { id: 'dashboard', label: 'اللوحة الرئيسية', icon: LayoutDashboard, badge: null },`;

const adminNavReplace = `  const adminNavItems = [
    { id: 'dashboard', label: 'اللوحة الرئيسية', icon: LayoutDashboard, badge: null },
    { id: 'daily-halqa', label: 'تسجيل المتابعة اليومية', icon: BookOpenCheck, badge: 'مباشر' },`;

code = code.replace(adminNavTarget, adminNavReplace);
fs.writeFileSync(file, code);
