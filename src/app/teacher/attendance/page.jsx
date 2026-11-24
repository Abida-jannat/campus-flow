"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  Loader2,
  Users,
  RefreshCw,
  Search,
  Check,
  X,
  Clock,
  CalendarDays,
  ChevronDown,
  ArrowLeft,
  Save,
  UserCheck,
  Trash2,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch } from "@/lib/api-client";

const localDate = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString("en-CA"); // YYYY-MM-DD in the teacher's own timezone
};

const prettyDate = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function TeacherAttendancePage() {
  const [tab, setTab] = useState("take"); // "take" | "report"

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [date, setDate] = useState(localDate());

  const [students, setStudents] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [alreadyTaken, setAlreadyTaken] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [report, setReport] = useState(null);

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [refreshingCourses, setRefreshingCourses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  /* ---------------------------- data loading ---------------------------- */

  const loadCourses = useCallback(async (initial = true) => {
    initial ? setLoadingCourses(true) : setRefreshingCourses(true);
    const res = await apiFetch("/api/teacher/courses");
    if (res.ok) {
      setCourses(res.data.courses || []);
      if (!initial) toast.success("Courses refreshed");
    } else {
      toast.error(res.message);
    }
    setLoadingCourses(false);
    setRefreshingCourses(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount pattern
    loadCourses(true);
  }, [loadCourses]);

  const loadRoster = useCallback(async (courseCode, day) => {
    setLoadingStudents(true);
    const res = await apiFetch(
      `/api/attendance?courseCode=${encodeURIComponent(courseCode)}&date=${day}`
    );

    if (!res.ok) {
      toast.error(res.message);
      setStudents([]);
      setStatusMap({});
      setAlreadyTaken(false);
    } else {
      const list = res.data.students || [];
      setStudents(list);
      // Show what was saved before; everyone else starts as "present".
      setStatusMap(Object.fromEntries(list.map((s) => [s.email, s.status || "present"])));
      setAlreadyTaken(Boolean(res.data.taken));
    }
    setDirty(false);
    setLoadingStudents(false);
  }, []);

  const loadReport = useCallback(async (courseCode) => {
    setLoadingReport(true);
    const res = await apiFetch(`/api/attendance/report?courseCode=${encodeURIComponent(courseCode)}`);
    if (res.ok) setReport(res.data);
    else {
      toast.error(res.message);
      setReport(null);
    }
    setLoadingReport(false);
  }, []);

  useEffect(() => {
    if (!selectedCourse) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing selection is a safe, intentional reset
      setStudents([]);
      setStatusMap({});
      setReport(null);
      return;
    }
    if (tab === "take") loadRoster(selectedCourse, date);
    else loadReport(selectedCourse);
  }, [selectedCourse, date, tab, loadRoster, loadReport]);

  /* ------------------------------- actions ------------------------------- */

  const changeCourseOrDate = (apply) => {
    if (dirty && !confirm("You have unsaved changes. Discard them?")) return;
    apply();
  };

  const setStatus = (email, status) => {
    setStatusMap((prev) => ({ ...prev, [email]: status }));
    setDirty(true);
  };

  const markAll = (status) => {
    setStatusMap(Object.fromEntries(students.map((s) => [s.email, status])));
    setDirty(true);
  };

  const handleSave = async () => {
    if (!selectedCourse || students.length === 0) return;
    setSaving(true);

    const res = await apiFetch("/api/attendance", {
      method: "POST",
      body: {
        courseCode: selectedCourse,
        date,
        records: students.map((s) => ({ studentEmail: s.email, status: statusMap[s.email] || "present" })),
      },
    });

    if (res.ok) {
      toast.success(`Attendance saved for ${prettyDate(date)}`);
      setAlreadyTaken(true);
      setDirty(false);
    } else {
      toast.error(res.requestId ? `${res.message} (ref ${res.requestId.slice(0, 8)})` : res.message);
    }
    setSaving(false);
  };

  const handleClearDay = async () => {
    if (!confirm(`Delete ALL attendance saved for ${prettyDate(date)}? This cannot be undone.`)) return;

    const res = await apiFetch(
      `/api/attendance?courseCode=${encodeURIComponent(selectedCourse)}&date=${date}`,
      { method: "DELETE" }
    );

    if (res.ok) {
      toast.success(res.message);
      loadRoster(selectedCourse, date);
    } else {
      toast.error(res.message);
    }
  };

  /* ------------------------------ derived ------------------------------ */

  const selectedCourseData = useMemo(
    () => courses.find((c) => c.courseCode === selectedCourse),
    [courses, selectedCourse]
  );

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.studentId?.toLowerCase().includes(q)
    );
  }, [students, search]);

  const stats = useMemo(() => {
    const counts = { present: 0, late: 0, absent: 0 };
    students.forEach((s) => (counts[statusMap[s.email] || "present"] += 1));
    return { total: students.length, ...counts };
  }, [students, statusMap]);

  const getInitials = (name = "") =>
    name.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "ST";

  /* -------------------------------- UI -------------------------------- */

  if (loadingCourses) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-400" size={24} />
          </div>
          <p className="text-sm text-slate-400">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* HEADER */}
        <div className="mb-8">
          <Link
            href="/teacher"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white transition mb-4"
          >
            <ArrowLeft size={15} />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <ClipboardCheck size={24} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Attendance</h1>
              <p className="text-sm text-slate-400 mt-1">Take attendance, fix past days and review reports</p>
            </div>
          </div>
        </div>

        {/* COURSE + DATE */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 lg:p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-end gap-5">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">Select Course</label>
              <div className="relative">
                <select
                  value={selectedCourse}
                  onChange={(e) => changeCourseOrDate(() => setSelectedCourse(e.target.value))}
                  className="w-full appearance-none bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 pr-10 text-sm text-white outline-none focus:border-indigo-500 transition"
                >
                  <option value="">Choose a course</option>
                  {courses.map((c) => (
                    <option key={c.courseCode} value={c.courseCode}>
                      {c.courseName} ({c.courseCode})
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {tab === "take" && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
                <div className="relative">
                  <CalendarDays size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" />
                  <input
                    type="date"
                    value={date}
                    min={localDate(-60)}
                    max={localDate()}
                    onChange={(e) => e.target.value && changeCourseOrDate(() => setDate(e.target.value))}
                    className="bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white outline-none focus:border-indigo-500 transition [color-scheme:dark]"
                  />
                </div>
              </div>
            )}

            <button
              onClick={() => loadCourses(false)}
              disabled={refreshingCourses}
              className="h-[50px] px-5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-300 hover:text-white transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshingCourses ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {selectedCourseData && (
            <div className="mt-5 pt-5 border-t border-slate-800 flex flex-wrap gap-3">
              <span className="px-3 py-2 rounded-lg bg-indigo-500/10 text-indigo-300 text-xs font-medium">{selectedCourseData.courseCode}</span>
              <span className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs">{selectedCourseData.department}</span>
              <span className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs">{selectedCourseData.semester}</span>
              <span className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs">{selectedCourseData.credit} Credits</span>
            </div>
          )}

          {courses.length === 0 && (
            <div className="mt-5 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
              <p className="text-sm text-slate-400">You don&apos;t have any courses yet.</p>
              <Link href="/teacher/courses" className="inline-block text-sm text-indigo-400 hover:text-indigo-300 mt-1">
                Go to My Courses →
              </Link>
            </div>
          )}
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-6">
          {[
            ["take", "Take Attendance", <ClipboardCheck key="i" size={16} />],
            ["report", "Reports", <BarChart3 key="i" size={16} />],
          ].map(([id, label, icon]) => (
            <button
              key={id}
              onClick={() => changeCourseOrDate(() => setTab(id))}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition ${
                tab === id
                  ? "bg-indigo-600 border-indigo-500 text-white"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {!selectedCourse && (
          <div className="bg-slate-900 border border-slate-800 border-dashed rounded-2xl py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-5">
              <ClipboardCheck size={28} className="text-indigo-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-200">Select a course to begin</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
              Choose one of your courses above to take attendance or see its report.
            </p>
          </div>
        )}

        {/* ------------------------- TAKE ATTENDANCE ------------------------- */}
        {selectedCourse && tab === "take" && (
          <>
            {alreadyTaken && (
              <div className="mb-4 flex items-center gap-3 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-200">
                <Check size={16} className="shrink-0" />
                <span>
                  Attendance for <strong>{prettyDate(date)}</strong> was already saved. You are editing it; saving again updates the records.
                </span>
                <button
                  onClick={handleClearDay}
                  className="ml-auto flex items-center gap-1.5 text-xs text-red-300 hover:text-red-200 shrink-0"
                >
                  <Trash2 size={14} /> Clear this day
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Stat label="Total Students" value={stats.total} icon={<Users size={18} />} />
              <Stat label="Present" value={stats.present} icon={<Check size={18} />} type="present" />
              <Stat label="Late" value={stats.late} icon={<Clock size={18} />} type="late" />
              <Stat label="Absent" value={stats.absent} icon={<X size={18} />} type="absent" />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-5 lg:p-6 border-b border-slate-800">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">Student Attendance</h2>
                    <p className="text-sm text-slate-500 mt-1">{prettyDate(date)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => markAll("present")}
                      disabled={students.length === 0}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/10 transition disabled:opacity-40"
                    >
                      <UserCheck size={14} /> Mark All Present
                    </button>
                    <button
                      onClick={() => markAll("absent")}
                      disabled={students.length === 0}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/10 transition disabled:opacity-40"
                    >
                      <X size={14} /> Mark All Absent
                    </button>
                  </div>
                </div>

                <div className="relative mt-5">
                  <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search student by name, email or ID..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              {loadingStudents && (
                <div className="py-16 flex flex-col items-center justify-center">
                  <Loader2 size={28} className="animate-spin text-indigo-400 mb-3" />
                  <p className="text-sm text-slate-400">Loading students...</p>
                </div>
              )}

              {!loadingStudents && students.length === 0 && (
                <div className="py-16 text-center">
                  <Users size={25} className="mx-auto text-slate-600 mb-3" />
                  <h3 className="font-medium text-slate-300">No students found</h3>
                  <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                    Students appear here when their department and semester match this course.
                  </p>
                </div>
              )}

              {!loadingStudents && filteredStudents.length > 0 && (
                <div className="divide-y divide-slate-800">
                  {filteredStudents.map((student) => {
                    const status = statusMap[student.email] || "present";
                    return (
                      <div key={student.email} className="px-4 lg:px-6 py-4 hover:bg-slate-800/30 transition">
                        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_320px] lg:items-center gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center text-indigo-300 text-xs font-semibold shrink-0">
                              {getInitials(student.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-200 truncate">{student.name}</p>
                              <p className="text-xs text-slate-500 truncate mt-0.5">
                                {student.studentId ? `${student.studentId} · ` : ""}
                                {student.email}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <StatusButton active={status === "present"} onClick={() => setStatus(student.email, "present")} icon={<Check size={15} />} label="Present" type="present" />
                            <StatusButton active={status === "late"} onClick={() => setStatus(student.email, "late")} icon={<Clock size={15} />} label="Late" type="late" />
                            <StatusButton active={status === "absent"} onClick={() => setStatus(student.email, "absent")} icon={<X size={15} />} label="Absent" type="absent" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!loadingStudents && students.length > 0 && filteredStudents.length === 0 && (
                <div className="py-12 text-center">
                  <Search size={24} className="mx-auto text-slate-600 mb-3" />
                  <p className="text-sm text-slate-400">No students match your search.</p>
                </div>
              )}

              {students.length > 0 && (
                <div className="sticky bottom-0 p-4 lg:p-5 bg-slate-950/95 backdrop-blur border-t border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-300">
                        {stats.total} students {dirty && <span className="text-amber-400">· unsaved changes</span>}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {stats.present} present · {stats.late} late · {stats.absent} absent
                      </p>
                    </div>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 px-6 py-3 rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-500/10"
                    >
                      {saving ? (
                        <>
                          <Loader2 size={17} className="animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Save size={17} /> {alreadyTaken ? "Update Attendance" : "Save Attendance"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ------------------------------ REPORT ------------------------------ */}
        {selectedCourse && tab === "report" && (
          <>
            {loadingReport && (
              <div className="py-16 flex flex-col items-center">
                <Loader2 size={28} className="animate-spin text-indigo-400 mb-3" />
                <p className="text-sm text-slate-400">Building report...</p>
              </div>
            )}

            {!loadingReport && report && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Stat label="Classes Held" value={report.classesHeld} icon={<CalendarDays size={18} />} />
                  <Stat label="Students" value={report.students.length} icon={<Users size={18} />} />
                  <Stat label="Average Attendance" value={`${report.averagePercentage}%`} icon={<BarChart3 size={18} />} type="present" />
                  <Stat label={`Below ${report.threshold}%`} value={report.atRiskCount} icon={<AlertTriangle size={18} />} type="absent" />
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="p-5 border-b border-slate-800">
                    <h2 className="text-lg font-semibold">Students</h2>
                  </div>
                  {report.students.length === 0 ? (
                    <p className="py-10 text-center text-sm text-slate-500">No students in this course yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs uppercase tracking-wider text-slate-600 bg-slate-950/40">
                            <th className="px-5 py-3">Student</th>
                            <th className="px-3 py-3 text-center">Present</th>
                            <th className="px-3 py-3 text-center">Late</th>
                            <th className="px-3 py-3 text-center">Absent</th>
                            <th className="px-5 py-3 text-right">Attendance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {report.students.map((s) => (
                            <tr key={s.email} className="hover:bg-slate-800/30">
                              <td className="px-5 py-3">
                                <p className="text-slate-200">{s.name}</p>
                                <p className="text-xs text-slate-500">{s.studentId || s.email}</p>
                              </td>
                              <td className="px-3 py-3 text-center text-emerald-400">{s.present}</td>
                              <td className="px-3 py-3 text-center text-amber-400">{s.late}</td>
                              <td className="px-3 py-3 text-center text-red-400">{s.absent}</td>
                              <td className="px-5 py-3 text-right">
                                <span
                                  className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                    s.total === 0
                                      ? "bg-slate-800 text-slate-500"
                                      : s.atRisk
                                      ? "bg-red-500/10 text-red-400"
                                      : "bg-emerald-500/10 text-emerald-400"
                                  }`}
                                >
                                  {s.total === 0 ? "-" : `${s.percentage}%`}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="p-5 border-b border-slate-800">
                    <h2 className="text-lg font-semibold">Class History</h2>
                    <p className="text-xs text-slate-500 mt-1">Click a day to open and edit it.</p>
                  </div>
                  {report.sessions.length === 0 ? (
                    <p className="py-10 text-center text-sm text-slate-500">No attendance taken yet.</p>
                  ) : (
                    <div className="divide-y divide-slate-800">
                      {report.sessions.map((d) => (
                        <button
                          key={d.date}
                          onClick={() => {
                            setDate(d.date);
                            setTab("take");
                          }}
                          className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-800/30 transition text-left"
                        >
                          <span className="text-slate-200 text-sm">{prettyDate(d.date)}</span>
                          <span className="text-xs text-slate-500">
                            {d.present} present · {d.late} late · {d.absent} absent ·{" "}
                            <span className="text-slate-300 font-medium">{d.percentage}%</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, icon, type = "default" }) {
  const styles = {
    default: "bg-slate-800/60 text-slate-400",
    present: "bg-emerald-500/10 text-emerald-400",
    late: "bg-amber-500/10 text-amber-400",
    absent: "bg-red-500/10 text-red-400",
  };
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 lg:p-5">
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${styles[type]}`}>{icon}</div>
        <span className="text-2xl font-bold text-slate-100">{value}</span>
      </div>
      <p className="text-xs text-slate-500 mt-3">{label}</p>
    </div>
  );
}

function StatusButton({ active, onClick, icon, label, type }) {
  const styles = {
    present: {
      active: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
      inactive: "border-slate-700 text-slate-500 hover:border-emerald-500/30 hover:text-emerald-400",
    },
    late: {
      active: "bg-amber-500/15 border-amber-500/30 text-amber-400",
      inactive: "border-slate-700 text-slate-500 hover:border-amber-500/30 hover:text-amber-400",
    },
    absent: {
      active: "bg-red-500/15 border-red-500/30 text-red-400",
      inactive: "border-slate-700 text-slate-500 hover:border-red-500/30 hover:text-red-400",
    },
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg border text-xs font-medium transition ${
        active ? styles[type].active : styles[type].inactive
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
