"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import {
  FaGraduationCap,
  FaHome,
  FaCalendarAlt,
  FaClipboardCheck,
  FaBullhorn,
  FaUsers,
  FaStore,
  FaBoxOpen,
  FaRobot,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

const menuItems = [
  {
    title: "Dashboard",
    icon: <FaHome />,
    href: "/dashboard",
  },
  {
    title: "Attendance",
    icon: <FaClipboardCheck />,
    href: "/dashboard/attendance",
  },
  {
    title: "Class Schedule",
    icon: <FaCalendarAlt />,
    href: "/dashboard/schedule",
  },
  {
    title: "Announcements",
    icon: <FaBullhorn />,
    href: "/dashboard/announcements",
  },
  {
    title: "Clubs",
    icon: <FaUsers />,
    href: "/dashboard/clubs",
  },
  {
    title: "Marketplace",
    icon: <FaStore />,
    href: "/dashboard/marketplace",
  },
  {
    title: "Lost & Found",
    icon: <FaBoxOpen />,
    href: "/dashboard/lost-found",
  },
  {
    title: "AI Assistant",
    icon: <FaRobot />,
    href: "/dashboard/ai",
  },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Logged out successfully 👋");
            router.push("/auth/login");
            router.refresh();
          },
        },
      });

      router.push("/auth/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Failed to log out");
    }
  };

  return (
    <aside className="w-72 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo Header */}
      <div className="px-8 py-7 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center">
            <FaGraduationCap className="text-white text-2xl" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">
              Campus<span className="text-indigo-500">Flow</span>
            </h1>
            <p className="text-slate-400 text-sm">Student Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-5 py-8">
        <p className="text-slate-500 uppercase text-xs tracking-widest mb-4">
          Main Menu
        </p>

        <div className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.title}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-indigo-600 text-white font-medium shadow-lg shadow-indigo-600/20"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Footer Actions */}
      <div className="border-t border-slate-800 p-5 space-y-3">
        <Link
          href="/dashboard/settings"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 transition"
        >
          <FaCog />
          Settings
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </aside>
  );
}