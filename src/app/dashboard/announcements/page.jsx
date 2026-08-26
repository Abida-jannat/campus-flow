"use client";

import { useEffect, useState } from "react";
import { FaBullhorn } from "react-icons/fa";


export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const res = await fetch("/api/student/announcements", {
          credentials: "include",
        });

        const contentType = res.headers.get("content-type");
        if (!res.ok || !contentType || !contentType.includes("application/json")) {
          console.error("API route not returning JSON. Received status:", res.status);
          return;
        }

        const data = await res.json();
        if (data.success) {
          setAnnouncements(data.announcements || []);
        }
      } catch (error) {
        console.error("Error loading announcements:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnnouncements();
  }, []);

  function formatDate(dateString) {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">All Announcements</h1>
          <p className="text-slate-400 text-sm mt-1">
            Stay updated with your latest course updates and notices.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-slate-400 py-10 text-center">Loading announcements...</p>
        ) : announcements.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
            No announcements found.
          </div>
        ) : (
          announcements.map((item) => (
            <div
              key={item._id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex gap-4 items-start"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 flex items-center justify-center flex-shrink-0 mt-1">
                <FaBullhorn className="text-indigo-400 text-xl" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-white font-semibold text-lg">
                    {item.courseName || item.courseCode || item.title || "Course Notice"}
                  </h2>
                  {item.courseCode && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                      {item.courseCode}
                    </span>
                  )}
                </div>

                <p className="text-slate-300 text-sm mt-2 leading-relaxed">
                  {item.message || item.description}
                </p>

                {/* Footer Section: Posted by (Left) & Date (Right) */}
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-500">
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