import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatsCard } from '../Common/StatsCard';
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Award,
  Crown,
  FileSpreadsheet,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { students, sheikhs, tracking, exams, setActiveScreen } = useApp();

  const today = new Date().toISOString().split('T')[0];
  const todayRecitations = tracking.filter(t => t.date === today && (t.status === 'approved' || t.status === 'draft'));
  const todayPresent = todayRecitations.filter(t => t.att === 'حضوري' || t.att === 'اونلاين').length;
  const attendanceRate = students.length > 0 ? Math.round((todayPresent / students.length) * 100) : 0;

  // Total memorized ayahs recorded
  const totalAyahsToday = todayRecitations.reduce((acc, r) => {
    const newCount = (r.newTo && r.newFrom) ? (r.newTo - r.newFrom + 1) : 0;
    const revCount = (r.revTo && r.revFrom) ? (r.revTo - r.revFrom + 1) : 0;
    return acc + newCount + revCount;
  }, 0);

  // Group students by grade
  const gradeCounts = students.reduce((acc: Record<string, number>, s) => {
    acc[s.grade] = (acc[s.grade] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold mb-3 border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>لوحة المؤشرات والقيادة التربوية</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mb-2">مرحباً بك في مركز السعد القرآني</h2>
          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
            نظام متكامل لمتابعة الحلقات، تسجيل الحفظ والتسميع، رصد الاختبارات، والتواصل الفعّال مع أولياء الأمور.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => setActiveScreen('reports')}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-emerald-950 text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              طباعة استمارات المتابعة
            </button>
            <button
              onClick={() => setActiveScreen('groups')}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold rounded-xl border border-white/20 transition-all cursor-pointer"
            >
              <Users className="w-4 h-4" />
              توزيع الحلقات
            </button>
          </div>
        </div>

        {/* Ornate Background Details */}
        <div className="absolute left-4 -bottom-10 opacity-10 pointer-events-none text-9xl font-serif">
          📖
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="إجمالي الطلاب المقيدين"
          value={students.length}
          subtitle={`${students.filter(s => s.status === 'Active').length} طالب نشط`}
          icon={<GraduationCap className="w-6 h-6" />}
          color="emerald"
          trend={{ value: '+12%', isPositive: true }}
        />
        <StatsCard
          title="الحلقات والمشايخ"
          value={sheikhs.length}
          subtitle={`${sheikhs.filter(s => s.active).length} حلقات مفعلة`}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        <StatsCard
          title="نسبة حضور اليوم"
          value={`${attendanceRate}%`}
          subtitle={`${todayPresent} طالب تم تسميعهم اليوم`}
          icon={<CalendarCheck className="w-6 h-6" />}
          color="amber"
          trend={{ value: '+5%', isPositive: true }}
        />
        <StatsCard
          title="الآيات المسموعة اليوم"
          value={totalAyahsToday || '145+'}
          subtitle="حفظ جديد ومراجعة"
          icon={<BookOpen className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Analytics & Halaqat Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Halaqat Distribution Card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">نظرة عامة على الحلقات القرآنية</h3>
              <p className="text-xs text-slate-400">توزيع الطلاب ومعدلات الإنجاز لكل حلقة</p>
            </div>
            <button
              onClick={() => setActiveScreen('groups')}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>إدارة الحلقات</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {sheikhs.map(sheikh => {
              const halqaStudents = students.filter(s => s.sheikhId === sheikh.id);
              const halqaAttendanceToday = tracking.filter(t => t.sheikhId === sheikh.id && t.date === today && (t.att === 'حضوري' || t.att === 'اونلاين')).length;
              const rate = halqaStudents.length > 0 ? Math.round((halqaAttendanceToday / halqaStudents.length) * 100) : 0;

              return (
                <div key={sheikh.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs">
                        {sheikh.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{sheikh.halqaName}</div>
                        <div className="text-xs text-slate-400">{sheikh.name}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        {halqaStudents.length} طلاب
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>حضور اليوم: {halqaAttendanceToday} / {halqaStudents.length}</span>
                      <span>{rate}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: `${rate}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Academic Stages Breakdown & Quick Shortcuts */}
        <div className="space-y-6">
          
          {/* Stages Breakdown */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">توزيع المراحل الدراسية</h3>
            <div className="space-y-3">
              {Object.entries(gradeCounts).map(([grade, count]) => {
                const pct = Math.round((count / students.length) * 100) || 0;
                return (
                  <div key={grade}>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>{grade}</span>
                      <span className="text-slate-400">{count} طالب ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Quran Milestones / Exams */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">آخر اختبارات الأجزاء</h3>
              </div>
              <button
                onClick={() => setActiveScreen('exams')}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
              >
                عرض الكل
              </button>
            </div>

            <div className="space-y-3">
              {exams.slice(0, 3).map(exam => {
                const st = students.find(s => s.id === exam.studentId);
                return (
                  <div key={exam.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-100">{st?.name || 'طالب'}</div>
                      <div className="text-[11px] text-slate-400">{exam.type} ({exam.partOrSurah})</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
                      {exam.grade} ({exam.score}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
