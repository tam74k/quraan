const fs = require('fs');
let file = 'src/components/Admin/SheikhsManager.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الإجازات والنبذة التعريفية</label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="مجاز بالقراءات العشر، خبرة في التحفيظ..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none resize-none"
                />
              </div>`;

const replaceStr = `              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الإجازات والنبذة التعريفية</label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="مجاز بالقراءات العشر، خبرة في التحفيظ..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none resize-none"
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
              </div>`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync(file, code);
console.log('Fixed Sheikhs status');
