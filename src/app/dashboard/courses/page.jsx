"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Search, PlayCircle } from "lucide-react";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchUserCourses() {
      try {
        const userRes = await fetch("/api/user", { credentials: "include" });
        if (!userRes.ok) return;
        const userData = await userRes.json();
        
        const userDept = userData?.department || "";
        const userSem = userData?.semester || "";

        const res = await fetch(`/api/courses?department=${userDept}&semester=${userSem}`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setCourses(Array.isArray(data) ? data : data.courses || []);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserCourses();
  }, []);

  const filteredCourses = courses.filter(
    (course) =>
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">My Courses</h1>
          <p className="text-slate-400 mt-1">
            Courses added by your department faculty members.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by course name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-slate-400 text-center py-12">Loading courses...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.length === 0 ? (
            <p className="text-slate-500 col-span-2 text-center py-12">
              No courses found for your department yet.
            </p>
          ) : (
            filteredCourses.map((course) => (
              <div
                key={course._id || course.id}
                className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 hover:border-indigo-500/50 transition flex flex-col justify-between space-y-6"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
                      {course.code || "N/A"}
                    </span>
                    <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {course.status || "Ongoing"}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mt-4">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Instructor:{" "}
                    <span className="text-slate-300">{course.instructor || "Not Assigned"}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Progress</span>
                    <span className="font-semibold text-white">
                      {course.progress || 0}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${course.progress || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <BookOpen size={15} className="text-indigo-400" />
                    <span>
                      Classes: {course.completedClasses || 0}/{course.totalClasses || 20}
                    </span>
                  </div>

                  <button 
                    onClick={() => router.push(`/dashboard/courses/${course._id || course.id}`)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition cursor-pointer"
                  >
                    <PlayCircle size={16} />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}