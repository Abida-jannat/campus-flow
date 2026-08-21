"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  CalendarDays,
  BookOpen,
  Bell,
  Settings,
  LogOut,
  Search,
  ChevronDown,
} from "lucide-react";

const mainNavItems = [
  { label: "Dashboard", href: "/teacher", icon: LayoutDashboard },
  { label: "My Courses", href: "/teacher/courses", icon: BookOpen },
  { label: "Attendance", href: "/teacher/attendance", icon: ClipboardCheck },
  { label: "Class Schedule", href: "/teacher/schedule", icon: CalendarDays },
  { label: "Students", href: "/teacher/students", icon: Users },
];

const otherNavItems = [
  { label: "Announcements", href: "/teacher/announcements", icon: Bell },
  { label: "Settings", href: "/teacher/settings", icon: Settings },
];

export default function TeacherDashboard() {
  const pathname = usePathname();
  const router = useRouter(); // FIX: this was missing — handleLogout called router.push() with no router defined

  const [teacher, setTeacher] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/teacher/summary", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setTeacher(data.teacher);
        setStats(data.stats);
      })
      .catch((err) => console.error("Failed to load dashboard summary:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.push("/auth/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }

  // Initials for the avatar badge, derived from the teacher's real name
  const initials = teacher?.name
    ? teacher.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "..";

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* ================= SIDEBAR ================= */}

      <aside className="hidden lg:flex w-64 fixed inset-y-0 left-0 bg-slate-900 border-r border-slate-800 flex-col">
        {/* Logo */}

        <div className= "h-20 flex items-center px-6 border-b border-slate-800">
          <div className= "w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-lg">
            C
          </div>

          <div className="ml-3">
            <h1 className="font-bold text-lg">CampusFlow</h1>
            <p className="text-xs text-slate-500">Teacher Portal</p>
          </div>
        </div>

        {/* Navigation */}

        <nav className="flex-1 p-4 space-y-2">
          <p className="text-xs uppercase text-slate-500 px-3 mb-3">Main Menu</p>

          {mainNavItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={19} />
                {label}
              </Link>
            );
          })}

          <p className="text-xs uppercase text-slate-500 px-3 pt-6 mb-3">Others</p>

          {otherNavItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={19} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN ================= */}

      <main className="lg:ml-64 flex-1 min-h-screen">
        {/* TOP NAVBAR */}

        <header className="h-20 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-30">
          <div className="h-full px-6 lg:px-8 flex items-center justify-between">
            {/* Search */}

            <div className="relative hidden md:block">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                placeholder="Search..."
                className="w-72 bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white outline-none focus:border-indigo-500"
              />
            </div>

            {/* Profile */}

            <div className="flex items-center gap-4 ml-auto">
              <button className="relative w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center hover:border-indigo-500">
                <Bell size={19} className="text-slate-300" />

                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              <div className="h-8 w-px bg-slate-800" />

              <Link
  href="/teacher/settings"
  className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-slate-900 transition cursor-pointer"
>
  {/* Profile Image / Initials */}
  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold overflow-hidden">
    {teacher?.image ? (
      <img
        src={teacher.image}
        alt={teacher?.name || "Teacher"}
        className="w-full h-full object-cover"
      />
    ) : (
      initials
    )}
  </div>

  {/* Teacher Information */}
  <div className="hidden sm:block text-left">
    <p className="text-sm font-semibold text-white">
      {teacher?.name ?? "Loading..."}
    </p>

    <p className="text-xs text-slate-500">
      {teacher?.department ?? "Teacher"}
    </p>
  </div>

  <ChevronDown
    size={17}
    className="text-slate-500"
  />
</Link>
            </div>
          </div>
        </header>

        {/* ================= CONTENT ================= */}

        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Welcome */}

          <div className="mb-8">
        <p className="text-indigo-400 text-sm font-medium mb-2">Teacher Portal</p>



       <h1 className="text-3xl font-bold"> {getGreeting()}, {teacher?.name ?? "..."} 👋
            </h1>

            <p className="text-slate-400 mt-2">
              Manage your classes and students from one place.
            </p>
          </div>

          {/* STATS */}

          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
            <Stat
              icon={<BookOpen size={21} />}
              title="My Courses"
              value={loading ? "..." : stats?.courseCount ?? "0"}
            />

            <Stat
              icon={<Users size={21} />}
              title="Students"
              value={loading ? "..." : stats?.studentCount ?? "0"}
            />

            <Stat
              icon={<ClipboardCheck size={21} />}
              title="Attendance"
              value="Manage"
            />

            <Stat
              icon={<CalendarDays size={21} />}
              title="Classes Today"
              value={loading ? "..." : stats?.classesToday ?? "0"}
            />
          </div>

          {/* ACTION CARDS */}

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Attendance */}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <ClipboardCheck size={22} className="text-indigo-400" />
                </div>

                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full">
                  Today
                </span>
              </div>

              <h2 className="text-xl font-semibold mt-5">Take Attendance</h2>

              <p className="text-slate-400 text-sm mt-2">
                Mark attendance for your scheduled classes.
              </p>

              <Link
                href="/teacher/attendance"
                className="mt-5 inline-block bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 rounded-xl text-sm font-semibold transition"
              >
                Take Attendance
              </Link>
            </div>

            {/* Schedule */}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <CalendarDays size={22} className="text-indigo-400" />
                </div>

                <span className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full">
                  {loading ? "..." : `${stats?.classesToday ?? 0} Classes`}
                </span>
              </div>

              <h2 className="text-xl font-semibold mt-5">Class Schedule</h2>

              <p className="text-slate-400 text-sm mt-2">
                View your upcoming classes and room information.
              </p>

              <Link
                href="/teacher/schedule"
                className="mt-5 inline-block bg-slate-800 hover:bg-slate-700 border border-slate-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition"
              >
                 View Schedule
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ================= STAT COMPONENT ================= */

function Stat({ icon, title, value }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
        {icon}
      </div>

      <p className="text-slate-400 text-sm mt-4">{title}</p>

      <h2 className="text-2xl font-bold mt-1">{value}</h2>
    </div>
  );
}