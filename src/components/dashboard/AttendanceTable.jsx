"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock3,
  CalendarCheck,
  RefreshCw,
} from "lucide-react";

export default function AttendanceTable() {
  const [attendance, setAttendance] = useState([]);
  const [overall, setOverall] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // =========================
  // LOAD ATTENDANCE
  // =========================

  const loadAttendance = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const res = await fetch("/api/student/attendance", {
        credentials: "include",
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load attendance"
        );
      }

      // IMPORTANT:
      // API now returns course summaries inside "courses"
      setAttendance(data.courses || []);

      setOverall(data.overall || null);
    } catch (error) {
      console.error("Failed to load attendance:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================
  // LOAD ON PAGE OPEN
  // =========================

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing selection is a safe, intentional reset
    loadAttendance();
  }, []);


  const getColor = (percentage) => {
    if (percentage >= 75) {
      return "text-emerald-400";
    }

    if (percentage >= 60) {
      return "text-amber-400";
    }

    return "text-red-400";
  };



  const getProgressColor = (percentage) => {
    if (percentage >= 75) {
      return "bg-emerald-500";
    }

    if (percentage >= 60) {
      return "bg-amber-500";
    }

    return "bg-red-500";
  };



  if (loading) {
    return (
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6">
        <div className="flex items-center justify-center gap-3 py-12 text-slate-400">
          <Loader2
            size={20}
            className="animate-spin"
          />

          <span className="text-sm">
            Loading attendance...
          </span>
        </div>
      </div>
    );
  }


 return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6">


      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <CalendarCheck
              size={20}
              className="text-indigo-400"
            />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">
              Attendance
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              Your attendance by course
            </p>
          </div>

        </div>

        <div className="flex items-center gap-3">

          {/* OVERALL */}

          {overall && (
            <div className="text-right">

              <p className="text-xs text-slate-500">
                Overall Attendance
              </p>

              <p
                className={`text-lg font-bold ${getColor(
                  overall.percentage
                )}`}
              >
                {overall.percentage}%
              </p>

            </div>
          )}

          {/* REFRESH */}

          <button
            type="button"
            onClick={() => loadAttendance(true)}
            disabled={refreshing}
            className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition disabled:opacity-50"
            title="Refresh attendance"
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />
          </button>

        </div>

      </div>



      {overall && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">

          {/* PRESENT */}

          <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-4">

            <div className="flex items-center gap-2 mb-2">

              <CheckCircle2
                size={16}
                className="text-emerald-400"
              />

              <span className="text-xs text-slate-500">
                Present
              </span>

            </div>

            <p className="text-xl font-bold text-white">
              {overall.present}
            </p>

          </div>

          {/* ABSENT */}

          <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-4">

            <div className="flex items-center gap-2 mb-2">

              <XCircle
                size={16}
                className="text-red-400"
              />

              <span className="text-xs text-slate-500">
                Absent
              </span>

            </div>

            <p className="text-xl font-bold text-white">
              {overall.absent}
            </p>

          </div>

          {/* LATE */}

          <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-4">

            <div className="flex items-center gap-2 mb-2">

              <Clock3
                size={16}
                className="text-amber-400"
              />

              <span className="text-xs text-slate-500">
                Late
              </span>

            </div>

            <p className="text-xl font-bold text-white">
              {overall.late}
            </p>

          </div>

          {/* TOTAL */}

          <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-4">

            <div className="flex items-center gap-2 mb-2">

              <CalendarCheck
                size={16}
                className="text-indigo-400"
              />

              <span className="text-xs text-slate-500">
                Total Classes
              </span>

            </div>

            <p className="text-xl font-bold text-white">
              {overall.total}
            </p>

          </div>

        </div>
      )}

      {/* =========================
          NO RECORDS
      ========================= */}

      {attendance.length === 0 && (
        <div className="text-center py-12">

          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center mb-4">

            <CalendarCheck
              size={25}
              className="text-slate-600"
            />

          </div>

          <h3 className="text-sm font-semibold text-slate-300">
            No attendance records
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            Your attendance will appear here after your teacher records it.
          </p>

        </div>
      )}



      {attendance.length > 0 && (
        <div className="hidden md:block overflow-hidden rounded-xl border border-slate-800">

          <table className="w-full">

            <thead>

              <tr className="bg-slate-800/60 text-xs text-slate-400">

                <th className="text-left px-5 py-4 font-medium">
                  Course
                </th>

                <th className="text-center px-4 py-4 font-medium">
                  Present
                </th>

                <th className="text-center px-4 py-4 font-medium">
                  Absent
                </th>

                <th className="text-center px-4 py-4 font-medium">
                  Late
                </th>

                <th className="text-center px-4 py-4 font-medium">
                  Total
                </th>

                <th className="text-right px-5 py-4 font-medium">
                  Attendance
                </th>

              </tr>

            </thead>

            <tbody>

              {attendance.map((item) => (

                <tr
                  key={item.courseCode}
                  className="border-t border-slate-800 hover:bg-slate-800/30 transition"
                >

                  {/* COURSE */}

                  <td className="px-5 py-4">

                    <div>

                      <p className="text-sm font-semibold text-white">
                        {item.courseName ||
                          item.courseCode}
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        {item.courseCode}
                      </p>

                    </div>

                  </td>

                  {/* PRESENT */}

                  <td className="text-center px-4 py-4">

                    <span className="text-sm font-semibold text-emerald-400">
                      {item.present}
                    </span>

                  </td>

                  {/* ABSENT */}

                  <td className="text-center px-4 py-4">

                    <span className="text-sm font-semibold text-red-400">
                      {item.absent}
                    </span>

                  </td>

                  {/* LATE */}

                  <td className="text-center px-4 py-4">

                    <span className="text-sm font-semibold text-amber-400">
                      {item.late}
                    </span>

                  </td>

                  {/* TOTAL */}

                  <td className="text-center px-4 py-4">

                    <span className="text-sm text-slate-300">
                      {item.total}
                    </span>

                  </td>

                  {/* PERCENTAGE */}

                  <td className="px-5 py-4">

                    <div className="flex flex-col items-end gap-2">

                      <span
                        className={`text-sm font-bold ${getColor(
                          item.percentage
                        )}`}
                      >
                        {item.percentage}%
                      </span>

                      <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">

                        <div
                          className={`h-full rounded-full ${getProgressColor(
                            item.percentage
                          )}`}
                          style={{
                            width: `${Math.min(
                              item.percentage,
                              100
                            )}%`,
                          }}
                        />

                      </div>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>
      )}



      {attendance.length > 0 && (
        <div className="md:hidden space-y-3">

          {attendance.map((item) => (

            <div
              key={item.courseCode}
              className="bg-slate-800/50 border border-slate-800 rounded-xl p-4"
            >

              {/* COURSE HEADER */}

              <div className="flex items-start justify-between gap-3 mb-4">

                <div>

                  <p className="text-sm font-semibold text-white">
                    {item.courseName ||
                      item.courseCode}
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    {item.courseCode}
                  </p>

                </div>

                <span
                  className={`text-sm font-bold ${getColor(
                    item.percentage
                  )}`}
                >
                  {item.percentage}%
                </span>

              </div>

              {/* PROGRESS */}

              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mb-4">

                <div
                  className={`h-full rounded-full ${getProgressColor(
                    item.percentage
                  )}`}
                  style={{
                    width: `${Math.min(
                      item.percentage,
                      100
                    )}%`,
                  }}
                />

              </div>

              {/* STATS */}

              <div className="grid grid-cols-4 gap-2">

                <div className="text-center">

                  <p className="text-xs text-slate-500">
                    Present
                  </p>

                  <p className="text-sm font-semibold text-emerald-400 mt-1">
                    {item.present}
                  </p>

                </div>

                <div className="text-center">

                  <p className="text-xs text-slate-500">
                    Absent
                  </p>

                  <p className="text-sm font-semibold text-red-400 mt-1">
                    {item.absent}
                  </p>

                </div>

                <div className="text-center">

                  <p className="text-xs text-slate-500">
                    Late
                  </p>

                  <p className="text-sm font-semibold text-amber-400 mt-1">
                    {item.late}
                  </p>

                </div>

                <div className="text-center">

                  <p className="text-xs text-slate-500">
                    Total
                  </p>

                  <p className="text-sm font-semibold text-slate-300 mt-1">
                    {item.total}
                  </p>

                </div>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}