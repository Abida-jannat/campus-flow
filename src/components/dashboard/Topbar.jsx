"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Bell,
  Search,
  CalendarDays,
  ChevronDown,
  Megaphone,
  X,

} from "lucide-react";


export default function Topbar() {

  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [latestNotice, setLatestNotice] = useState(null);

  const previousCountRef = useRef(0);
  const isInitialFetch = useRef(true);

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


useEffect(() => {
  async function checkNewAnnouncements() {
    try {
      const res = await fetch("/api/student/notifications");
      if (!res.ok) return;
      const data = await res.json();

      if (data.success) {
        const currentCount = data.unreadCount || 0;

        if (!isInitialFetch.current && currentCount > previousCountRef.current) {

          if (data.latestNotification) {
            setLatestNotice({
              title: data.latestNotification.title || "New Announcement!",
              message: data.latestNotification.message || "A teacher has posted a new notice.",
            });
          } else {
            setLatestNotice({
              title: "New Announcement!",
              message: "A teacher has posted a new notice.",
            });
          }
          setShowNotificationPopup(true);

          setTimeout(() => {
            setShowNotificationPopup(false);
          }, 5000);
        }

        setUnreadCount(currentCount);
        previousCountRef.current = currentCount;
        isInitialFetch.current = false;
      }
    } catch (error) {
      console.error("Notification polling error:", error);
    }
  }

  checkNewAnnouncements();

  const interval = setInterval(checkNewAnnouncements, 1000);
  return () => clearInterval(interval);
}, []);

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
      {/* Custom Popup Notification Box  */}
      {showNotificationPopup && (
        <div className="fixed top-5 right-5 z-50 max-w-sm w-full bg-slate-900 border border-indigo-500/80 rounded-2xl p-4 shadow-2xl flex items-start gap-3 transition">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 flex-shrink-0 mt-0.5">
            <Megaphone size={20} />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white">
              {latestNotice?.title}
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

      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="h-24 px-8 flex items-center justify-between">
          {/* Left */}
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

          {/* Right */}
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

            {/* Notification Bell */}
            <Link
              href="/dashboard/announcements"
              className="relative h-12 w-12 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500 transition flex items-center justify-center cursor-pointer group"
              title="View Announcements"
            >
              <Bell
                size={20}
                className="text-slate-300 group-hover:text-indigo-400 transition"
              />
              {unreadCount > 0 && (
                <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-red-500"></span>
              )}
            </Link>

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