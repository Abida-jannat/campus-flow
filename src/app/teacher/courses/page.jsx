"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Loader2,
  X,
  GraduationCap,
  User,
  Building2,
  CalendarDays,
  CreditCard,
  Search,
  ArrowLeft,
  BookMarked,
} from "lucide-react";
import toast from "react-hot-toast";

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [teacher, setTeacher] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [deleteCourse, setDeleteCourse] = useState(null);

  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    courseCode: "",
    courseName: "",
    department: "",
    semester: "",
    credit: "",

  });

  // =========================================================
  // LOAD COURSES
  // =========================================================

  const loadCourses = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const res = await fetch("/api/teacher/courses", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load courses");
      }

      setCourses(data.courses || []);
      setTeacher(data.teacher || null);

      if (showRefresh) {
        toast.success("Courses refreshed");
      }
    } catch (error) {
      console.error("Load courses error:", error);
      toast.error(error.message || "Failed to load courses");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount pattern
    loadCourses();
  }, [loadCourses]);

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // OPEN ADD FORM
  // =========================================================

  const openAddForm = () => {
    setEditingCourse(null);

    setForm({
      courseCode: "",
      courseName: "",
      department: teacher?.department || "",
      semester: "",
     credit: "",
    });

    setShowForm(true);
  };

  // =========================================================
  // OPEN EDIT FORM
  // =========================================================

  const openEditForm = (course) => {
    setEditingCourse(course);

    setForm({
      courseCode: course.courseCode || "",
      courseName: course.courseName || "",
      department: course.department || "",
      semester: course.semester || "",
      credit: course.credit?.toString() || "",
    });

    setShowForm(true);
  };

  // =========================================================
  // CLOSE FORM
  // =========================================================

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingCourse(null);

    setForm({
      courseCode: "",
      courseName: "",
      department: "",
      semester: "",
      credit: "",
    });
  };

  // =========================================================
  // SUBMIT ADD / EDIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.courseCode.trim() ||
      !form.courseName.trim() ||
      !form.department ||
      !form.semester ||
      !form.credit
    ) {
      toast.error("Please fill in all course fields");
      return;
    }

    if (Number(form.credit) <= 0) {
      toast.error("Credit must be greater than 0");
      return;
    }

    setSaving(true);

    try {
      const isEditing = Boolean(editingCourse);

      const body = {
        courseCode: form.courseCode.trim(),
        courseName: form.courseName.trim(),
        department: form.department,
        semester: form.semester,
        credit: Number(form.credit),
      };

      if (isEditing) {
        body.id = editingCourse._id;
      }

      const res = await fetch("/api/teacher/courses", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Operation failed");
      }

      if (isEditing) {
        toast.success("Course updated successfully");
      } else {
        toast.success("Course added successfully");
      }

      closeForm();

      await loadCourses();
    } catch (error) {
      console.error("Save course error:", error);
      toast.error(error.message || "Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE COURSE
  // =========================================================

  const handleDelete = async () => {
    if (!deleteCourse?._id) return;

    setDeleting(true);

    try {
      const res = await fetch(
        `/api/teacher/courses?id=${deleteCourse._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete course");
      }
      toast.success("Course deleted successfully");

      setDeleteCourse(null);

      await loadCourses();
    } catch (error) {
      console.error("Delete course error:", error);
      toast.error(error.message || "Failed to delete course");
    } finally {
      setDeleting(false);
    }
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredCourses = courses.filter((course) => {
    const searchText = search.toLowerCase();

    return (
      course.courseCode?.toLowerCase().includes(searchText) ||
      course.courseName?.toLowerCase().includes(searchText) ||
      course.department?.toLowerCase().includes(searchText) ||
      course.semester?.toLowerCase().includes(searchText)
    );
  });

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
            <Loader2
              size={24}
              className="text-indigo-400 animate-spin"
            />
          </div>

          <p className="text-slate-400 text-sm">
            Loading your courses...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-5 py-8 lg:px-8">

        {/* =====================================================
            TOP NAVIGATION
        ===================================================== */}

        <div className="flex items-center justify-between mb-8">

          <Link
            href="/teacher"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <button
            onClick={() => loadCourses(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-800 bg-slate-900 text-sm text-slate-300 hover:text-white hover:border-slate-700 transition disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">

          <div>

            <div className="flex items-center gap-4 mb-4">

              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <BookOpen
                  size={27}
                  className="text-indigo-400"
                />
              </div>

              <div>
                <p className="text-sm text-indigo-400 font-medium">
                  Teacher Portal
                </p>

                <h1 className="text-3xl lg:text-4xl font-bold">
                  My Courses
                </h1>
              </div>

            </div>

            <p className="text-slate-400 max-w-2xl">
              Manage the courses assigned to you. You can add new
              courses, update course information, or remove courses
              you no longer teach.
            </p>

          </div>

          <button
            onClick={openAddForm}
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-5 py-3 rounded-xl font-semibold transition shadow-lg shadow-indigo-600/10"
          >
            <Plus size={18} />
            Add Course
          </button>

        </div>

        {/* =====================================================
            TEACHER INFO
        ===================================================== */}

        {teacher && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6">

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">

              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                {teacher.image ? (
                  <img
                    src={teacher.image}
                    alt={teacher.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                ) : (
                  <User
                    size={22}
                    className="text-indigo-400"
                  />
                )}
              </div>

              <div className="flex-1">

                <p className="font-semibold text-white">
                  {teacher.name}
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-1">

                  <span className="text-sm text-slate-400 flex items-center gap-1.5">
                    <Building2 size={14} />
                    {teacher.department || "Department not specified"}
                  </span>

                  <span className="text-slate-700">
                    •
                  </span>

                  <span className="text-sm text-slate-400">
                    {courses.length}{" "}
                    {courses.length === 1 ? "Course" : "Courses"}
                  </span>

                </div>

              </div>

              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs text-emerald-400 font-medium">
                  Active Faculty
                </span>
              </div>

            </div>

          </div>
        )}

        {/* =====================================================
            SEARCH
        ===================================================== */}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">

          <div>
            <h2 className="text-xl font-bold">
              Course List
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              {courses.length} total{" "}
              {courses.length === 1 ? "course" : "courses"}
            </p>
          </div>

          <div className="relative w-full md:w-80">

            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-indigo-500 transition"
            />

          </div>

        </div>

        {/* =====================================================
            EMPTY STATE
        ===================================================== */}

        {filteredCourses.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl py-16 px-6 text-center">

            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center mb-5">
              {search ? (
                <Search
                  size={28}
                  className="text-slate-500"
                />
              ) : (
                <BookMarked
                  size={28}
                  className="text-slate-500"
                />
              )}
            </div>

            <h3 className="text-lg font-semibold mb-2">
              {search
                ? "No courses found"
                : "No courses yet"}
            </h3>

            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
              {search
                ? "Try searching with a different course name, code, department, or semester."
                : "Start by adding your first course to your teaching list."}
            </p>

            {!search && (
              <button
                onClick={openAddForm}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 rounded-xl text-sm font-semibold transition"
              >
                <Plus size={17} />
                Add Your First Course
              </button>
            )}

          </div>
        )}

        {/* =====================================================
            COURSE GRID
        ===================================================== */}

        {filteredCourses.length > 0 && (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">

            {filteredCourses.map((course) => (
              <div
                key={course._id}
                className="group bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition"
              >

                {/* Card Header */}

                <div className="flex items-start justify-between gap-3">

                  <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <GraduationCap
                      size={21}
                      className="text-indigo-400"
                    />
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-semibold">
                    {course.courseCode}
                  </span>

                </div>

                {/* Course Name */}

                <div className="mt-5">

                  <h3 className="text-lg font-semibold text-white leading-snug">
                    {course.courseName}
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    {course.department}
                  </p>

                </div>

                {/* Details */}

                <div className="grid grid-cols-2 gap-3 mt-5">

                  <div className="bg-slate-800/50 rounded-xl p-3">

                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <CalendarDays size={14} />
                      <span className="text-xs">
                        Semester
                      </span>
                    </div>

                    <p className="text-sm font-medium text-slate-200">
                      {course.semester}
                    </p>

                  </div>

                  <div className="bg-slate-800/50 rounded-xl p-3">

                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <CreditCard size={14} />
                      <span className="text-xs">
                        Credit
                      </span>
                    </div>

                    <p className="text-sm font-medium text-slate-200">
                      {course.credit}
                    </p>

                  </div>

                </div>

                {/* Actions */}

                <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-800">

                  <button
                    onClick={() => openEditForm(course)}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-2.5 rounded-xl text-sm font-medium transition"
                  >
                    <Pencil size={15} />
                    Edit
                  </button>

                  <button
                    onClick={() => setDeleteCourse(course)}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/10 text-red-400 px-3 py-2.5 rounded-xl text-sm font-medium transition"
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>

      {/* =======================================================
          ADD / EDIT MODAL
      ======================================================= */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeForm}
          />

          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">

            {/* Modal Header */}

            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  {editingCourse ? (
                    <Pencil
                      size={19}
                      className="text-indigo-400"
                    />
                  ) : (
                    <Plus
                      size={20}
                      className="text-indigo-400"
                    />
                  )}
                </div>

                <div>

                  <h2 className="font-bold text-lg">
                    {editingCourse
                      ? "Edit Course"
                      : "Add New Course"}
                  </h2>

                  <p className="text-xs text-slate-500 mt-0.5">
                    {editingCourse
                      ? "Update course information"
                      : "Add a course to your teaching list"}
                  </p>

                </div>

              </div>

              <button
                onClick={closeForm}
                disabled={saving}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition disabled:opacity-50"
              >
                <X size={18} />
              </button>

            </div>

            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5"
            >

              {/* Course Code + Credit */}

              <div className="grid sm:grid-cols-2 gap-4">

                <div>

                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Course Code
                  </label>

                  <input
                    type="text"
                    name="courseCode"
                    value={form.courseCode}
                    onChange={handleChange}
                    placeholder="e.g. CSE-324"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-indigo-500 transition"
                    required
                  />

                </div>

                <div>

                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Credit
                  </label>

                  <input
                    type="number"
                    name="credit"
                    value={form.credit}
                    onChange={handleChange}
                    placeholder="e.g. 3"
                    min="1"
                    step="0.5"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-indigo-500 transition"
                    required
                  />

                </div>

              </div>

              {/* Course Name */}

              <div>

                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Course Name
                </label>

                <input
                  type="text"
                  name="courseName"
                  value={form.courseName}
                  onChange={handleChange}
                  placeholder="e.g. Database Management Systems"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-indigo-500 transition"
                  required
                />

              </div>

              {/* Department */}

              <div>

                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Department
                </label>

                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition"
                  required
                >

                  <option value="">
                    Select Department
                  </option>

                  <option value="CSE">
                    Computer Science & Engineering
                  </option>

                  <option value="EEE">
                    Electrical & Electronic Engineering
                  </option>

                  <option value="BBA">
                    Business Administration
                  </option>

                  <option value="Data Science">
                    Data Science
                  </option>

                  <option value="Civil">
                    Civil Engineering
                  </option>

                  <option value="English">
                    English
                  </option>

                </select>

              </div>

              {/* Semester */}

              <div>

                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Semester
                </label>

                <select
                  name="semester"
                  value={form.semester}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition"
                  required
                >

                  <option value="">
                    Select Semester
                  </option>

                  <option value="Spring 2026">
                    Spring 2026
                  </option>

                  <option value="Summer 2026">
                    Summer 2026
                  </option>

                  <option value="Fall 2026">
                    Fall 2026
                  </option>

                  <option value="Spring 2027">
                    Spring 2027
                  </option>

                </select>

              </div>

              {/* Buttons */}

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3 rounded-xl font-semibold transition disabled:opacity-50"
                >

                  {saving ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingCourse ? (
                        <Pencil size={17} />
                      ) : (
                        <Plus size={17} />
                      )}

                      {editingCourse
                        ? "Update Course"
                        : "Add Course"}
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =======================================================
          DELETE CONFIRMATION MODAL
      ======================================================= */}

      {deleteCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteCourse(null)}
          />

          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6">

            <div className="flex items-center gap-4 mb-5">

              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <Trash2
                  size={22}
                  className="text-red-400"
                />
              </div>

              <div>

                <h2 className="text-lg font-bold">
                  Delete Course?
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  This action cannot be undone.
                </p>

              </div>

            </div>

            <div className="bg-slate-800/60 border border-slate-800 rounded-2xl p-4 mb-6">

              <p className="text-xs text-slate-500 mb-1">
                Course
              </p>

              <p className="font-semibold text-white">
                {deleteCourse.courseName}
              </p>

              <div className="flex items-center gap-2 mt-1">

                <span className="text-sm text-indigo-400 font-medium">
                  {deleteCourse.courseCode}
                </span>

                <span className="text-slate-600">
                  •
                </span>

                <span className="text-sm text-slate-500">
                  {deleteCourse.semester}
                </span>

              </div>

            </div>

            <div className="flex gap-3">

              <button
                onClick={() => setDeleteCourse(null)}
                disabled={deleting}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-3 rounded-xl font-semibold transition disabled:opacity-50"
              >

                {deleting ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={17} />
                    Delete
                  </>
                )}

              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}