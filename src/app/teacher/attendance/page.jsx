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
} from "lucide-react";
import toast from "react-hot-toast";

export default function TeacherAttendancePage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");

  const [students, setStudents] = useState([]);
  const [statusMap, setStatusMap] = useState({});

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [refreshingCourses, setRefreshingCourses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  // =========================================
  // LOAD COURSES
  // =========================================

  const loadCourses = useCallback(async (isInitialLoad = true) => {
    try {
      if (isInitialLoad) {
        setLoadingCourses(true);
      } else {
        setRefreshingCourses(true);
      }

      const res = await fetch("/api/teacher/courses", {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load courses");
      }

      setCourses(data.courses || []);

      if (!isInitialLoad) {
        toast.success("Courses refreshed");
      }
    } catch (err) {
      console.error("Load courses error:", err);
      toast.error(err.message || "Failed to load courses");
    } finally {
      setLoadingCourses(false);
      setRefreshingCourses(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount pattern
    loadCourses(true);
  }, [loadCourses]);

  // =========================================
  // LOAD STUDENTS
  // =========================================

  const loadStudents = useCallback(async (courseCode) => {
    setLoadingStudents(true);
    try {
      const res = await fetch(
        `/api/teacher/students?courseCode=${encodeURIComponent(courseCode)}`,
        { credentials: "include" }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load students");
      }

      const studentList = data.students || [];
      setStudents(studentList);

      const defaults = {};
      studentList.forEach((student) => {
        defaults[student.email] = "present";
      });
      setStatusMap(defaults);
    } catch (err) {
      console.error("Load students error:", err);
      toast.error(err.message || "Failed to load students");
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedCourse) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing selection is a safe, intentional reset
      setStudents([]);
      setStatusMap({});
      return;
    }
    loadStudents(selectedCourse);
  }, [selectedCourse, loadStudents]);

  // =========================================
  // DERIVED DATA
  // =========================================

  const selectedCourseData = useMemo(
    () => courses.find((c) => c.courseCode === selectedCourse),
    [courses, selectedCourse]
  );

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return students;
    return students.filter(
      (s) =>
        s.name?.toLowerCase().includes(query) ||
        s.email?.toLowerCase().includes(query) ||
        s.studentId?.toLowerCase().includes(query)
    );
  }, [students, search]);

  const attendanceStats = useMemo(() => {
    let present = 0,
      absent = 0,
      late = 0;

    students.forEach((s) => {
      const status = statusMap[s.email];
      if (status === "present") present++;
      if (status === "absent") absent++;
      if (status === "late") late++;
    });

    return { total: students.length, present, absent, late };
  }, [students, statusMap]);

  // =========================================
  // ACTIONS
  // =========================================

  const handleStatusChange = (email, status) => {
    setStatusMap((prev) => ({ ...prev, [email]: status }));
  };

  const markAllPresent = () => {
    const updated = {};
    students.forEach((s) => (updated[s.email] = "present"));
    setStatusMap(updated);
    toast.success("All students marked present");
  };

  const markAllAbsent = () => {
    const updated = {};
    students.forEach((s) => (updated[s.email] = "absent"));
    setStatusMap(updated);
    toast.success("All students marked absent");
  };

  const handleSubmit = async () => {
    if (!selectedCourse) {
      toast.error("Please select a course");
      return;
    }
    if (students.length === 0) {
      toast.error("No students found");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          courseCode: selectedCourse,
          records: Object.entries(statusMap).map(([studentEmail, status]) => ({
            studentEmail,
            status,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save attendance");
      }

      toast.success("Attendance saved successfully");
    } catch (err) {
      console.error("Save attendance error:", err);
      toast.error(err.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name = "") =>
    name.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "ST";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // =========================================
  // LOADING
  // =========================================

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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">
          <div>
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
                <h1 className="text-2xl lg:text-3xl font-bold">Take Attendance</h1>
                <p className="text-sm text-slate-400 mt-1">Record attendance for your students</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center">
              <CalendarDays size={18} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Attendance Date</p>
              <p className="text-sm font-medium text-slate-200">{today}</p>
            </div>
          </div>
        </div>

        {/* COURSE SELECTOR */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 lg:p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-end gap-5">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">Select Course</label>
              <div className="relative">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full appearance-none bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 pr-10 text-sm text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition"
                >
                  <option value="">Choose a course</option>
                  {courses.map((course) => (
                    <option key={course.courseCode} value={course.courseCode}>
                      {course.courseName} ({course.courseCode})
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>

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
              <div className="px-3 py-2 rounded-lg bg-indigo-500/10 text-indigo-300 text-xs font-medium">
                {selectedCourseData.courseCode}
              </div>
              <div className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs">
                {selectedCourseData.department}
              </div>
              <div className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs">
                {selectedCourseData.semester}
              </div>
              <div className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs">
                {selectedCourseData.credit} Credits
              </div>
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

        {/* ATTENDANCE CONTENT */}
        {selectedCourse && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <AttendanceStat label="Total Students" value={attendanceStats.total} icon={<Users size={18} />} />
              <AttendanceStat label="Present" value={attendanceStats.present} icon={<Check size={18} />} type="present" />
              <AttendanceStat label="Late" value={attendanceStats.late} icon={<Clock size={18} />} type="late" />
              <AttendanceStat label="Absent" value={attendanceStats.absent} icon={<X size={18} />} type="absent" />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-5 lg:p-6 border-b border-slate-800">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">Student Attendance</h2>
                    <p className="text-sm text-slate-500 mt-1">Mark each student as present, late, or absent.</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={markAllPresent}
                      disabled={students.length === 0}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/10 transition disabled:opacity-40"
                    >
                      <UserCheck size={14} />
                      Mark All Present
                    </button>
                    <button
                      onClick={markAllAbsent}
                      disabled={students.length === 0}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/10 transition disabled:opacity-40"
                    >
                      <X size={14} />
                      Mark All Absent
                    </button>
                  </div>
                </div>

                <div className="relative mt-5">
                  <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search student by name or email..."
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

              {!loadingStudents && selectedCourse && students.length === 0 && (
                <div className="py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <Users size={25} className="text-slate-600" />
                  </div>
                  <h3 className="font-medium text-slate-300">No students found</h3>
                  <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                    There are no students registered for this course yet.
                  </p>
                </div>
              )}

              {!loadingStudents && filteredStudents.length > 0 && (
                <div>
                  <div className="hidden lg:grid grid-cols-[1fr_320px] gap-4 px-6 py-3 bg-slate-950/40 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-600">
                    <span>Student</span>
                    <span className="text-center">Attendance Status</span>
                  </div>

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
                                <p className="text-xs text-slate-500 truncate mt-0.5">{student.email}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <StatusButton
                                active={status === "present"}
                                onClick={() => handleStatusChange(student.email, "present")}
                                icon={<Check size={15} />}
                                label="Present"
                                type="present"
                              />
                              <StatusButton
                                active={status === "late"}
                                onClick={() => handleStatusChange(student.email, "late")}
                                icon={<Clock size={15} />}
                                label="Late"
                                type="late"
                              />
                              <StatusButton
                                active={status === "absent"}
                                onClick={() => handleStatusChange(student.email, "absent")}
                                icon={<X size={15} />}
                                label="Absent"
                                type="absent"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
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
                      <p className="text-sm text-slate-300">{attendanceStats.total} students</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {attendanceStats.present} present · {attendanceStats.late} late · {attendanceStats.absent} absent
                      </p>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={saving}
                      className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 px-6 py-3 rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-500/10"
                    >
                      {saving ? (
                        <>
                          <Loader2 size={17} className="animate-spin" />
                          Saving Attendance...
                        </>
                      ) : (
                        <>
                          <Save size={17} />
                          Save Attendance
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {!selectedCourse && (
          <div className="bg-slate-900 border border-slate-800 border-dashed rounded-2xl py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-5">
              <ClipboardCheck size={28} className="text-indigo-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-200">Select a course to begin</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
              Choose one of your courses above to view the enrolled students and take today&apos;s attendance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function AttendanceStat({ label, value, icon, type = "default" }) {
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