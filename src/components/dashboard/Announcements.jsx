import Link from "next/link";
import { FaBullhorn } from "react-icons/fa";

function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AnnouncementCard({ announcements = [] }) {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Latest Announcements</h2>

        <Link
          href="/dashboard/announcements"
          className="text-indigo-400 hover:text-indigo-300 transition text-sm font-medium"
        >
          View All
        </Link>
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
              key={item._id || item.id}
              className="flex gap-4 border-b border-slate-800 pb-4 last:border-none"
            >
              {/* Icon */}
              <div className="w-11 h-11 rounded-xl bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
                <FaBullhorn className="text-indigo-400 text-lg" />
              </div>

              <div className="flex-1">
                <h3 className="text-white font-semibold">
                  {item.courseName || item.courseCode || item.title || "Course Notice"}
                </h3>

                <p className="text-slate-400 text-sm mt-1">
                  {item.message || item.description}
                </p>

            
                <div className="flex justify-between items-center mt-3 text-xs text-slate-500">
               <span>
                 Posted by:{" "}
                  <strong className="text-slate-400 font-medium">
                    {item.teacher || item.teacherName || item.postedBy || "Faculty Member"}
                 </strong>
                 </span>
  
                  <span>{formatDate(item.createdAt || item.date)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}