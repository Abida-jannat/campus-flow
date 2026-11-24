"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  MapPin,
  User,
  Users,
  Megaphone,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";

const STATUS_STYLE = {
  present: "bg-emerald-500/10 text-emerald-400",
  late: "bg-amber-500/10 text-amber-400",
  absent: "bg-red-500/10 text-red-400",
};

export default function CourseDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await apiFetch(`/api/courses/${id}`);
      if (!active) return;
      if (res.ok) setData(res.data);
      else setError(res.message);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-400" size={30} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <AlertTriangle className="mx-auto text-amber-400 mb-4" size={32} />
        <p className="text-slate-300">{error || "Course not found"}</p>
        <Link href="/dashboard/courses" className="inline-block mt-4 text-indigo-400 hover:text-indigo-300 text-sm">
          ← Back to courses
        </Link>
      </div>
    );
  }

  const { course, schedule, announcements, attendance, studentCount } = data;
  const low = attendance && attendance.total > 0 && attendance.percentage < 75;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link
          href="/dashboard/courses"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition mb-3"
        >
          <ArrowLeft size={16} /> Back to courses
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <BookOpen size={26} />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-white truncate">{course.courseName}</h1>
            <p className="text-sm text-slate-400 mt-1">
              {course.courseCode} · {course.department} · {course.semester} · {course.credit} credits
            </p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Info icon={<User size={18} />} label="Teacher" value={course.teacher || "-"} />
        <Info icon={<Users size={18} />} label="Classmates" value={`${studentCount} students`} />
      </div>

      {attendance && (
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">My Attendance</h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                attendance.total === 0
                  ? "bg-slate-800 text-slate-400"
                  : low
                  ? "bg-red-500/10 text-red-400"
                  : "bg-emerald-500/10 text-emerald-400"
              }`}
            >
              {attendance.total === 0 ? "No classes yet" : `${attendance.percentage}%`}
            </span>
          </div>

          {low && (
            <p className="flex items-center gap-2 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
              <AlertTriangle size={16} /> Your attendance is below 75% in this course.
            </p>
          )}

          <div className="grid grid-cols-3 gap-3 text-center">
            <Count label="Present" value={attendance.present} className="text-emerald-400" />
            <Count label="Late" value={attendance.late} className="text-amber-400" />
            <Count label="Absent" value={attendance.absent} className="text-red-400" />
          </div>

          {attendance.recent.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {attendance.recent.map((r) => (
                <span key={r.date} className={`px-2.5 py-1 rounded-lg text-xs ${STATUS_STYLE[r.status] || "bg-slate-800 text-slate-400"}`}>
                  {r.date} · {r.status}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6">
        <h2 className="text-lg font-bold text-white mb-4">Class Schedule</h2>
        {schedule.length === 0 ? (
          <p className="text-sm text-slate-500">No classes scheduled yet.</p>
        ) : (
          <div className="space-y-3">
            {schedule.map((s) => (
              <div key={s._id} className="flex flex-wrap items-center gap-x-6 gap-y-1 bg-slate-950/70 border border-slate-800 rounded-2xl px-4 py-3 text-sm">
                <span className="font-semibold text-indigo-300 w-24">{s.day}</span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Clock size={14} className="text-indigo-400" /> {s.startTime} - {s.endTime}
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <MapPin size={14} className="text-indigo-400" /> {s.building}
                  {s.floor ? `, ${s.floor}` : ""}, Room {s.room}
                </span>
                {s.type && <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">{s.type}</span>}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Megaphone size={18} className="text-indigo-400" /> Announcements
        </h2>
        {announcements.length === 0 ? (
          <p className="text-sm text-slate-500">No announcements for this course.</p>
        ) : (
          <div className="space-y-4">
            {announcements.map((a) => (
              <div key={a._id} className="border-b border-slate-800 pb-4 last:border-none last:pb-0">
                <p className="text-sm text-slate-300 whitespace-pre-wrap">{a.message}</p>
                <p className="text-xs text-slate-500 mt-2">
                  {a.teacherName || a.teacher} · {a.createdAt ? new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Info({ icon, label, value }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">{icon}</div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm text-slate-200 font-medium">{value}</p>
      </div>
    </div>
  );
}

function Count({ label, value, className }) {
  return (
    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl py-3">
      <p className={`text-2xl font-bold ${className}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}
