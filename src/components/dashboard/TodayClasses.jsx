import { Clock, MapPin, User } from "lucide-react";

export default function TodayClasses({ classes }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
      <h2 className="text-xl font-bold text-white mb-6">
        Todays Classes
      </h2>

      {classes.length === 0 ? (
        <div className="flex items-center justify-center h-40 text-slate-400">
          No classes scheduled today.
        </div>
      ) : (
        <div className="space-y-4">
          {classes.map((item) => (
            <div
              key={item._id}
              className="flex justify-between items-center bg-slate-800 rounded-2xl p-4 hover:border hover:border-indigo-500 transition"
            >
              <div className="flex items-center gap-4">
                {/* Left Color Bar */}
                <div className="w-4 h-14 rounded-full bg-indigo-500"></div>

                <div>
                  <h3 className="text-white font-semibold text-lg">
                    {item.courseName}
                  </h3>

                  <p className="text-indigo-400 text-sm font-medium">
                    {item.courseCode}
                  </p>

                  <div className="flex flex-wrap gap-4 mt-2 text-slate-400 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {item.startTime} - {item.endTime}
                    </span>

                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {item.room}
                    </span>

                    <span className="flex items-center gap-1">
                      <User size={14} />
                      {item.teacher}
                    </span>
                  </div>
                </div>
              </div>

              <div className="hidden md:block">
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-sm">
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