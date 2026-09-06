import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';

import { BookOpen, Shield, GraduationCap, Users, UserCheck, ArrowRight, Sparkles } from 'lucide-react';
import { UserRole } from '../../types';

export const LoginModal: React.FC = () => {
  const { login, centerInfo, students } = useApp();
  const [loginUsername, setLoginUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isForgot, setIsForgot] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [childrenCount, setChildrenCount] = useState<number | null>(null);

  React.useEffect(() => {
    if (regPhone.length >= 8) {
      const count = students.filter(s => s.parentPhone === regPhone).length;
      setChildrenCount(count);
    } else {
      setChildrenCount(null);
    }
  }, [regPhone, students]);
  const [forgotMsg, setForgotMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const { data, error: profileErr } = await supabase.from('profiles').select('email').eq('username', loginUsername).single();
    if (profileErr || !data) {
        setError('اسم المستخدم غير صحيح أو غير مسجل.');
        return;
    }
    const loginEmail = data.email;

    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password
    });

    if (authErr) {
        setError('بيانات الدخول غير صحيحة.');
        return;
    }

    const success = await login(loginEmail);
    if (!success) {
      setError('حسابك غير مفعل في النظام.');
    }
  };

  const [forgotLoading, setForgotLoading] = useState(false);
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMsg('');
    setError('');

    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: window.location.origin + '/#type=recovery',
    });

    setForgotLoading(false);

    if (resetErr) {
      setError('حدث خطأ: ' + resetErr.message);
    } else {
      setForgotMsg('تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني بنجاح.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
        
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-3xl bg-white p-2 flex items-center justify-center text-amber-300 mx-auto mb-4 shadow-xl overflow-hidden">
            {centerInfo.logo ? (
              <img src={centerInfo.logo} alt={centerInfo.name} className="w-full h-full object-contain" />
            ) : (
              <BookOpen className="w-8 h-8" />
            )}
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">{centerInfo.name}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">البوابة الإلكترونية لإدارة الحلقات والقرآن الكريم</p>
        </div>

        {!isForgot && !isRegister ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">اسم المستخدم</label>
              <input
                type="text"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">كلمة المرور</label>
                <button
                  type="button"
                  onClick={() => setIsForgot(true)}
                  className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
            >
              تسجيل الدخول للنظام
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setIsForgot(false); setForgotMsg(''); setError(''); }}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl shadow-sm transition-all mt-2 cursor-pointer"
            >
              إنشاء حساب ولي أمر جديد
            </button>
          </form>
        
        ) : isRegister ? (
          <form onSubmit={async (e) => {
            e.preventDefault();
            setError('');
            if (regPassword !== regConfirmPassword) {
              setError('كلمتا المرور غير متطابقتين.');
              return;
            }
            if (regPassword.length < 6) {
              setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
              return;
            }
            const { data: existingUser } = await supabase.from('profiles').select('id').eq('username', regUsername).maybeSingle();
            if (existingUser) {
              setError('اسم المستخدم هذا مستخدم بالفعل، الرجاء اختيار اسم آخر.');
              return;
            }
            const { data, error } = await supabase.auth.signUp({
              email: forgotEmail,
              password: regPassword,
              options: {
                data: {
                  username: regUsername,
                  name: regName,
                  phone: regPhone,
                  role: 'parent'
                }
              }
            });
            if (error) {
              setError('حدث خطأ أثناء إنشاء الحساب: ' + error.message);
            } else {
              setForgotMsg('تم إنشاء الحساب بنجاح! يتم الآن تسجيل دخولك...');
              setIsRegister(false);
              // They are automatically signed in by Supabase, wait for context to pick it up or explicitly call login
              // The session listener in AppContext will detect SIGNED_IN and update state?
              // Wait, AppContext's fetchInitialData loads profiles. A brand new profile might take a second to propagate.
              // Let's just reload the page to ensure all state is cleanly built.
              setTimeout(() => {
                  window.location.reload();
              }, 1000);
            }
          }} className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">إنشاء حساب ولي أمر</h3>
            {error && (
              <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">الاسم الكامل</label>
              <input type="text" required value={regName} onChange={(e) => setRegName(e.target.value)} className="w-full px-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">اسم المستخدم</label>
              <input type="text" required value={regUsername} onChange={(e) => setRegUsername(e.target.value)} className="w-full px-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">البريد الإلكتروني</label>
              <input type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="w-full px-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">رقم الجوال</label>
              <input type="text" required value={regPhone} onChange={(e) => setRegPhone(e.target.value)} className="w-full px-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600" />
            </div>
            {childrenCount !== null && (
              <div className="mt-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {childrenCount > 0 
                  ? `تم العثور على ${childrenCount} أبناء مسجلين بهذا الرقم` 
                  : 'لم يتم العثور على أبناء مسجلين بهذا الرقم في النظام'}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">كلمة المرور</label>
              <input type="password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="أدخل كلمة المرور (6 أحرف على الأقل)" className="w-full px-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">تأكيد كلمة المرور</label>
              <input type="password" required value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} placeholder="أعد إدخال كلمة المرور" className="w-full px-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition-all">إنشاء الحساب</button>
            <button type="button" onClick={() => setIsRegister(false)} className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 py-1">إلغاء</button>
          </form>
) : (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">استعادة كلمة المرور</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.</p>
            
            {forgotMsg && (
              <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                {forgotMsg}
              </div>
            )}

            <div>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="example@test.com"
                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={forgotLoading}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition-all disabled:opacity-70"
            >
              {forgotLoading ? "جاري الإرسال..." : "إرسال الرابط"}
            </button>

            <button
              type="button"
              onClick={() => { setIsForgot(false); setForgotMsg(''); }}
              className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 py-1"
            >
              العودة لتسجيل الدخول
            </button>
          </form>
        )}


      </div>
    </div>
  );
};
