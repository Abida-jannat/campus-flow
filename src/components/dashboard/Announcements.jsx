import { FaBullhorn } from "react-icons/fa";

export default function AnnouncementCard({ announcements = [] }) {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">
          Latest Announcements
        </h2>

        <button className="text-indigo-400 hover:text-indigo-300 transition">
          View All
        </button>
      </div>

      {/* Announcement List */}
      <div className="space-y-5">

        {announcements.length === 0 ? (
          <p className="text-slate-500 text-center py-6">
            No announcements found.
          </p>
        ) : (
          announcements.map((item) => (
            <div
              key={item._id}
              className="flex gap-4 border-b border-slate-800 pb-4 last:border-none"
            >
              {/* Icon */}
              <div className="w-11 h-11 rounded-xl bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
                <FaBullhorn className="text-indigo-400 text-lg" />
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-white font-semibold">
                  {item.title}
                </h3>

                <p className="text-slate-400 text-sm mt-1">
                  {item.description}
                </p>

                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-slate-500">
                    {item.date}
                  </span>

                  {item.priority && (
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        item.priority === "High"
                          ? "bg-red-500/20 text-red-400"
                          : item.priority === "Medium"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {item.priority}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

      </div>
    </div>
  );
}