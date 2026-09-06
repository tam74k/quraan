import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Building, Upload, Download, RotateCcw, Save, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const CenterSettings: React.FC = () => {
  const {
    centerInfo,
    updateCenterInfo,
    exportDataJSON,
    importDataJSON,
    resetToDemoData
  } = useApp();

  const [formData, setFormData] = useState({ ...centerInfo });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `logo-${Date.now()}.${fileExt}`;
        const { data, error } = await supabase.storage.from('pics').upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

        if (error) {
          throw error;
        }

        const { data: publicUrlData } = supabase.storage.from('pics').getPublicUrl(fileName);
        if (publicUrlData) {
          setFormData(prev => ({ ...prev, logo: publicUrlData.publicUrl }));
        }
      } catch (error: any) {
        alert('فشل رفع الشعار: ' + error.message);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateCenterInfo(formData);
    setSuccessMsg('تم حفظ بيانات وإعدادات المركز بنجاح');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const ok = importDataJSON(reader.result as string);
        if (ok) {
          setSuccessMsg('تم استيراد واستعادة قاعدة البيانات بنجاح!');
          setTimeout(() => setSuccessMsg(''), 4000);
        } else {
          setErrorMsg('ملف النسخة الاحتياطية غير صالح');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleReset = () => {
    if (window.confirm('تحذير: هل أنت متأكد من إعادة ضبط البيانات إلى الوضع التجريبي الافتراضي؟ ستفقد أي سجلات تم إدخالها محلياً.')) {
      resetToDemoData();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            <Building className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">إعدادات المركز والنسخ الاحتياطي</h2>
            <p className="text-xs text-slate-400">تخصيص هوية المركز، الشعار، وإدارة وتأمين البيانات</p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 rounded-2xl text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>البيانات الأساسية والهوية الرسمية</span>
        </h3>

        <form onSubmit={handleSaveInfo} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">اسم المركز القرآني</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">اسم فضيلة مدير المركز</label>
              <input
                type="text"
                required
                value={formData.managerName}
                onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">العام الهجري</label>
              <input
                type="text"
                value={formData.hijriYear}
                onChange={(e) => setFormData({ ...formData, hijriYear: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الفصل أو الدورة الدراسية</label>
              <input
                type="text"
                value={formData.academicSeason}
                onChange={(e) => setFormData({ ...formData, academicSeason: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">هواتف التواصل</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">البريد الرسمي</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">عنوان ومقر المركز</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Logo preview and upload */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">شعار المركز (يظهر بالتقارير والشهادات)</label>
            <div className="flex items-center gap-4">
              {formData.logo ? (
                <img src={formData.logo} alt="Logo" className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 text-xs">
                  بدون شعار
                </div>
              )}
              <div>
                {isUploading ? (
                  <div className="text-xs font-bold text-emerald-600 animate-pulse py-2">جاري الرفع...</div>
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="text-xs text-slate-500 file:mr-0 file:ml-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-950 dark:file:text-emerald-300 cursor-pointer"
                  />
                )}
                <p className="text-[10px] text-slate-400 mt-1">يُفضل استخدام صورة شفافة (PNG)</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>حفظ التعديلات</span>
            </button>
          </div>
        </form>
      </div>

      {/* Backup & Restore Tools */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">إدارة النسخ الاحتياطي واستعادة البيانات</h3>
        <p className="text-xs text-slate-400 mb-6">
          يمكنك تصدير نسخة كاملة من الطلاب والتقارير والدرجات والاحتفاظ بها كملف JSON، أو استعادتها في أي وقت.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 mb-1">تصدير نسخة احتياطية</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">تنزيل كامل بيانات النظام الحالية كملف JSON آمن ومضغوط.</p>
            </div>
            <button
              type="button"
              onClick={exportDataJSON}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تصدير الآن (JSON)</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 mb-1">استعادة نسخة سابقة</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">استرجاع كامل الطلاب وسجلات الحفظ من ملف JSON تم تصديره مسبقاً.</p>
            </div>
            <label className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>اختيار ملف للاستعادة</span>
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-xs text-rose-900 dark:text-rose-200 mb-1">إعادة الضبط للوضع التجريبي</h4>
              <p className="text-[11px] text-rose-700/70 dark:text-rose-300/70">مسح التعديلات واسترجاع البيانات النموذجية الافتراضية.</p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط البيانات</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
