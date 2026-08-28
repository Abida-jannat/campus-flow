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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
    
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Calendar className="text-indigo-400" size={26} /> My Class Schedule
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Check your weekly routine and classroom locations.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {daysOfWeek.map((day) => {
          const isToday = todayName.toLowerCase() === day.toLowerCase();
          const dayCount = schedule.filter(
            (s) => s.day?.toLowerCase() === day.toLowerCase()
          ).length;

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition flex items-center gap-2 whitespace-nowrap ${
                selectedDay.toLowerCase() === day.toLowerCase()
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800"
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
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {dayCount}
              </span>
            </button>
          );
        })}
      </div>


      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading schedule...</div>
      ) : filteredSchedule.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-slate-800 rounded-3xl bg-slate-900/40 text-center">
          <AlertCircle size={40} className="text-slate-500 mb-3" />
          <h3 className="text-white font-semibold text-base">No classes scheduled for {selectedDay}</h3>
          <p className="text-slate-400 text-xs mt-1">Enjoy your day off or check other day schedules.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredSchedule.map((cls) => (
            <div
              key={cls._id}
              className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex justify-between items-start hover:border-indigo-500/50 transition group shadow-md"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
                    {cls.courseCode}
                  </span>
                  {cls.type && (
                    <span className="text-[10px] font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                      {cls.type}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white">{cls.courseName}</h3>
                
                <div className="text-xs text-slate-400 space-y-1.5 pt-1">
                  <p className="flex items-center gap-2">
                    <User size={14} className="text-indigo-400" /> {cls.teacher}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin size={14} className="text-indigo-400" /> {cls.building}{cls.floor ? `, ${cls.floor}` : ""}, Room {cls.room}
                  </p>
                </div>
              </div>

              <span className="text-xs font-semibold px-3 py-1.5 bg-slate-800 text-slate-200 rounded-xl flex items-center gap-1.5 border border-slate-700">
                <Clock size={13} className="text-indigo-400" />
                {cls.startTime} - {cls.endTime}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}