"use client";

import { useEffect, useState } from "react";
import { Clock, MapPin, User, Calendar, AlertCircle } from "lucide-react";

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function SchedulePage() {
  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const [schedule, setSchedule] = useState([]);
  const [selectedDay, setSelectedDay] = useState(todayName);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFullSchedule() {
      try {
        const res = await fetch("/api/student/class-schedule");
        if (res.ok) {
          const data = await res.json();
          if (data.success) setSchedule(data.schedule || []);
        }
      } catch (err) {
        console.error("Failed to load schedule", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFullSchedule();
  }, []);

  const filteredSchedule = schedule.filter(
    (item) => item.day?.toLowerCase() === selectedDay.toLowerCase()
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="text-indigo-600 dark:text-indigo-400" size={26} /> My Class Schedule
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Check your weekly routine and classroom locations.
        </p>
      </div>

      {/* Days Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
        {daysOfWeek.map((day) => {
          const isToday = todayName.toLowerCase() === day.toLowerCase();
          const dayCount = schedule.filter(
            (s) => s.day?.toLowerCase() === day.toLowerCase()
          ).length;

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 sm:px-5 py-2.5 rounded-2xl text-sm font-semibold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                selectedDay.toLowerCase() === day.toLowerCase()
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 shadow-sm"
              }`}
            >
              {day}
              {isToday && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              )}
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  selectedDay.toLowerCase() === day.toLowerCase()
                    ? "bg-indigo-700 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                {dayCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-20 text-center text-slate-600 dark:text-slate-400 font-medium">Loading schedule...</div>
      ) : filteredSchedule.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/40 text-center shadow-sm">
          <AlertCircle size={40} className="text-slate-400 dark:text-slate-500 mb-3" />
          <h3 className="text-slate-900 dark:text-white font-semibold text-base">No classes scheduled for {selectedDay}</h3>
          <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">Enjoy your day off or check other day schedules.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredSchedule.map((cls) => (
            <div
              key={cls._id}
              className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start gap-4 hover:border-indigo-500/50 transition group shadow-sm"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-2.5 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-500/20">
                    {cls.courseCode}
                  </span>
                  {cls.type && (
                    <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {cls.type}
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">{cls.courseName}</h3>
                
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 pt-1">
                  <p className="flex items-center gap-2 truncate">
                    <User size={14} className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" /> 
                    <span className="truncate">{cls.teacher}</span>
                  </p>
                  <p className="flex items-center gap-2 truncate">
                    <MapPin size={14} className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" /> 
                    <span className="truncate">{cls.building}{cls.floor ? `, ${cls.floor}` : ""}, Room {cls.room}</span>
                  </p>
                </div>
              </div>

              <span className="text-xs font-semibold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 flex-shrink-0">
                <Clock size={13} className="text-indigo-600 dark:text-indigo-400" />
                {cls.startTime} - {cls.endTime}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}