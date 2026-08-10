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

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/dashboard");

        if (!res.ok) {
          console.log("Failed to fetch dashboard data");
          return;
        }

        const data = await res.json();
        console.log(data); // Check API response in browser console

        setDashboardData(data);

      } catch (error) {
        console.error(error);
      }
    }

    fetchDashboard();
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
          value="12"
          subtitle="Unread notices"
          icon={<Bell size={28} />}
        />

      </div>


      <div className="grid lg:grid-cols-2 gap-6">

        <TodayClasses classes={dashboardData?.TodayClasses ||[] } />

        <AnnouncementCard announcements={dashboardData?.announcements || []} />

      </div>


      <div className="grid lg:grid-cols-2 gap-6">

        <EmptyRoomCard />

        <AIAssistantCard />

      </div>

    </div>
  );
}