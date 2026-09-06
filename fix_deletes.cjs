const fs = require('fs');

// SheikhsManager
let file = 'src/components/Admin/SheikhsManager.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'const { sheikhs, students, addSheikh, updateSheikh, deleteSheikh, addUser } = useApp();',
  'const { sheikhs, students, addSheikh, updateSheikh, deleteSheikh, addUser, deleteUser } = useApp();'
);

code = code.replace(
  `  const handleDelete = (sheikh: Sheikh) => {
    if (window.confirm(\`هل أنت متأكد من حذف الشيخ (\${sheikh.name})؟\`)) {
      deleteSheikh(sheikh.id);
    }
  };`,
  `  const handleDelete = (sheikh: Sheikh) => {
    if (window.confirm(\`هل أنت متأكد من حذف الشيخ (\${sheikh.name})؟\`)) {
      deleteSheikh(sheikh.id);
      if (sheikh.userId) {
        deleteUser(sheikh.userId);
      }
    }
  };`
);

fs.writeFileSync(file, code);


// AdminsManager
file = 'src/components/Admin/AdminsManager.tsx';
code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'const { admins, users, addAdmin, updateAdmin, deleteAdmin, addUser } = useApp();',
  'const { admins, users, addAdmin, updateAdmin, deleteAdmin, addUser, deleteUser } = useApp();'
);

code = code.replace(
  `  const handleDelete = (admin: Admin) => {
    if (window.confirm(\`هل أنت متأكد من حذف الإداري (\${admin.name})؟\`)) {
      deleteAdmin(admin.id);
    }
  };`,
  `  const handleDelete = (admin: Admin) => {
    if (window.confirm(\`هل أنت متأكد من حذف الإداري (\${admin.name})؟\`)) {
      deleteAdmin(admin.id);
      if (admin.userId) {
        deleteUser(admin.userId);
      }
    }
  };`
);

fs.writeFileSync(file, code);

// UserSettings
file = 'src/components/Admin/UserSettings.tsx';
code = fs.readFileSync(file, 'utf8');
code = code.replace(
  `  const handleDeleteUser = (user: User) => {
    if (currentUser?.id === user.id || currentUser?.email === user.email) {
      alert('لا يمكنك حذف الحساب الحالي الذي تم تسجيل الدخول به.');
      return;
    }
    if (window.confirm(\`هل أنت متأكد من حذف الحساب (\${user.name}) نهائياً من النظام؟\`)) {
      deleteUser(user.id);
      setSuccessMsg(\`تم حذف الحساب (\${user.name}) بنجاح.\`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };`,
  `  const handleDeleteUser = (user: User) => {
    if (currentUser?.id === user.id || currentUser?.email === user.email) {
      alert('لا يمكنك حذف الحساب الحالي الذي تم تسجيل الدخول به.');
      return;
    }
    if (window.confirm(\`هل أنت متأكد من حذف الحساب (\${user.name}) نهائياً من النظام؟\`)) {
      deleteUser(user.id);
      setSuccessMsg(\`تم حذف الحساب (\${user.name}) بنجاح.\`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };`
);

// Nothing needed to change in UserSettings directly, looks correct.

console.log('Fixed deletes');
