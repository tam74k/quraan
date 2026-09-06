import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { UserCog, KeyRound, Phone, User, CheckCircle2, AlertCircle, Users } from 'lucide-react';

export const UserProfileSettings: React.FC = () => {
  const { currentUser, updateUser, sheikhs, admins, updateSheikh, updateAdmin, students, updateStudent } = useApp();

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const [showKidsPhoneModal, setShowKidsPhoneModal] = useState(false);
  const [newPhoneToUpdate, setNewPhoneToUpdate] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  if (!currentUser) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);
    setProfileLoading(true);

    const oldPhone = currentUser.phone;

    try {
      await updateUser(currentUser.id, { name, phone });

      if (currentUser.role === 'sheikh') {
        const matchingSheikh = sheikhs.find(s => s.email === currentUser.email || s.userId === currentUser.id);
        if (matchingSheikh) {
          await updateSheikh(matchingSheikh.id, { name, phone });
        }
      } else if (currentUser.role === 'admin' || currentUser.role === 'data_entry') {
        const matchingAdmin = admins.find(a => a.email === currentUser.email || a.userId === currentUser.id);
        if (matchingAdmin) {
          await updateAdmin(matchingAdmin.id, { name, phone });
        }
      }

      setProfileSuccess(true);

      // Smart Feature: Check if user is parent or has kids and phone changed
      if (phone && phone !== oldPhone) {
        const myKids = students.filter(s => 
          (oldPhone && s.parentPhone === oldPhone) ||
          (currentUser.email && s.parentEmail && s.parentEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
          (s.parentId === currentUser.id)
        );
        if (myKids.length > 0) {
          setNewPhoneToUpdate(phone);
          setShowKidsPhoneModal(true);
        }
      }
    } catch (err: any) {
      setProfileError(err.message || 'حدث خطأ أثناء تحديث الملف الشخصي');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleConfirmUpdateKidsPhone = async () => {
    try {
      const myKids = students.filter(s => 
        (currentUser.phone && s.parentPhone === currentUser.phone) ||
        (currentUser.email && s.parentEmail && s.parentEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
        (s.parentId === currentUser.id)
      );
      for (const kid of myKids) {
        await updateStudent(kid.id, { parentPhone: newPhoneToUpdate });
      }
      setShowKidsPhoneModal(false);
      setProfileSuccess(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('كلمتا المرور الجديدتان غير متطابقتين.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('يجب أن تكون كلمة المرور الجديدة مكونة من 6 أحرف على الأقل.');
      return;
    }

    setPasswordLoading(true);

    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: currentPassword
      });

      if (signInErr) {
        setPasswordError('كلمة المرور الحالية غير صحيحة.');
        setPasswordLoading(false);
        return;
      }

      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateErr) {
        setPasswordError('فشل تحديث كلمة المرور: ' + updateErr.message);
      } else {
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-3">
        <span className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
          <UserCog className="w-6 h-6" />
        </span>
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">إعدادات الحساب الشخصي</h2>
          <p className="text-xs text-slate-400">تحديث بياناتك الشخصية (الاسم، رقم الهاتف) وتغيير كلمة المرور الخاصة بك</p>
        </div>
      </div>

      {/* Profile Info Update Form */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
          <User className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">البيانات الشخصية</h3>
        </div>

        {profileSuccess && (
          <div className="mb-6 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>تم تحديث البيانات الشخصية بنجاح!</span>
          </div>
        )}

        {profileError && (
          <div className="mb-6 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-bold text-center flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">الاسم الظاهر</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">رقم الهاتف / الموبايل</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05XXXXXXXX"
                  dir="ltr"
                  className="w-full px-4 py-3 pl-9 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono text-right"
                />
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">البريد الإلكتروني (اسم المستخدم)</label>
            <input
              type="email"
              disabled
              value={currentUser.email}
              className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 text-xs font-mono cursor-not-allowed"
            />
            <p className="text-[10px] text-slate-400 mt-1">لا يمكن تغيير البريد الإلكتروني الأساسي مباشرة من هنا.</p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={profileLoading}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-70 cursor-pointer"
            >
              {profileLoading ? 'جاري الحفظ...' : 'حفظ التعديلات الشخصية'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
          <KeyRound className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">تغيير كلمة المرور</h3>
        </div>

        {passwordSuccess && (
          <div className="mb-6 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>تم تغيير كلمة المرور بنجاح!</span>
          </div>
        )}

        {passwordError && (
          <div className="mb-6 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-bold text-center flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">كلمة المرور الحالية</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              dir="ltr"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">كلمة المرور الجديدة</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">تأكيد كلمة المرور الجديدة</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={passwordLoading}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-70 cursor-pointer"
            >
              {passwordLoading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
            </button>
          </div>
        </form>
      </div>

      {/* Smart Feature Modal: Update Kids Phone Number */}
      {showKidsPhoneModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-emerald-600">
              <Users className="w-8 h-8 shrink-0" />
              <div>
                <h3 className="text-base font-black text-slate-800 dark:text-slate-100">تحديث بيانات الأبناء تلقائياً</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">تم تحديث رقم جوالك الشخصي بنجاح.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              هل ترغب في تحديث رقم ولي الأمر لجميع أبنائك المسجلين تلقائياً ليبقى متطابقاً مع رقم جوالك الجديد (<span className="font-mono font-bold text-emerald-600">{newPhoneToUpdate}</span>)؟
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowKidsPhoneModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                تخطي
              </button>
              <button
                type="button"
                onClick={handleConfirmUpdateKidsPhone}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                نعم، قم بتحديث أبنائي تلقائياً
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
