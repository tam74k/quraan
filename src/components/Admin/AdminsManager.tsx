import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Admin, User } from '../../types';
import { ShieldCheck, Plus, Edit2, Trash2, X, Shield, KeyRound } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const AdminsManager: React.FC = () => {
  const { admins, users, addAdmin, updateAdmin, deleteAdmin, addUser } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allowLogin, setAllowLogin] = useState(false);
  const [authUsername, setAuthUsername] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirm, setAuthConfirm] = useState('');
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    civilId: '',
    phone: '',
    email: '',
    jobTitle: ''
  });

  const handleOpenAdd = () => {
    setEditingAdmin(null);
    setAllowLogin(false);
    setAuthUsername("");
    setAuthEmail("");
    setAuthPassword("");
    setAuthConfirm("");
    setFormData({
      name: '',
      civilId: '',
      phone: '',
      email: '',
      jobTitle: ''
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
      jobTitle: admin.jobTitle
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (allowLogin) {
      if (authPassword !== authConfirm) {
        alert("كلمة المرور غير متطابقة");
        e.preventDefault();
        return;
      }
      e.preventDefault();
      const res = await supabase.rpc('admin_create_auth_user', {
        p_email: authEmail,
        p_password: authPassword,
        p_username: authUsername,
        p_name: formData.name,
        p_phone: formData.phone,
        p_role: 'admin'
      });
      if (res.error) {
        alert('فشل إنشاء حساب الدخول: ' + res.error.message);
        return;
      }
      var newAuthId = res.data;
      // Assuming we continue to add the actual record
    }
    e.preventDefault();
    const payload = {
      userId: editingAdmin?.userId || (typeof newAuthId !== "undefined" ? newAuthId : null),
      name: formData.name,
      civilId: formData.civilId,
      phone: formData.phone,
      email: formData.email,
      jobTitle: formData.jobTitle
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
          role: 'admin',
          phone: formData.phone
        });
      }
    }

    setIsModalOpen(false);
  };

  const handleDelete = (admin: Admin) => {
    if (window.confirm(`هل أنت متأكد من حذف الإداري (${admin.name})؟`)) {
      deleteAdmin(admin.id);
    }
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
                      {admin.jobTitle}
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
                      <button
                        onClick={() => handleDelete(admin)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">البريد الإلكتروني للدخول</label>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">اسم المستخدم</label>
                      <input type="text" required={allowLogin} value={authUsername} onChange={e => setAuthUsername(e.target.value)} className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">البريد الإلكتروني</label>
                      <input type="email" required={allowLogin} value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none" />
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
