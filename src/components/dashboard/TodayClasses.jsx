import { Clock, MapPin, User, BookOpen } from "lucide-react";

export default function TodayClasses({ classes = [] }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between h-full min-h-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="text-indigo-400" size={22} />
          Todays Classes
        </h2>
        <span className="text-xs font-semibold px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
          {classes.length} Sessions
        </span>
      </div>

      {/* Main Content Area */}
      {classes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-800/80 rounded-2xl p-8 my-auto">
          <p className="text-slate-400 text-sm font-medium text-center">
            No classes scheduled today. 🎉
          </p>
        </div>
      ) : (
        <div className="space-y-4 flex-1">
          {classes.map((item) => (
            <div
              key={item._id}
              className="flex justify-between items-center bg-slate-950/70 border border-slate-800 rounded-2xl p-4 hover:border-indigo-500/50 transition group"
            >
              <div className="flex items-center gap-4">
                {/* Left Color Indicator Bar */}
                <div className="w-2 h-14 rounded-full bg-indigo-500 group-hover:bg-indigo-400 transition"></div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {item.courseCode}
                    </span>
                    {item.type && (
                      <span className="text-[10px] font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                        {item.type}
                      </span>
                    )}
                  </div>

                  <h3 className="text-white font-semibold text-base mt-1">
                    {item.courseName}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-slate-400 text-xs">
                    <span className="flex items-center gap-1">
                      <Clock size={13} className="text-indigo-400" />
                      {item.startTime} - {item.endTime}
                    </span>

                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-indigo-400" />
                      {item.building} {item.floor ? `, ${item.floor}` : ""}, Room {item.room}
                    </span>

                    <span className="flex items-center gap-1">
                      <User size={13} className="text-indigo-400" />
                      {item.teacher}
                    </span>
                  </div>
                </div>
              </div>

              <div className="hidden md:block">
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                  {item.day}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}