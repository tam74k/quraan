import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MessageSquare, Send, CheckCircle2, AlertTriangle, Sparkles, User } from 'lucide-react';
import { Note } from '../../types';

export const SheikhNotes: React.FC = () => {
  const { students, sheikhs, currentSheikh, notes, addNote } = useApp();

  const activeSheikh = currentSheikh || sheikhs[0];
  const myStudents = students.filter(s => s.sheikhId === activeSheikh?.id && s.status === 'Active');

  const [studentId, setStudentId] = useState<number>(myStudents[0]?.id || 1);
  const [noteText, setNoteText] = useState('');
  const [priority, setPriority] = useState<Note['priority']>('عادي');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSendNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    addNote({
      studentId: Number(studentId),
      sheikhId: activeSheikh?.id,
      date: new Date().toISOString().split('T')[0],
      text: noteText.trim(),
      priority,
      readByParent: false
    });

    setNoteText('');
    setSuccessMsg('تم إرسال الملاحظة بنجاح، ستصل كإشعار فوري لولي الأمر.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const myStudentIds = myStudents.map(s => s.id);
  const halqaNotes = notes.filter(n => myStudentIds.includes(n.studentId)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              <MessageSquare className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">سجل الملاحظات والتواصل مع أولياء الأمور</h2>
              <p className="text-xs text-slate-400">إرسال التوجيهات والتنبيهات والرسائل التشجيعية لبيوت الطلاب</p>
            </div>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* New Note Form */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">إرسال ملاحظة جديدة لولي الأمر</h3>

        <form onSubmit={handleSendNote} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">اختر الطالب</label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                {myStudents.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">نوع الملاحظة</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Note['priority'])}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="عادي">توجيه عام أو واجب منزلي</option>
                <option value="تشجيع">رسالة ثناء وتشجيع ⭐</option>
                <option value="هام">تنبيه هام ومتابعة ضرورية ⚠️</option>
                <option value="تنبيه غياب">تنبيه غياب وتأخر</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">نص الملاحظة</label>
            <textarea
              rows={3}
              required
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="مثال: يرجى تكرار مراجعة سورة النبأ مع الطالب في البيت 5 مرات بصوت مرتفع..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>إرسال الملاحظة لولي الأمر</span>
            </button>
          </div>
        </form>
      </div>

      {/* History of Halqa Notes */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">الملاحظات والتوجيهات السابقة</h3>

        <div className="space-y-3">
          {halqaNotes.length > 0 ? (
            halqaNotes.map(n => {
              const st = students.find(s => s.id === n.studentId);
              return (
                <div
                  key={n.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{st?.name || 'طالب'}</span>
                      <span className="text-[11px] text-slate-400 font-mono">({n.date})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        n.priority === 'تشجيع'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : n.priority === 'هام' || n.priority === 'تنبيه غياب'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {n.priority || 'توجيه'}
                      </span>

                      <span className={`px-2 py-0.5 rounded-md text-[10px] ${
                        n.readByParent ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950' : 'text-slate-400 bg-slate-100 dark:bg-slate-800'
                      }`}>
                        {n.readByParent ? '✓ قرأها ولي الأمر' : 'لم تُقرأ بعد'}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
                    «{n.text}»
                  </p>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              لا توجد ملاحظات مسجلة لطلاب هذه الحلقة بعد.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
