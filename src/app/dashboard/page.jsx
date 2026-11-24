"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "@/lib/api-client";
import StatsCard from "@/components/dashboard/StatsCard";
import TodayClasses from "@/components/dashboard/TodayClasses";
import AIAssistantCard from "@/components/dashboard/AIassistant";
import EmptyRoomCard from "@/components/dashboard/EmptyClss";
import AnnouncementCard from "@/components/dashboard/Announcements";
import {
  GraduationCap,
  CalendarDays,
  Bell,
  BookOpen,
} from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      // One request, never throws, always answers (even on timeout / server error).
      const res = await apiFetch("/api/dashboard");
      if (res.ok) setData(res.data);
      else toast.error(res.message);
      setLoading(false);
    }
    loadDashboard();
  }, []);

  const announcements = data?.announcements ?? [];

  return (
    <div className="space-y-8">
      <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-6">
        <StatsCard
          title="Attendance"
          value={`${data?.attendance ?? 0}%`}
          subtitle="Overall attendance"
          icon={<GraduationCap size={28} />}
          href="/dashboard/attendance"
        />

        <StatsCard
          title="Courses"
          value={data?.totalCourses ?? 0}
          subtitle="Active courses"
          icon={<BookOpen size={28} />}
          href="/dashboard/courses"
        />

        <StatsCard
          title="Events"
          value="3"
          subtitle="Upcoming events"
          icon={<CalendarDays size={28} />}
          href="/dashboard/events"
        />

        <StatsCard
          title="Announcements"
          value={data?.announcementCount ?? 0}
          subtitle="Total course notices"
          icon={<Bell size={28} />}
          href="/dashboard/announcements"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <TodayClasses
          classes={data?.todaysClasses ?? []}
          loading={loading}
        />

        <AnnouncementCard announcements={announcements} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <EmptyRoomCard />
        <AIAssistantCard />
      </div>
    </div>
  );
}