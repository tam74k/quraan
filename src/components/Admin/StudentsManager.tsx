import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Phone,
  Calendar,
  X,
  FileSpreadsheet,
  BookOpen,
  Award,
  Sparkles
} from 'lucide-react';
import { CertificateModal } from '../Common/CertificateModal';

export const StudentsManager: React.FC = () => {
  const {
    students,
    sheikhs,
    addStudent,
    updateStudent,
    deleteStudent,
    extractDOBFromCivilID
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [sheikhFilter, setSheikhFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Certificate Modal State
  const [certStudent, setCertStudent] = useState<Student | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    civilId: '',
    dob: '',
    age: 10,
    grade: 'المتوسط' as Student['grade'],
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    sheikhId: '' as string | number,
    status: 'Active' as Student['status'],
    notes: '',
    targetJuz: 5
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      civilId: '',
      dob: '',
      age: 10,
      grade: 'المتوسط',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      sheikhId: sheikhs[0]?.id || '',
      status: 'Active',
      notes: '',
      targetJuz: 5
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      civilId: student.civilId,
      dob: student.dob || '',
      age: student.age,
      grade: student.grade,
      parentName: student.parentName || '',
      parentPhone: student.parentPhone,
      parentEmail: student.parentEmail,
      sheikhId: student.sheikhId || '',
      status: student.status,
      notes: student.notes || '',
      targetJuz: student.targetJuz || 5
    });
    setIsModalOpen(true);
  };

  const handleCivilIdChange = (val: string) => {
    const extractedDOB = extractDOBFromCivilID(val);
    if (extractedDOB) {
      const birthYear = parseInt(extractedDOB.split('-')[0]);
      const currentYear = new Date().getFullYear();
      const calculatedAge = Math.max(4, currentYear - birthYear);
      setFormData(prev => ({
        ...prev,
        civilId: val,
        dob: extractedDOB,
        age: calculatedAge
      }));
    } else {
      setFormData(prev => ({ ...prev, civilId: val }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      civilId: formData.civilId,
      dob: formData.dob,
      age: Number(formData.age),
      grade: formData.grade,
      parentName: formData.parentName,
      parentPhone: formData.parentPhone,
      parentEmail: formData.parentEmail,
      sheikhId: formData.sheikhId ? Number(formData.sheikhId) : null,
      status: formData.status,
      notes: formData.notes,
      targetJuz: Number(formData.targetJuz),
      joinDate: editingStudent?.joinDate || new Date().toISOString().split('T')[0]
    };

    if (editingStudent) {
      updateStudent(editingStudent.id, payload);
    } else {
      addStudent(payload);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (student: Student) => {
    if (window.confirm(`هل أنت متأكد من رغبتك في حذف الطالب (${student.name}) نهائياً من السجلات؟`)) {
      deleteStudent(student.id);
    }
  };

  const exportCSV = () => {
    const headers = 'الرقم المدني,اسم الطالب,المرحلة,العمر,هاتف ولي الأمر,البريد,الحلقة,الحالة\n';
    const rows = filteredStudents.map(s => {
      const sh = sheikhs.find(shk => shk.id === s.sheikhId);
      return `"${s.civilId}","${s.name}","${s.grade}","${s.age}","${s.parentPhone}","${s.parentEmail}","${sh ? sh.name : 'غير محدد'}","${s.status}"`;
    }).join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `students-list-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Filters
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.includes(searchQuery) || s.civilId.includes(searchQuery) || s.parentPhone.includes(searchQuery);
    const matchesGrade = gradeFilter === 'all' || s.grade === gradeFilter;
    const matchesSheikh = sheikhFilter === 'all' || (sheikhFilter === 'none' ? s.sheikhId === null : s.sheikhId === Number(sheikhFilter));
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesGrade && matchesSheikh && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              <GraduationCap className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">سجل وإدارة الطلاب</h2>
              <p className="text-xs text-slate-400">إجمالي {students.length} طالب مسجل في المركز</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>تصدير Excel (CSV)</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ تسجيل طالب جديد</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Controls */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم أو الرقم المدني أو الهاتف..."
            className="w-full px-3.5 py-2 pl-9 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        {/* Grade */}
        <div>
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="all">جميع المراحل الدراسية</option>
            <option value="التمهيدي">التمهيدي</option>
            <option value="الابتدائي">الابتدائي</option>
            <option value="المتوسط">المتوسط</option>
            <option value="الثانوي">الثانوي</option>
            <option value="الجامعي">الجامعي</option>
          </select>
        </div>

        {/* Sheikh */}
        <div>
          <select
            value={sheikhFilter}
            onChange={(e) => setSheikhFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="all">جميع الحلقات والمشايخ</option>
            {sheikhs.map(sh => (
              <option key={sh.id} value={sh.id}>{sh.halqaName} - {sh.name}</option>
            ))}
            <option value="none">طلاب بدون حلقة</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="all">جميع الحالات</option>
            <option value="Active">النشطين فقط</option>
            <option value="Inactive">غير النشطين</option>
          </select>
        </div>

      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold">
                <th className="p-4">اسم الطالب</th>
                <th className="p-4">الرقم المدني</th>
                <th className="p-4">المرحلة / العمر</th>
                <th className="p-4">الحلقة المسكن بها</th>
                <th className="p-4">هاتف ولي الأمر</th>
                <th className="p-4">الحالة</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-300">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => {
                  const currentSheikh = sheikhs.find(s => s.id === student.sheikhId);
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{student.name}</div>
                        <div className="text-[11px] text-slate-400">تاريخ الانضمام: {student.joinDate}</div>
                      </td>
                      <td className="p-4 font-mono font-medium">{student.civilId}</td>
                      <td className="p-4">
                        <span className="font-semibold">{student.grade}</span>
                        <span className="text-slate-400 mr-1.5">({student.age} سنة)</span>
                      </td>
                      <td className="p-4">
                        {currentSheikh ? (
                          <div>
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">{currentSheikh.halqaName}</span>
                            <div className="text-[10px] text-slate-400">{currentSheikh.name}</div>
                          </div>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md font-bold text-[11px]">
                            غير مسكن
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-mono">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{student.parentPhone}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{student.parentEmail}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          student.status === 'Active'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {student.status === 'Active' ? 'نشط' : 'غير نشط'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setCertStudent(student)}
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                            title="إصدار شهادة تقدير"
                          >
                            <Award className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(student)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                            title="تعديل بيانات الطالب"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(student)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="حذف الطالب"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    لا يوجد طلاب يطابقون خيارات البحث المحددة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  <GraduationCap className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {editingStudent ? 'تعديل بيانات الطالب' : 'تسجيل طالب جديد'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Civil ID */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الرقم المدني (يستخرج الميلاد تلقائياً)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.civilId}
                    onChange={(e) => handleCivilIdChange(e.target.value)}
                    placeholder="مثال: 312051200123"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                  />
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    اسم الطالب الرباعي
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="عبدالرحمن محمد الراشد"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                {/* DOB & Age */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">تاريخ الميلاد</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">المرحلة الدراسية</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value as Student['grade'] })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="التمهيدي">التمهيدي</option>
                    <option value="الابتدائي">الابتدائي</option>
                    <option value="المتوسط">المتوسط</option>
                    <option value="الثانوي">الثانوي</option>
                    <option value="الجامعي">الجامعي</option>
                  </select>
                </div>

                {/* Parent Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">رقم هاتف ولي الأمر (واتساب)</label>
                  <input
                    type="tel"
                    required
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    placeholder="99991111"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                {/* Parent Email (for login) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">بريد ولي الأمر (حساب الدخول)</label>
                  <input
                    type="email"
                    required
                    value={formData.parentEmail}
                    onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                    placeholder="parent@test.com"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                {/* Sheikh Assignment */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الحلقة والشيخ المسند إليه</label>
                  <select
                    value={formData.sheikhId}
                    onChange={(e) => setFormData({ ...formData, sheikhId: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="">-- بدون حلقة حالياً --</option>
                    {sheikhs.filter(s => s.active).map(sh => (
                      <option key={sh.id} value={sh.id}>{sh.halqaName} ({sh.name})</option>
                    ))}
                  </select>
                </div>

                {/* Target Juz */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الهدف القرآني للفصل (عدد الأجزاء)</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={formData.targetJuz}
                    onChange={(e) => setFormData({ ...formData, targetJuz: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">ملاحظات إدارية وتربوية</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="ملاحظات حول مستوى الطالب أو الحفظ..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
                >
                  {editingStudent ? 'حفظ التعديلات' : 'اعتماد وتسجيل الطالب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {certStudent && (
        <CertificateModal
          studentName={certStudent.name}
          sheikhName={sheikhs.find(s => s.id === certStudent.sheikhId)?.name}
          onClose={() => setCertStudent(null)}
        />
      )}

    </div>
  );
};
