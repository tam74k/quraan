import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sheikh } from '../../types';
import { UserSquare, Plus, Edit2, Trash2, Phone, Mail, X, CheckCircle2, XCircle } from 'lucide-react';
import { supabase, supabaseSecondary } from '../../lib/supabase';

export const SheikhsManager: React.FC = () => {
  const { sheikhs, students, addSheikh, updateSheikh, deleteSheikh, addUser, deleteUser } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allowLogin, setAllowLogin] = useState(false);
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirm, setAuthConfirm] = useState('');
  const [editingSheikh, setEditingSheikh] = useState<Sheikh | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    civilId: '',
    phone: '',
    email: '',
    halqaName: '',
    bio: '',
    active: true
  });

  const handleOpenAdd = () => {
    setEditingSheikh(null);
    setAllowLogin(false);
    setAuthUsername("");
    
    setAuthPassword("");
    setAuthConfirm("");
    setFormData({
      name: '',
      civilId: '',
      phone: '',
      email: '',
      halqaName: '',
      bio: '',
      active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sheikh: Sheikh) => {
    setEditingSheikh(sheikh);
    setFormData({
      name: sheikh.name,
      civilId: sheikh.civilId,
      phone: sheikh.phone,
      email: sheikh.email || '',
      halqaName: sheikh.halqaName,
      bio: sheikh.bio || '',
      active: sheikh.active
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let newAuthId = undefined;
    if (allowLogin) {
      if (authPassword !== authConfirm) {
        alert("كلمة المرور غير متطابقة");
        return;
      }
      const { data: existingUser } = await supabase.from('profiles').select('id').eq('username', authUsername).maybeSingle();
      if (existingUser) {
        alert('اسم المستخدم هذا مستخدم بالفعل، الرجاء اختيار اسم آخر.');
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
            role: 'sheikh'
          }
        }
      });
      if (res.error) {
        alert('فشل إنشاء حساب الدخول: ' + res.error.message);
        return;
      }
      newAuthId = res.data.user?.id;
    }
    
    const payload = {
      userId: editingSheikh?.userId || (typeof newAuthId !== 'undefined' ? newAuthId : null),
      name: formData.name,
      civilId: formData.civilId,
      phone: formData.phone,
      email: formData.email,
      halqaName: formData.halqaName || '',
      bio: formData.bio,
      active: formData.active
    };
    
    if (editingSheikh) {
      updateSheikh(editingSheikh.id, payload);
    } else {
      addSheikh(payload);
      if (payload.userId) { 
        addUser({
          id: payload.userId,
          name: formData.name,
          email: formData.email || '',
          role: 'sheikh',
          phone: formData.phone
        });
      }
    }
    setIsModalOpen(false);
  };


  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const handleDelete = (sheikh: Sheikh) => {
    deleteSheikh(sheikh.id);
    if (sheikh.userId) {
      deleteUser(sheikh.userId);
    }
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              <UserSquare className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">إدارة المشايخ والمحفظين</h2>
              <p className="text-xs text-slate-400">سجل الكادر التعليمي ومسؤولي الحلقات القرآنية</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ إضافة شيخ / محفظ جديد</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sheikhs.map(sheikh => {
          const halqaStudents = students.filter(s => s.sheikhId === sheikh.id);

          return (
            <div
              key={sheikh.id}
              className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-emerald-800 to-emerald-600 text-amber-300 text-lg font-black flex items-center justify-center shadow-md">
                      {sheikh.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{sheikh.name}</h3>
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{sheikh.halqaName}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => updateSheikh(sheikh.id, { active: !sheikh.active })}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                      sheikh.active
                        ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
                    }`}
                    title="انقر لتغيير حالة الحساب"
                  >
                    {sheikh.active ? 'نشط' : 'غير نشط'}
                  </button>
                </div>

                <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">الرقم المدني:</span>
                    <span className="font-mono">{sheikh.civilId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">الهاتف:</span>
                    <span className="font-mono">{sheikh.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">البريد:</span>
                    <span className="font-mono text-[11px]">{sheikh.email || 'غير مسجل'}</span>
                  </div>
                </div>

                {sheikh.bio && (
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic">
                    «{sheikh.bio}»
                  </p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  الطلاب: <strong className="text-emerald-700 dark:text-emerald-400 font-mono">{halqaStudents.length}</strong>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(sheikh)}
                    className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {deleteConfirm === sheikh.id ? (
                    <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-900/30 p-1 rounded-lg">
                      <span className="text-[10px] text-rose-600 font-bold px-1">تأكيد؟</span>
                      <button onClick={() => handleDelete(sheikh)} className="p-1 text-rose-700 hover:bg-rose-200 dark:hover:bg-rose-800 rounded">نعم</button>
                      <button onClick={() => setDeleteConfirm(null)} className="p-1 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 rounded">لا</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(sheikh.id)}
                      className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Sheikh Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {editingSheikh ? 'تعديل بيانات المحفظ' : 'إضافة شيخ / محفظ جديد'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    placeholder="الشيخ أحمد العلي"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">اسم الحلقة التابعة له</label>
                  <input
                    type="text"
                    value={formData.halqaName}
                    onChange={(e) => setFormData({ ...formData, halqaName: e.target.value })}
                    placeholder="حلقة الإمام نافع"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الرقم المدني</label>
                  <input
                    type="text"
                    
                    value={formData.civilId}
                    onChange={(e) => setFormData({ ...formData, civilId: e.target.value })}
                    placeholder="290010100001"
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
                    placeholder="90000001"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sheikh@test.com"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الإجازات والنبذة التعريفية</label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="مجاز بالقراءات العشر، خبرة في التحفيظ..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                ></textarea>
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
                  {editingSheikh ? 'حفظ التعديلات' : 'إضافة الشيخ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
