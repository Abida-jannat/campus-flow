


"use client";

import {
  Bell,
  Search,
  CalendarDays,
  ChevronDown,
} from "lucide-react";

export default function Topbar() {
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
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">

      <div className="h-24 px-8 flex items-center justify-between">

        {/* Left */}

        <div>

          <h2 className="text-3xl font-bold text-white">
            {greeting},
            <span className="text-indigo-400"> Student 👋</span>
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

          {/* Notification */}

          <button className="relative h-12 w-12 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500 transition">

            <Bell
              size={20}
              className="text-slate-300 mx-auto"
            />

            <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500"></span>

          </button>

          {/* Profile */}

          <button className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl px-3 py-2 hover:border-indigo-500 transition">

            <img
              src="https://i.pravatar.cc/100"
              alt="profile"
              className="w-11 h-11 rounded-xl"
            />

            <div className="text-left hidden lg:block">

              <p className="text-white font-semibold">
                Abida Jannat
              </p>

              <p className="text-slate-400 text-xs">
                Student
              </p>

            </div>

            <ChevronDown
              size={18}
              className="text-slate-400"
            />

          </button>

        </div>

      </div>

    </header>
  );
}