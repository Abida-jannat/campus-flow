import StatsCard from "@/components/dashboard/StatsCard";

import {
  GraduationCap,
  CalendarDays,
  Bell,
  BookOpen,
} from "lucide-react";

export default function Dashboard() {
  return (
    <div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <StatsCard
          title="Attendance"
          value="95%"
          subtitle="than last month"
          icon={<GraduationCap size={28} />}
        />

        <StatsCard
          title="Courses"
          value="6"
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

    </div>
  );
}