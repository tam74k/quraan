import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase, supabaseSecondary } from '../../lib/supabase';
import { User, UserRole, UserPermissions } from '../../types';
import {
  Settings,
  Plus,
  Edit2,
  Trash2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  X,
  CheckCircle2,
  Lock,
  Unlock,
  KeyRound,
  Check,
  Ban
} from 'lucide-react';

const PERMISSION_DEFINITIONS: { key: keyof UserPermissions; label: string; description: string }[] = [
  { key: 'manage_students', label: '🎓 إدارة الطلاب', description: 'إضافة وتعديل وحذف الطلاب وتصدير السجلات' },
  { key: 'manage_sheikhs', label: '👳‍♂️ إدارة المشايخ والحلقات', description: 'تكوين الحلقات وإسناد وتوزيع الطلاب' },
  { key: 'manage_admins', label: '🛡️ إدارة الكادر الإداري', description: 'إضافة وتعديل بيانات الإداريين والمشرفين' },
  { key: 'daily_recitation', label: '📖 التسميع اليومي والحضور', description: 'تسجيل الحفظ والمراجعة والدرجات اليومية' },
  { key: 'manage_exams', label: '🏆 الاختبارات والشهادات', description: 'رصد نتائج الاختبارات وإصدار الشهادات' },
  { key: 'print_reports', label: '🖨️ طباعة الاستمارات والتقارير', description: 'طباعة استمارات المتابعة الشهرية وكشوف الحلقات' },
  { key: 'honor_board', label: '⭐ لوحة الشرف والتحفيز', description: 'تحديث نقاط التميز وأوسمة الطلاب' },
  { key: 'center_settings', label: '⚙️ إعدادات وهوية المركز', description: 'تعديل اسم المركز وأرقام الاتصال والعنوان' },
  { key: 'manage_accounts', label: '🔑 إدارة الحسابات والصلاحيات', description: 'إنشاء حسابات المستخدمين ومنح ومنع الصلاحيات' }
];

const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  admin: {
    manage_students: true,
    manage_sheikhs: true,
    manage_admins: true,
    daily_recitation: true,
    manage_exams: true,
    print_reports: true,
    honor_board: true,
    center_settings: true,
    manage_accounts: true
  },
  data_entry: {
    manage_students: true,
    manage_sheikhs: false,
    manage_admins: false,
    daily_recitation: true,
    manage_exams: true,
    print_reports: true,
    honor_board: true,
    center_settings: false,
    manage_accounts: false
  },
  sheikh: {
    manage_students: false,
    manage_sheikhs: false,
    manage_admins: false,
    daily_recitation: true,
    manage_exams: true,
    print_reports: true,
    honor_board: true,
    center_settings: false,
    manage_accounts: false
  },
  parent: {
    manage_students: false,
    manage_sheikhs: false,
    manage_admins: false,
    daily_recitation: false,
    manage_exams: false,
    print_reports: false,
    honor_board: false,
    center_settings: false,
    manage_accounts: false
  }
};

export const UserSettings: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPermsModalOpen, setIsPermsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUserForPerms, setSelectedUserForPerms] = useState<User | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    role: UserRole;
    phone: string;
    status: 'active' | 'suspended';
    permissions: UserPermissions;
  }>({
    name: '',
    email: '',
    role: 'sheikh',
    phone: '',
    status: 'active',
    permissions: { ...DEFAULT_ROLE_PERMISSIONS.sheikh }
  });

  const [successMsg, setSuccessMsg] = useState('');
  const [modalError, setModalError] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');

  const handleRoleChange = (newRole: UserRole) => {
    setFormData(prev => ({
      ...prev,
      role: newRole,
      permissions: { ...DEFAULT_ROLE_PERMISSIONS[newRole] }
    }));
  };

  const handleTogglePermission = (key: keyof UserPermissions) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key]
      }
    }));
  };

  const handleSelectAllPermissions = (grant: boolean) => {
    const updated: UserPermissions = {};
    PERMISSION_DEFINITIONS.forEach(p => {
      updated[p.key] = grant;
    });
    setFormData(prev => ({ ...prev, permissions: updated }));
  };

  const handleOpenAdd = () => {
    setModalError("");
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'sheikh',
      phone: '',
      status: 'active',
      permissions: { ...DEFAULT_ROLE_PERMISSIONS.sheikh }
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setModalError("");
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      status: user.status || 'active',
      permissions: user.permissions ? { ...user.permissions } : { ...DEFAULT_ROLE_PERMISSIONS[user.role] }
    });
    setIsModalOpen(true);
  };

  const handleOpenPermsModal = (user: User) => {
    setSelectedUserForPerms(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      status: user.status || 'active',
      permissions: user.permissions ? { ...user.permissions } : { ...DEFAULT_ROLE_PERMISSIONS[user.role] }
    });
    setIsPermsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      role: formData.role,
      phone: formData.phone.trim(),
      status: formData.status,
      permissions: formData.permissions
    };

    if (editingUser) {
      updateUser(editingUser.id, payload);
      setSuccessMsg(`تم تحديث بيانات وصلاحيات الحساب (${payload.name}) بنجاح.`);
      setIsModalOpen(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      if (!authUsername.trim()) {
        setModalError('الرجاء إدخال اسم المستخدم.');
        return;
      }
      if (authPassword !== authConfirmPassword) {
        setModalError('كلمتا المرور غير متطابقتين.');
        return;
      }
      if (authPassword.length < 6) {
        setModalError('كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
        return;
      }

      const { data: existingUser } = await supabase.from('profiles').select('id').eq('username', authUsername).maybeSingle();
      if (existingUser) {
        setModalError('اسم المستخدم هذا مستخدم بالفعل، الرجاء اختيار اسم آخر.');
        return;
      }

      if (payload.email) {
        const duplicateEmail = users.some(u => u.email && u.email.toLowerCase() === payload.email.toLowerCase());
        if (duplicateEmail) {
          setModalError('البريد الإلكتروني هذا مستخدم بالفعل لمستخدم آخر.');
          return;
        }
      }

      const res = await supabaseSecondary.auth.signUp({
        email: payload.email,
        password: authPassword,
        options: {
          data: {
            username: authUsername.trim(),
            name: payload.name,
            phone: payload.phone,
            role: payload.role
          }
        }
      });

      if (res.error) {
        if (res.error.message.includes('already registered')) {
          setModalError('البريد الإلكتروني هذا مستخدم بالفعل، الرجاء اختيار بريد آخر.');
        } else {
          setModalError('فشل إنشاء حساب الدخول: ' + res.error.message);
        }
        return;
      }

      const newUserId = res.data.user?.id || `u-${Date.now()}`;

      addUser({
        id: newUserId,
        ...payload,
        username: authUsername.trim() || payload.email.split('@')[0]
      });
      
      setSuccessMsg(`تم إنشاء الحساب الجديد (${payload.name}) بنجاح.`);
      setIsModalOpen(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const handleSavePermsModal = () => {
    if (selectedUserForPerms) {
      updateUser(selectedUserForPerms.id, {
        permissions: formData.permissions
      });
      setSuccessMsg(`تم تحديث صلاحيات الحساب (${selectedUserForPerms.name}) بنجاح.`);
      setIsPermsModalOpen(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const handleToggleStatus = (user: User) => {
    const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
    updateUser(user.id, { status: newStatus });
    setSuccessMsg(`تم ${newStatus === 'active' ? 'تفعيل' : 'تعطيل'} حساب (${user.name}) بنجاح.`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDeleteUser = (user: User) => {
    if (currentUser?.id === user.id || currentUser?.email === user.email) {
      setErrorMsg('لا يمكنك حذف الحساب الحالي الذي تم تسجيل الدخول به.');
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }
    if (window.confirm(`هل أنت متأكد من حذف الحساب (${user.name}) نهائياً من النظام؟`)) {
      deleteUser(user.id);
      setSuccessMsg(`تم حذف الحساب (${user.name}) بنجاح.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchQuery = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchQuery && matchRole;
  });

  const roleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <span className="px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-[11px]">مدير نظام</span>;
      case 'sheikh':
        return <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">شيخ محفظ</span>;
      case 'parent':
        return <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[11px]">ولي أمر</span>;
      case 'data_entry':
        return <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[11px]">مدخل بيانات</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              <KeyRound className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">إدارة الحسابات ومنظومة الصلاحيات</h2>
              <p className="text-xs text-slate-400">إضافة وتعديل وحذف الحسابات وتخصيص ومنح ومنع الصلاحيات التفصيلية</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ إضافة حساب مستخدم جديد</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث بالاسم أو البريد الإلكتروني..."
          className="w-full sm:w-80 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
        />

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-500 whitespace-nowrap">تصفية حسب الدور:</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-bold"
          >
            <option value="all">جميع الحسابات ({users.length})</option>
            <option value="admin">المدراء والمشرفين</option>
            <option value="sheikh">المشايخ والمحفظين</option>
            <option value="parent">أولياء الأمور</option>
            <option value="data_entry">مدخلي البيانات</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold">
                <th className="p-4">اسم المستخدم</th>
                <th className="p-4">البريد الإلكتروني</th>
                <th className="p-4">الدور الأساسي</th>
                <th className="p-4">الصلاحيات الممنوحة</th>
                <th className="p-4">الحالة</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-300">
              {filteredUsers.map(u => {
                const userPerms = u.permissions || DEFAULT_ROLE_PERMISSIONS[u.role] || {};
                const grantedCount = Object.values(userPerms).filter(Boolean).length;
                const isSuspended = u.status === 'suspended';

                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{u.name}</div>
                      {u.phone && <div className="text-[10px] text-slate-400 font-mono mt-0.5">{u.phone}</div>}
                    </td>
                    <td className="p-4 font-mono font-medium text-slate-600 dark:text-slate-300">{u.email}</td>
                    <td className="p-4">{roleBadge(u.role)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-bold text-[10px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {grantedCount} من {PERMISSION_DEFINITIONS.length} صلاحيات
                        </span>
                        <button
                          onClick={() => handleOpenPermsModal(u)}
                          className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold underline cursor-pointer"
                        >
                          تعديل الصلاحيات
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 ${
                        isSuspended
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      }`}>
                        {isSuspended ? <Ban className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                        <span>{isSuspended ? 'معطل' : 'نشط'}</span>
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenPermsModal(u)}
                          className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                          title="منح / منع الصلاحيات التفصيلية"
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                          title="تعديل بيانات الحساب"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isSuspended
                              ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                              : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                          }`}
                          title={isSuspended ? 'تفعيل الحساب' : 'تجميد وتعطيل الحساب'}
                        >
                          {isSuspended ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="حذف الحساب"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {editingUser ? 'تعديل بيانات وصلاحيات الحساب' : 'إضافة وإنشاء حساب مستخدم جديد'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الاسم الكامل</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="الاسم الرباعي"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@test.com"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الدور الأساسي</label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="admin">مدير نظام (كامل الصلاحيات)</option>
                    <option value="sheikh">شيخ محفظ</option>
                    <option value="parent">ولي أمر</option>
                    <option value="data_entry">مدخل بيانات / شؤون طلاب</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">حالة الحساب</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'suspended' })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-bold"
                  >
                    <option value="active">نشط</option>
                    <option value="suspended">غير نشط (معطل)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="90000000"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                  />
                </div>

                {!editingUser && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">اسم المستخدم</label>
                      <input
                        type="text"
                        required
                        value={authUsername}
                        onChange={(e) => setAuthUsername(e.target.value)}
                        placeholder="أدخل اسم المستخدم للدخول"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">كلمة المرور</label>
                      <input
                        type="password"
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">تأكيد كلمة المرور</label>
                      <input
                        type="password"
                        required
                        value={authConfirmPassword}
                        onChange={(e) => setAuthConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Permissions Checkbox Grid */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">منح ومنع الصلاحيات التفصيلية</h4>
                    <p className="text-[11px] text-slate-400">حدد الخصائص المسموح لهذا المستخدم بالوصول إليها</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectAllPermissions(true)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[10px]"
                    >
                      تحديد الكل
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectAllPermissions(false)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold text-[10px]"
                    >
                      إلغاء الكل
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PERMISSION_DEFINITIONS.map(p => {
                    const isChecked = !!formData.permissions[p.key];
                    return (
                      <label
                        key={p.key}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 opacity-60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePermission(p.key)}
                          className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{p.label}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{p.description}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
                >
                  {editingUser ? 'حفظ التعديلات' : 'إنشاء الحساب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grant / Revoke Permissions Dedicated Modal */}
      {isPermsModalOpen && selectedUserForPerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  تخصيص صلاحيات المستخدم: {selectedUserForPerms.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono">{selectedUserForPerms.email} ({roleBadge(selectedUserForPerms.role)})</p>
              </div>
              <button onClick={() => setIsPermsModalOpen(false)} className="p-2 rounded-xl text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">اختر الصلاحيات المراد منحها أو حجبها:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectAllPermissions(true)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[10px]"
                  >
                    منح الكل
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectAllPermissions(false)}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[10px]"
                  >
                    حجب الكل
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {PERMISSION_DEFINITIONS.map(p => {
                  const isGranted = !!formData.permissions[p.key];
                  return (
                    <div
                      key={p.key}
                      onClick={() => handleTogglePermission(p.key)}
                      className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                        isGranted
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 opacity-60'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{p.label}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{p.description}</div>
                      </div>

                      <div className={`px-3 py-1 rounded-xl text-xs font-bold ${
                        isGranted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}>
                        {isGranted ? 'ممنوحة ✔' : 'محجوبة ✖'}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPermsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSavePermsModal}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
                >
                  حفظ واعتماد الصلاحيات
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
