"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  MapPin,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  X,
  ArrowLeft,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TeacherSchedulePage() {
  const [schedule, setSchedule] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    courseCode: "",
    days: [], // array — multiple days when adding, single item when editing
    startTime: "",
    endTime: "",
    building: "",
    floor: "",
    room: "",
    type: "Theory",
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [scheduleRes, coursesRes] = await Promise.all([
        fetch("/api/teacher/schedule", { credentials: "include" }),
        fetch("/api/teacher/courses", { credentials: "include" }),
      ]);

      const scheduleData = await scheduleRes.json();
      const coursesData = await coursesRes.json();

      if (!scheduleRes.ok || !scheduleData.success) {
        throw new Error(scheduleData.message || "Failed to load schedule");
      }

      setSchedule(scheduleData.schedule || []);
      setCourses(coursesData.courses || []);
    } catch (err) {
      console.error("Load schedule error:", err);
      toast.error(err.message || "Failed to load schedule");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount pattern
    loadData();
  }, [loadData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Clicking a day: in ADD mode, toggles it in/out of the array (checkbox
  // behavior). In EDIT mode, replaces the selection with just that one day
  // (radio behavior) — since an existing entry is always a single session.
  const handleDayClick = (day) => {
    if (editingEntry) {
      setForm((prev) => ({ ...prev, days: [day] }));
    } else {
      setForm((prev) => ({
        ...prev,
        days: prev.days.includes(day)
          ? prev.days.filter((d) => d !== day)
          : [...prev.days, day],
      }));
    }
  };

  const openAddForm = () => {
    setEditingEntry(null);
    setForm({
      courseCode: courses[0]?.courseCode || "",
      days: [],
      startTime: "",
      endTime: "",
      building: "",
      floor: "",
      room: "",
      type: "Theory",
    });
    setShowForm(true);
  };

  const openEditForm = (entry) => {
    setEditingEntry(entry);
    setForm({
      courseCode: entry.courseCode,
      days: [entry.day],
      startTime: entry.startTime,
      endTime: entry.endTime,
      building: entry.building,
      floor: entry.floor || "",
      room: entry.room,
      type: entry.type || "Theory",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return; // guards against double-click / double-submit

    if (form.days.length === 0) {
      toast.error("Please select at least one day");
      return;
    }

    setSubmitting(true);
    try {
      const method = editingEntry ? "PUT" : "POST";

      const body = editingEntry
        ? {
            id: editingEntry._id,
            day: form.days[0], // PUT still expects a single "day"
            startTime: form.startTime,
            endTime: form.endTime,
            building: form.building,
            floor: form.floor,
            room: form.room,
            type: form.type,
          }
        : {
            courseCode: form.courseCode,
            days: form.days, // POST accepts the full array
            startTime: form.startTime,
            endTime: form.endTime,
            building: form.building,
            floor: form.floor,
            room: form.room,
            type: form.type,
          };

      const res = await fetch("/api/teacher/schedule", {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Operation failed");
      }

      setShowForm(false);
      setEditingEntry(null);
      await loadData();

      toast.success(data.message || (editingEntry ? "Class updated" : "Class added to schedule"));
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (entry) => {
    const confirmed = window.confirm(
      `Remove ${entry.courseCode} on ${entry.day} (${entry.startTime}-${entry.endTime})?`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/teacher/schedule?id=${entry._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete");
      }

      await loadData();
      toast.success("Class removed from schedule");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to delete class");
    }
  };

  const scheduleByDay = days.reduce((acc, day) => {
    acc[day] = schedule.filter((s) => s.day === day);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="animate-spin" size={22} />
          Loading your schedule...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">

        <Link
          href="/teacher"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white transition mb-4"
        >
          <ArrowLeft size={15} />
          Back to Dashboard
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <CalendarDays size={22} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Class Schedule</h1>
              <p className="text-sm text-slate-400">Manage your weekly teaching schedule</p>
            </div>
          </div>

          <button
            onClick={openAddForm}
            disabled={courses.length === 0}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 px-5 py-3 rounded-xl font-semibold transition"
          >
            <Plus size={18} />
            Add Class
          </button>
        </div>

        {courses.length === 0 && (
          <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 mb-6">
            <p className="text-sm text-slate-400">
              You need at least one course before adding a class schedule.
            </p>
            <Link href="/teacher/courses" className="inline-block text-sm text-indigo-400 hover:text-indigo-300 mt-1">
              Go to My Courses →
            </Link>
          </div>
        )}

        {schedule.length === 0 && courses.length > 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
            <CalendarDays size={45} className="mx-auto text-slate-600 mb-4" />
            <h2 className="text-xl font-semibold">No classes scheduled</h2>
            <p className="text-slate-500 mt-2">Add your first class session to get started.</p>
            <button
              onClick={openAddForm}
              className="mt-6 bg-indigo-600 hover:bg-indigo-500 px-5 py-3 rounded-xl font-semibold"
            >
              Add Your First Class
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {days
              .filter((day) => scheduleByDay[day]?.length > 0)
              .map((day) => (
                <div key={day}>
                  <h3 className="text-sm font-semibold uppercase text-slate-500 mb-3">{day}</h3>
                  <div className="space-y-3">
                    {scheduleByDay[day].map((entry) => (
                      <div
                        key={entry._id}
                        className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-500/40 transition"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-lg">
                              {entry.courseCode}
                            </span>
                            <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-lg">
                              {entry.type}
                            </span>
                          </div>
                          <p className="font-semibold">{entry.courseName}</p>

                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <Clock size={14} />
                              {entry.startTime} - {entry.endTime}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin size={14} />
                              {entry.building}
                              {entry.floor ? `, Floor ${entry.floor}` : ""} · Room {entry.room}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 self-end sm:self-center">
                          <button
                            onClick={() => openEditForm(entry)}
                            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-indigo-600 flex items-center justify-center transition"
                            title="Edit class"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(entry)}
                            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-red-600 flex items-center justify-center transition"
                            title="Delete class"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">{editingEntry ? "Edit Class" : "Add Class"}</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {editingEntry ? "Update this class session" : "Select all days this class meets"}
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <select
                name="courseCode"
                value={form.courseCode}
                onChange={handleChange}
                disabled={!!editingEntry}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 disabled:opacity-60"
              >
                {courses.map((c) => (
                  <option key={c.courseCode} value={c.courseCode}>
                    {c.courseName} ({c.courseCode})
                  </option>
                ))}
              </select>

              {/* DAY SELECTION — checkboxes when adding, single-select when editing */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {editingEntry ? "Day" : "Days (select one or more)"}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {days.map((d) => {
                    const isSelected = form.days.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => handleDayClick(d)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition ${
                          isSelected
                            ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-300"
                            : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                        }`}
                      >
                        {d}
                        {isSelected && <Check size={14} />}
                      </button>
                    );
                  })}
                </div>
                {!editingEntry && form.days.length > 1 && (
                  <p className="text-xs text-slate-500 mt-2">
                    This will create {form.days.length} separate class entries, one per day.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  name="startTime"
                  type="time"
                  value={form.startTime}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500"
                />
                <input
                  name="endTime"
                  type="time"
                  value={form.endTime}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <input
                name="building"
                value={form.building}
                onChange={handleChange}
                placeholder="Building (e.g. Academic Building)"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  name="floor"
                  value={form.floor}
                  onChange={handleChange}
                  placeholder="Floor (optional)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500"
                />
                <input
                  name="room"
                  value={form.room}
                  onChange={handleChange}
                  placeholder="Room"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500"
              >
                <option value="Theory">Theory</option>
                <option value="Lab">Lab</option>
              </select>

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
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-3 rounded-xl font-semibold"
                >
                  {submitting ? "Saving..." : editingEntry ? "Update Class" : "Add Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}