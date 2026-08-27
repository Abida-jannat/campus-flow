"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Bell,
  Search,
  CalendarDays,
  ChevronDown,
  Megaphone,
  X,
  Trash2,
} from "lucide-react";

export default function Topbar() {
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [latestNotice, setLatestNotice] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const previousCountRef = useRef(0);
  const isInitialFetch = useRef(true);

  // ১. ইউজার ডাটা ফেচ
  useEffect(() => {
    async function getUser() {
      try {
        const res = await fetch("/api/user");
        if (!res.ok) return;
        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error("User fetch error:", error);
      }
    }
    getUser();
  }, []);

  // ২. নোটিফিকেশন ফেচ ও ১ সেকেন্ডের পোলিং (useCallback ব্যবহার করা হয়েছে যাতে ESLint Error না আসে)
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/student/notifications");
      if (!res.ok) return;
      const data = await res.json();

      if (data.success) {
        const currentCount = data.unreadCount || 0;
        setNotifications(data.notifications || []);

        if (!isInitialFetch.current && currentCount > previousCountRef.current) {
          if (data.latestNotification) {
            setLatestNotice(data.latestNotification);
            setShowNotificationPopup(true);

            setTimeout(() => {
              setShowNotificationPopup(false);
            }, 5000);
          }
        }

        setUnreadCount(currentCount);
        previousCountRef.current = currentCount;
        isInitialFetch.current = false;
      }
    } catch (error) {
      console.error("Notification fetch error:", error);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount pattern
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 1000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  
  const handleDeleteOne = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/student/notifications?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((item) => item._id !== id));
        fetchNotifications();
      }
    } catch (error) {
      console.error("Single delete error:", error);
    }
  };

 
  const handleClearAll = async () => {
    try {
      const res = await fetch("/api/student/notifications", {
        method: "DELETE",
      });
      if (res.ok) {
        setNotifications([]);
        setUnreadCount(0);
        setShowNotificationPopup(false);
      }
    } catch (error) {
      console.error("Clear all error:", error);
    }
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const hour = new Date().getHours();
  let greeting = "Good Evening";
  if (hour < 12) greeting = "Good Morning";
  else if (hour < 18) greeting = "Good Afternoon";

  return (
    <>
      
      {showNotificationPopup && (
        <div className="fixed top-5 right-5 z-50 max-w-sm w-full bg-slate-900 border border-indigo-500/80 rounded-2xl p-4 shadow-2xl flex items-start gap-3 transition">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 flex-shrink-0 mt-0.5">
            <Megaphone size={20} />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white">
              {latestNotice?.title || "New Announcement!"}
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              {latestNotice?.message}
            </p>
            <Link
              href="/dashboard/announcements"
              onClick={() => setShowNotificationPopup(false)}
              className="inline-block mt-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              View Notice →
            </Link>
          </div>

          <button
            onClick={() => setShowNotificationPopup(false)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 🔵 Header Bar */}
      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="h-24 px-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">
              {greeting},
              <span className="text-indigo-400">
                {" "}
                {user?.name || "Student"} 👋
              </span>
            </h2>

            <div className="flex items-center gap-2 mt-2 text-slate-400 text-sm">
              <CalendarDays size={16} />
              <span>{today}</span>
            </div>
          </div>
          

          <div className="flex items-center gap-5">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search anything..."
                className="w-80 bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-slate-500 outline-none focus:border-indigo-500"
              />
            </div>

            {/* 🔔 Notification Bell & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative h-12 w-12 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500 transition flex items-center justify-center cursor-pointer group"
              >
                <Bell
                  size={20}
                  className="text-slate-300 group-hover:text-indigo-400 transition"
                />
                {unreadCount > 0 && (
                  <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-red-500"></span>
                )}
              </button>

              {/* 📋 Notification Dropdown List */}
              {showDropdown && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-semibold text-white">
                      Notifications ({notifications.length})
                    </h3>
                    {notifications.length > 0 && (
                      <button
                        onClick={handleClearAll}
                        className="text-xs text-red-400 hover:text-red-300 font-medium transition"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto mt-3 space-y-2 pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-8">
                        No notifications found.
                      </p>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item._id}
                          className="flex items-start justify-between p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-indigo-500/40 transition group"
                        >
                          <div className="flex-1 pr-3">
                            <h4 className="text-xs font-semibold text-indigo-400">
                              {item.title}
                            </h4>
                            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed break-words">
                              {item.message}
                            </p>
                            {item.createdAt && (
                              <span className="text-[10px] text-slate-500 mt-2 block">
                                {new Date(item.createdAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={(e) => handleDeleteOne(item._id, e)}
                            className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition flex-shrink-0"
                            title="Delete notification"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <button className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl px-3 py-2 hover:border-indigo-500 transition">
              <img
                src="https://i.pravatar.cc/100"
                alt="profile"
                className="w-11 h-11 rounded-xl"
              />
              <div className="text-left hidden lg:block">
                <p className="text-white font-semibold">
                  {user?.name || "Student"}
                </p>
                <p className="text-slate-400 text-xs">
                  {user?.email || "Loading..."}
                </p>
              </div>
              <ChevronDown size={18} className="text-slate-400" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}