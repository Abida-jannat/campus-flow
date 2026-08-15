"use client";
 
import { useEffect, useState, useCallback } from "react";
import {
  BookOpen,
  Users,
  CalendarDays,
  Clock,
  MapPin,
  Pencil,
  Trash2,
  Plus,
  GraduationCap,
  Loader2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
 
export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [teacher, setTeacher] = useState(null);
 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
 
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
 
  const [form, setForm] = useState({
    courseCode: "",
    courseName: "",
    department: "",
    semester: "",
    credit: "",
    type: "Theory",
  });
 
  // ==========================================
  // GET COURSES
  // ==========================================
 
  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
 
      const res = await fetch("/api/teacher/courses", {
        credentials: "include",
      });
 
      const data = await res.json();
 
      if (!res.ok) {
        throw new Error(data.message || "Failed to load courses");
      }
 
      setCourses(data.courses || []);
      setTeacher(data.teacher || null);
    } catch (err) {
      console.error("Load courses error:", err);
      setError(err.message || "Failed to load courses");
      toast.error(err.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, []);
 
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount pattern; loadCourses sets loading/error synchronously before its await, which is safe and intentional here
    loadCourses();
  }, [loadCourses]);
 

  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================================
  // OPEN ADD FORM
  // ==========================================

  const openAddForm = () => {
    setEditingCourse(null);

    setForm({
      courseCode: "",
      courseName: "",
      department: teacher?.department || "",
      semester: "Spring 2026",
      credit: "",
      type: "Theory",
    });

    setShowForm(true);
  };

  // ==========================================
  // OPEN EDIT FORM
  // ==========================================

  const openEditForm = (course) => {
    setEditingCourse(course);

    setForm({
      courseCode: course.courseCode || "",
      courseName: course.courseName || "",
      department: course.department || "",
      semester: course.semester || "",
      credit: course.credit || "",
      type: course.type || "Theory",
    });

    setShowForm(true);
  };

  // ==========================================
  // CREATE / UPDATE
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const method = editingCourse ? "PUT" : "POST";

      // FIX: the PUT route reads `id` from the body, not `courseId`.
      // Sending the wrong key meant every edit failed with
      // "Course ID is required".
      const body = editingCourse
        ? {
            id: editingCourse._id,
            ...form,
          }
        : {
            ...form,
          };

      const res = await fetch("/api/teacher/courses", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Operation failed");
      }

      setShowForm(false);
      setEditingCourse(null);

      await loadCourses();

      toast.success(
        editingCourse
          ? "Course updated successfully"
          : "Course created successfully"
      );
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong");
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (course) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${course.courseCode} - ${course.courseName}?`
    );

    if (!confirmed) return;

    try {
      // FIX: the DELETE route reads `id` from the URL query string
      // (searchParams), not from the request body. The body was being
      // silently ignored, so delete always failed with
      // "Course ID is required".
      const res = await fetch(
        `/api/teacher/courses?id=${course._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete course");
      }

      await loadCourses();

      toast.success("Course deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to delete course");
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="animate-spin" size={22} />
          Loading your courses...
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

          <div>

            <Link
              href="/teacher"
              className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition mb-3"
            >
              ← Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <BookOpen
                  size={22}
                  className="text-indigo-400"
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  My Courses
                </h1>

                <p className="text-sm text-slate-400">
                  Manage your assigned courses and schedules
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={openAddForm}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-5 py-3 rounded-xl font-semibold transition"
          >
            <Plus size={18} />
            Add Course
          </button>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4">
            {error}
          </div>
        )}

        {/* TEACHER INFO */}

        {teacher && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-8 flex items-center gap-4">

            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center overflow-hidden">

              {teacher.image ? (
                <img
                  src={teacher.image}
                  alt={teacher.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <GraduationCap size={22} />
              )}

            </div>

            <div>
              <p className="font-semibold">
                {teacher.name}
              </p>

              <p className="text-sm text-slate-400">
                {teacher.department} Department
              </p>
            </div>

          </div>
        )}

        {/* EMPTY */}

        {courses.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">

            <BookOpen
              size={45}
              className="mx-auto text-slate-600 mb-4"
            />

            <h2 className="text-xl font-semibold">
              No courses found
            </h2>

            <p className="text-slate-500 mt-2">
              You currently dont have any courses assigned.
            </p>

            <button
              onClick={openAddForm}
              className="mt-6 bg-indigo-600 hover:bg-indigo-500 px-5 py-3 rounded-xl font-semibold"
            >
              Add Your First Course
            </button>

          </div>
        ) : (

          /* COURSE GRID */

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

            {courses.map((course) => (

              <div
                key={course._id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/40 transition"
              >

                {/* COURSE HEADER */}

                <div className="flex justify-between gap-3">

                  <div>

                    <span className="inline-block text-xs font-semibold bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-lg">
                      {course.courseCode}
                    </span>

                    <h2 className="text-xl font-semibold mt-3">
                      {course.courseName}
                    </h2>

                  </div>

                  <div className="flex gap-1">

                    <button
                      onClick={() => openEditForm(course)}
                      className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-indigo-600 flex items-center justify-center transition"
                      title="Edit course"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => handleDelete(course)}
                      className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-red-600 flex items-center justify-center transition"
                      title="Delete course"
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>

                </div>

                {/* COURSE INFO */}

                <div className="mt-5 space-y-3">

                  <div className="flex justify-between text-sm">

                    <span className="text-slate-500">
                      Department
                    </span>

                    <span className="text-slate-300">
                      {course.department}
                    </span>

                  </div>

                  <div className="flex justify-between text-sm">

                    <span className="text-slate-500">
                      Semester
                    </span>

                    <span className="text-slate-300">
                      {course.semester}
                    </span>

                  </div>

                  <div className="flex justify-between text-sm">

                    <span className="text-slate-500">
                      Credit
                    </span>

                    <span className="text-slate-300">
                      {course.credit || "-"}
                    </span>

                  </div>

                  <div className="flex justify-between text-sm">

                    <span className="text-slate-500">
                      Type
                    </span>

                    <span className="text-slate-300">
                      {course.type || "Theory"}
                    </span>

                  </div>

                </div>

                {/* STUDENTS */}

                <div className="mt-5 pt-5 border-t border-slate-800">

                  <div className="flex items-center gap-2 text-slate-400 text-sm">

                    <Users size={16} />

                    <span>
                      {course.studentCount || 0} Students
                    </span>

                  </div>

                </div>

                {/* SCHEDULE */}

                {course.schedules?.length > 0 && (

                  <div className="mt-5">

                    <p className="text-xs uppercase text-slate-500 mb-3">
                      Schedule
                    </p>

                    <div className="space-y-3">

                      {course.schedules.map((schedule, index) => (

                        <div
                          key={index}
                          className="bg-slate-800/60 rounded-xl p-3"
                        >

                          <div className="flex items-center gap-2 text-sm">

                            <CalendarDays
                              size={15}
                              className="text-indigo-400"
                            />

                            <span className="text-slate-300">
                              {schedule.day}
                            </span>

                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">

                            <Clock size={14} />

                            {schedule.startTime} -{" "}
                            {schedule.endTime}

                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">

                            <MapPin size={14} />

                            {schedule.building} · Floor{" "}
                            {schedule.floor} · Room{" "}
                            {schedule.room}

                          </div>

                        </div>

                      ))}

                    </div>

                  </div>

                )}

              </div>

            ))}

          </div>
        )}

      </div>

      {/* ======================================
          ADD / EDIT MODAL
      ====================================== */}

      {showForm && (

        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">

          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <div className="flex items-center justify-between mb-6">

              <div>
                <h2 className="text-xl font-bold">
                  {editingCourse
                    ? "Edit Course"
                    : "Add Course"}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Enter course information
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center"
              >
                <X size={18} />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              {/* COURSE CODE */}

              <input
                name="courseCode"
                value={form.courseCode}
                onChange={handleChange}
                placeholder="Course Code"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500"
              />

              {/* COURSE NAME */}

              <input
                name="courseName"
                value={form.courseName}
                onChange={handleChange}
                placeholder="Course Name"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500"
              />

              {/* DEPARTMENT */}

              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="Department"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500"
              />

              {/* SEMESTER */}

              <input
                name="semester"
                value={form.semester}
                onChange={handleChange}
                placeholder="Semester"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500"
              />

              {/* CREDIT */}

              <input
                name="credit"
                type="number"
                value={form.credit}
                onChange={handleChange}
                placeholder="Credit"
                min="1"
                max="6"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500"
              />

              {/* TYPE */}

              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500"
              >

                <option value="Theory">
                  Theory
                </option>

                <option value="Lab">
                  Lab
                </option>

              </select>

              {/* BUTTONS */}

              <div className="flex gap-3 pt-4">

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-semibold"
                >
                  {editingCourse
                    ? "Update Course"
                    : "Create Course"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}