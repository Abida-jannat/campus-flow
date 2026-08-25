"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Users, Loader2, Search, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/teacher/students", { credentials: "include" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load students");
      }

      setStudents(data.students || []);
    } catch (err) {
      console.error("Load students error:", err);
      toast.error(err.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount pattern
    loadStudents();
  }, [loadStudents]);

  const filteredStudents = students.filter((s) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      s.name?.toLowerCase().includes(query) ||
      s.email?.toLowerCase().includes(query) ||
      s.studentId?.toLowerCase().includes(query)
    );
  });

  const getInitials = (name = "") =>
    name.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "ST";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="animate-spin" size={22} />
          Loading students...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">

        <Link
          href="/teacher"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white transition mb-4"
        >
          <ArrowLeft size={15} />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <Users size={22} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Students</h1>
            <p className="text-sm text-slate-400">
              {students.length} student{students.length !== 1 ? "s" : ""} across your courses
            </p>
          </div>
        </div>

        <div className="relative mb-6">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or student ID..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 outline-none focus:border-indigo-500 transition"
          />
        </div>

        {students.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
            <Users size={45} className="mx-auto text-slate-600 mb-4" />
            <h2 className="text-xl font-semibold">No students yet</h2>
            <p className="text-slate-500 mt-2">
              Students will appear here once you have courses matching their department and semester.
            </p>
            <Link
              href="/teacher/courses"
              className="inline-block mt-6 bg-indigo-600 hover:bg-indigo-500 px-5 py-3 rounded-xl font-semibold"
            >
              Go to My Courses
            </Link>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
            <Search size={32} className="mx-auto text-slate-600 mb-3" />
            <p className="text-slate-400">No students match your search.</p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800 overflow-hidden">
            {filteredStudents.map((student) => (
              <div
                key={student.email}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-800/30 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center text-indigo-300 text-xs font-semibold shrink-0">
                    {getInitials(student.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{student.name}</p>
                    <p className="text-xs text-slate-500 truncate">{student.email}</p>
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-1.5 max-w-[45%]">
                  {student.courses?.map((c) => (
                    <span
                      key={c.courseCode}
                      className="text-xs bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-lg whitespace-nowrap"
                    >
                      {c.courseCode}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    );
    
}