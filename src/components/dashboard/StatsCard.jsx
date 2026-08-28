"use client";

import Link from "next/link";
import { ArrowUpRight, TrendingUp } from "lucide-react";

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
   href="#",
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 p-6 transition duration-300 hover:border-indigo-500 hover:-translate-y-1 block cursor-pointer"
    >
      <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-indigo-600/20 blur-3xl group-hover:bg-indigo-500/30 transition"></div>

      <div className="relative flex justify-between items-start">
        {/* Left Side */}
        <div>
          <p className="text-slate-400 text-sm">{title}</p>

          <h2 className="text-4xl font-bold text-white mt-3">{value}</h2>

          <div className="flex items-center gap-2 mt-5">
            <TrendingUp size={16} className="text-green-400" />
            <span className="text-green-400 text-sm font-medium">+12%</span>
            <span className="text-slate-500 text-sm">{subtitle}</span>
          </div>
        </div>

        <div className="h-14 w-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          {icon}
        </div>
      </div>

      <div className="mt-8 flex justify-between items-center text-slate-400 group-hover:text-white transition">
        <span className="text-sm font-medium">View Details</span>

        <ArrowUpRight
          size={18}
          className="text-indigo-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition"
        />
      </div>
    </Link>
  );
}