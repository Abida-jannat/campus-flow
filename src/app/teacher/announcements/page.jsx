"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Megaphone,
  RefreshCw,
  X,
  BookOpen,
  Clock,
  Send,
} from "lucide-react";
import toast from "react-hot-toast";

export default function TeacherAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  const [formData, setFormData] = useState({
    message: "",
    courseCode: "",
  });

    useEffect(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount pattern
    setIsMounted(true);
  }, []);

  
  async function loadAnnouncements() {
    try {
      setLoading(true);
      const res = await fetch("/api/teacher/announcements", {
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load announcements");
      }

      setAnnouncements(data.announcements || []);
    } catch (error) {
      console.error("Load announcements error:", error);
      toast.error(error.message || "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  }

  
  async function loadCourses() {
    try {
      setLoadingCourses(true);
      const res = await fetch("/api/teacher/courses", {
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load courses");
      }

      setCourses(data.courses || []);
    } catch (error) {
      console.error("Load courses error:", error);
      toast.error(error.message || "Failed to load courses");
    } finally {
      setLoadingCourses(false);
    }
  }

    useEffect(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount pattern
    loadAnnouncements();
    loadCourses();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setFormData({ message: "", courseCode: "" });
    setEditingId(null);
    setShowForm(false);
  }

  function handleCreate() {
    setFormData({
      message: "",
      courseCode: courses[0]?.courseCode || "",
    });
    setEditingId(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleEdit(announcement) {
    setFormData({
      message: announcement.message || "",
      courseCode: announcement.courseCode || "",
    });
    setEditingId(announcement._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.message.trim()) {
      toast.error("Please enter announcement message");
      return;
    }

    if (!formData.courseCode) {
      toast.error("Please select a course");
      return;
    }

    try {
      setSaving(true);
      const method = editingId ? "PUT" : "POST";
      const body = editingId
        ? { id: editingId, message: formData.message, courseCode: formData.courseCode }
        : { message: formData.message, courseCode: formData.courseCode };

      const res = await fetch("/api/teacher/announcements", {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Operation failed");
      }

      toast.success(
        editingId
          ? "Announcement updated successfully"
          : "Announcement published successfully"
      );

      resetForm();
      await loadAnnouncements();
    } catch (error) {
      console.error("Save announcement error:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  
  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this announcement?"
    );
    if (!confirmed) return;

    try {
      setDeleting(id);
      const res = await fetch(`/api/teacher/announcements?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete announcement");
      }

      toast.success("Announcement deleted successfully");
      setAnnouncements((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Delete announcement error:", error);
      toast.error(error.message || "Failed to delete announcement");
    } finally {
      setDeleting(null);
    }
  }

  function formatDate(date) {
    if (!date || !isMounted) return "";
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  if (loading && loadingCourses) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 size={22} className="animate-spin" />
          Loading announcements...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-8 lg:px-8">
        {/* HEADER */}
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/teacher"
              className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition"
            >
              ←
            </Link>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Megaphone size={23} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Announcements</h1>
              <p className="text-sm text-slate-400 mt-1">
                Share important updates with your students.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAnnouncements}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-300 hover:text-white hover:border-slate-700 transition disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              onClick={handleCreate}
              disabled={courses.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={17} />
              New Announcement
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Announcements</p>
                <p className="text-2xl font-bold mt-2">{announcements.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <Megaphone size={19} className="text-indigo-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Courses</p>
                <p className="text-2xl font-bold mt-2">{courses.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <BookOpen size={19} className="text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* NO COURSES */}
        {!loadingCourses && courses.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
            <BookOpen size={40} className="mx-auto text-slate-600 mb-4" />
            <h2 className="text-lg font-semibold">No courses available</h2>
            <p className="text-sm text-slate-500 mt-2">
              You need to create a course before publishing an announcement.
            </p>
            <Link
              href="/teacher/courses"
              className="inline-flex mt-5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold"
            >
              Go to My Courses
            </Link>
          </div>
        )}

        {/* FORM */}
        {showForm && courses.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mb-8">
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg">
                  {editingId ? "Edit Announcement" : "Create Announcement"}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  This announcement will be visible to students in the selected course.
                </p>
              </div>
              <button
                onClick={resetForm}
                className="w-9 h-9 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Course
                </label>
                <select
                  name="courseCode"
                  value={formData.courseCode}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition"
                >
                  <option value="">Select course</option>
                  {courses.map((course) => (
                    <option
                      key={course._id || course.courseCode}
                      value={course.courseCode}
                    >
                      {course.courseName} ({course.courseCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-300">
                    Announcement Message
                  </label>
                  <span className="text-xs text-slate-600">
                    {formData.message.length}/1000
                  </span>
                </div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  maxLength={1000}
                  rows={7}
                  placeholder="Write your announcement here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold transition disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      {editingId ? "Update Announcement" : "Publish Announcement"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ANNOUNCEMENT LIST */}
        <div className="space-y-4">
          {!loading && announcements.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl py-16 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 mx-auto flex items-center justify-center mb-4">
                <Megaphone size={25} className="text-slate-500" />
              </div>
              <h3 className="font-semibold text-lg">No announcements yet</h3>
              <p className="text-sm text-slate-500 mt-2">
                Create your first announcement to communicate with your students.
              </p>
              {courses.length > 0 && (
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold"
                >
                  <Plus size={16} />
                  Create Announcement
                </button>
              )}
            </div>
          )}

          {announcements.map((announcement) => (
            <div
              key={announcement._id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <Megaphone size={19} className="text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">Announcement</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <BookOpen size={13} />
                        {announcement.courseName || announcement.courseCode}
                      </span>
                      <span>{announcement.courseCode}</span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={13} />
                        {formatDate(announcement.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(announcement)}
                    className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
                    title="Edit announcement"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(announcement._id)}
                    disabled={deleting === announcement._id}
                    className="w-9 h-9 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition disabled:opacity-50"
                    title="Delete announcement"
                  >
                    {deleting === announcement._id ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-5 md:ml-15">
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                  <p className="text-sm text-slate-300 leading-7 whitespace-pre-wrap">
                    {announcement.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}