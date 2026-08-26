"use client";

import { useEffect, useState } from "react";

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
  
  const [dashboardData, setDashboardData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    async function fetchDashboardAndAnnouncements() {
      try {
        const dashRes = await fetch("/api/dashboard", {
          credentials: "include",
        });
        if (dashRes.ok) {
          const dashData = await dashRes.json();
          setDashboardData(dashData);
        }

        const annRes = await fetch("/api/student/announcements", {
          credentials: "include",
        });
        if (annRes.ok) {
          const annData = await annRes.json();
          if (annData.success) {
            setAnnouncements(annData.announcements || []);
          }
        }
      } catch (error) {
        console.error("Dashboard data load error:", error);
      }
    }

    fetchDashboardAndAnnouncements();
  }, []);

  return (
    <div className="space-y-8">
    
      <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-6">
        <StatsCard
          title="Attendance"
          value={`${dashboardData?.attendance ?? 0}%`}
          subtitle="than last month"
          icon={<GraduationCap size={28} />}
        />

        <StatsCard
          title="Courses"
          value={dashboardData?.totalCourses ?? 0}
          subtitle="Active courses"
          icon={<BookOpen size={28} />}
        />

        <StatsCard
          title="Events"
          value="3"
          subtitle="Upcoming events"
          icon={<CalendarDays size={28} />}
        />

        <StatsCard
          title="Announcements"
          value={announcements.length}
          subtitle="Total course notices"
          icon={<Bell size={28} />}
        />
      </div>

      {/* CLASSES & ANNOUNCEMENTS */}
      <div className="grid lg:grid-cols-2 gap-6">
        <TodayClasses classes={dashboardData?.TodayClasses || []} />

        <AnnouncementCard announcements={announcements} />
      </div>

      {/* ROOMS & AI ASSISTANT */}
      <div className="grid lg:grid-cols-2 gap-6">
        <EmptyRoomCard />

        <AIAssistantCard />
      </div>
    </div>
  );
}