import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Shield } from 'lucide-react';

export const ResetPasswordModal: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }
    if (password.length < 6) {
      setError('يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.');
      return;
    }

    setLoading(true);
    const { error: resetErr } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (resetErr) {
      setError('حدث خطأ أثناء تغيير كلمة المرور: ' + resetErr.message);
    } else {
      setSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-slate-50 dark:bg-slate-800 p-2 flex items-center justify-center text-emerald-500 mx-auto mb-4 border border-slate-100 dark:border-slate-700">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2 tracking-tight">إعادة تعيين كلمة المرور</h2>
          <p className="text-slate-500 text-sm">قم بإدخال كلمة المرور الجديدة لحسابك.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-600 dark:text-rose-400 text-sm text-center font-semibold">
            {error}
          </div>
        )}
        
        {success ? (
          <div className="text-center">
            <div className="mb-6 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
              تم تغيير كلمة المرور بنجاح!
            </div>
            <button
              onClick={onComplete}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-xl"
            >
              الذهاب لتسجيل الدخول
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">كلمة المرور الجديدة</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">تأكيد كلمة المرور</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-xl disabled:opacity-70 mt-6"
            >
              {loading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
            </button>
          </form>
        )}

        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">
            مسار الصفحة المخصص لإعدادات سوبابيس: <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-emerald-600">/resetpassword</code>
          </p>
        </div>
      </div>
    </div>
  );
};
