"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft } from "lucide-react";

export default function StudentAttendancePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAttendance() {
      try {
        const res = await fetch("/api/student/attendance");
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load attendance", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAttendance();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] text-slate-900 dark:text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 sm:p-6">
      {/* Back Link & Header */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition mb-2"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">My Attendance Dashboard</h1>
      </div>

      {/* Overall Summary Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Overall Attendance</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
            {data?.overall?.percentage || 0}%
          </p>
        </div>
        <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm font-semibold bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
          <span className="text-emerald-600 dark:text-emerald-400">Present: {data?.overall?.present || 0}</span>
          <span className="text-amber-600 dark:text-amber-400">Late: {data?.overall?.late || 0}</span>
          <span className="text-rose-600 dark:text-rose-400">Absent: {data?.overall?.absent || 0}</span>
        </div>
      </div>

      {/* Course-wise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data?.courses?.map((course) => (
          <div key={course.courseCode} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-3 shadow-sm hover:border-indigo-500/50 transition">
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-slate-900 dark:text-slate-200 truncate">{course.courseName}</h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{course.courseCode}</p>
              </div>
              <span className="text-base sm:text-lg font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0">{course.percentage}%</span>
            </div>
            
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 dark:bg-indigo-500 h-full transition-all duration-300"
                style={{ width: `${course.percentage}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 pt-1 font-medium">
              <span>Attended: {course.present + course.late} / {course.total}</span>
              <span>Absent: {course.absent}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}