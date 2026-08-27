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
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-400" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 max-w-6xl mx-auto space-y-6">
      
      {/* BACK TO DASHBOARD BUTTON */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition mb-2"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold">My Attendance Dashboard</h1>
      </div>

      {/* OVERALL STATS */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">Overall Attendance</p>
          <p className="text-3xl font-extrabold text-indigo-400 mt-1">
            {data?.overall?.percentage || 0}%
          </p>
        </div>
        <div className="flex gap-4 text-sm font-medium">
          <span className="text-emerald-400">Present: {data?.overall?.present || 0}</span>
          <span className="text-amber-400">Late: {data?.overall?.late || 0}</span>
          <span className="text-rose-400">Absent: {data?.overall?.absent || 0}</span>
        </div>
      </div>

      {/* COURSE BREAKDOWN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data?.courses?.map((course) => (
          <div key={course.courseCode} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-semibold text-slate-200">{course.courseName}</h2>
                <p className="text-xs text-slate-500">{course.courseCode}</p>
              </div>
              <span className="text-lg font-bold text-indigo-400">{course.percentage}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full transition-all duration-300"
                style={{ width: `${course.percentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 pt-1">
              <span>Attended: {course.present + course.late} / {course.total}</span>
              <span>Absent: {course.absent}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}