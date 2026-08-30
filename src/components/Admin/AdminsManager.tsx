import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Admin, User } from '../../types';
import { ShieldCheck, Plus, Edit2, Trash2, X, Shield, KeyRound } from 'lucide-react';
import { supabase, supabaseSecondary } from '../../lib/supabase';

export const AdminsManager: React.FC = () => {
  const { admins, users, addAdmin, updateAdmin, deleteAdmin, addUser, deleteUser } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allowLogin, setAllowLogin] = useState(false);
  const [authUsername, setAuthUsername] = useState('');
  
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirm, setAuthConfirm] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'data_entry'>('admin');
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);

  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({
    name: '',
    civilId: '',
    phone: '',
    email: '',
    jobTitle: '',
    active: true
  });

  const handleOpenAdd = () => {
    setErrorMsg("");
    setEditingAdmin(null);
    setAllowLogin(false);
    setAuthUsername("");
    
    setAuthPassword("");
    setAuthConfirm("");
    setFormData({
      name: '',
      civilId: '',
      phone: '',
      email: '',
      jobTitle: '',
      active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (admin: Admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      civilId: admin.civilId,
      phone: admin.phone,
      email: admin.email || '',
      jobTitle: admin.jobTitle.replace(' [INACTIVE]', ''),
      active: !admin.jobTitle.includes(' [INACTIVE]')
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (allowLogin) {
      if (authPassword !== authConfirm) {
        setErrorMsg("كلمة المرور غير متطابقة");
        return;
      }
      const { data: existingUser } = await supabase.from('profiles').select('id').eq('username', authUsername).maybeSingle();
      if (existingUser) {
        setErrorMsg('اسم المستخدم هذا مستخدم بالفعل، الرجاء اختيار اسم آخر.');
        return;
      }
      const res = await supabaseSecondary.auth.signUp({
        email: formData.email,
        password: authPassword,
        options: {
          data: {
            username: authUsername,
            name: formData.name,
            phone: formData.phone,
            role: selectedRole
          }
        }
      });
      if (res.error) {
        if (res.error.message.includes('already registered')) {
          setErrorMsg('البريد الإلكتروني هذا مستخدم بالفعل، الرجاء اختيار بريد آخر.');
        } else {
          setErrorMsg('فشل إنشاء حساب الدخول: ' + res.error.message);
        }
        return;
      }
      var newAuthId = res.data.user?.id;
      // Assuming we continue to add the actual record
    }
    const payload = {
      userId: editingAdmin?.userId || (typeof newAuthId !== "undefined" ? newAuthId : null),
      name: formData.name,
      civilId: formData.civilId,
      phone: formData.phone,
      email: formData.email,
      jobTitle: formData.active ? formData.jobTitle : `${formData.jobTitle} [INACTIVE]`
    };

    if (editingAdmin) {
      updateAdmin(editingAdmin.id, payload);
    } else {
      addAdmin(payload);
      if (formData.email) {
        addUser({
          id: `u-adm-${Date.now()}`,
          name: formData.name,
          email: formData.email,
          role: selectedRole,
          phone: formData.phone
        });
      }
    }

    setIsModalOpen(false);
  };

  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const handleDelete = (admin: Admin) => {
    deleteAdmin(admin.id);
    if (admin.userId) {
      deleteUser(admin.userId);
    }
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">إدارة الكادر الإداري والمشرفين</h2>
              <p className="text-xs text-slate-400">سجل الإداريين والوظائف الإشرافية في المركز</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ إضافة إداري جديد</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold">
                <th className="p-4">الاسم</th>
                <th className="p-4">المسمى الوظيفي</th>
                <th className="p-4">الحالة</th>
                <th className="p-4">الرقم المدني</th>
                <th className="p-4">الهاتف</th>
                <th className="p-4">البريد الإلكتروني</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-300">
              {admins.map(admin => (
                <tr key={admin.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="p-4 font-bold text-slate-900 dark:text-slate-100">{admin.name}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-[11px] border border-purple-200 dark:border-purple-800">
                      {admin.jobTitle.replace(' [INACTIVE]', '')}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      !admin.jobTitle.includes(' [INACTIVE]')
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {!admin.jobTitle.includes(' [INACTIVE]') ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="p-4 font-mono">{admin.civilId}</td>
                  <td className="p-4 font-mono">{admin.phone}</td>
                  <td className="p-4 font-mono text-slate-400">{admin.email || 'غير مسجل'}</td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(admin)}
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {deleteConfirm === admin.id ? (
                        <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-900/30 p-1 rounded-lg">
                          <span className="text-[10px] text-rose-600 font-bold px-1">حذف؟</span>
                          <button onClick={() => handleDelete(admin)} className="p-1 text-rose-700 hover:bg-rose-200 dark:hover:bg-rose-800 rounded">نعم</button>
                          <button onClick={() => setDeleteConfirm(null)} className="p-1 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 rounded">لا</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(admin.id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {editingAdmin ? 'تعديل بيانات الإداري' : 'إضافة إداري جديد'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الاسم الرباعي</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, name: val });
                    if(!authUsername) setAuthUsername(val.trim().replace(/\s+/g, '_').toLowerCase() + '_' + Math.floor(1000 + Math.random() * 9000));
                  }}
                  placeholder="أ. سعد العتيبي"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">المسمى الوظيفي</label>
                <input
                  type="text"
                  required
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  placeholder="مشرف عام / سكرتير الحلقات"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">حالة الحساب</label>
                <select
                  value={formData.active ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-bold"
                >
                  <option value="true">نشط</option>
                  <option value="false">غير نشط (معطل)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الرقم المدني</label>
                  <input
                    type="text" value={formData.civilId}
                    onChange={(e) => setFormData({ ...formData, civilId: e.target.value })}
                    placeholder="280010100010"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">رقم الهاتف</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="90000000"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@test.com"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>


              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-2 mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowLogin}
                    onChange={(e) => setAllowLogin(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">السماح بالدخول على النظام</span>
                </label>
                
                {allowLogin && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">صلاحية النظام</label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'data_entry')}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                      >
                        <option value="admin">مدير النظام</option>
                        <option value="data_entry">مدخل بيانات</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">اسم المستخدم</label>
                      <input type="text" required={allowLogin} value={authUsername} onChange={e => setAuthUsername(e.target.value)} className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">كلمة المرور</label>
                      <input type="password" required={allowLogin} value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">تأكيد كلمة المرور</label>
                      <input type="password" required={allowLogin} value={authConfirm} onChange={e => setAuthConfirm(e.target.value)} className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none" />
                    </div>
                  </div>
                )}
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
                  {editingAdmin ? 'حفظ التعديلات' : 'إضافة الإداري'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
