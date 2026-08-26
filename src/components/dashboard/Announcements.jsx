import { FaBullhorn } from "react-icons/fa";
import Link from "next/link";

export default function AnnouncementCard({ announcements = [] }) {
  
  function formatDate(dateString) {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-6">
    
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Latest Announcements</h2>

        <Link
          href="/dashboard/announcements"
          className="text-indigo-400 hover:text-indigo-300 transition text-sm font-medium"
        >
          View All
        </Link>
      </div>

      
      <div className="space-y-5">

        {announcements.length === 0 ? (
          <p className="text-slate-500 text-center py-6">
            No announcements found.
          </p>
        ) : (
          announcements.slice(0, 4).map((item) => (
            <div
              key={item._id}
              className="flex gap-4 border-b border-slate-800 pb-4 last:border-none last:pb-0"
            >
         
              <div className="w-11 h-11 rounded-xl bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
                <FaBullhorn className="text-indigo-400 text-lg" />
              </div>

      
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
              
                  <h3 className="text-white font-semibold truncate">
                    {item.courseName || item.courseCode || item.title || "Course Announcement"}
                  </h3>
                  {item.courseCode && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                      {item.courseCode}
                    </span>
                  )}
                </div>

   
                <p className="text-slate-400 text-sm mt-1 line-clamp-2 leading-relaxed">
                  {item.message || item.description}
                </p>

                <div className="flex justify-between items-center mt-2">
  
                  <span className="text-xs text-slate-500">
                    {item.createdAt ? formatDate(item.createdAt) : item.date}
                  </span>

       
                  {item.teacherName && (
                    <span className="text-xs text-slate-400 font-medium">
                      By {item.teacherName}
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