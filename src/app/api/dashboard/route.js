import { route, ok } from "@/lib/api";
import { getStudentCourses, announcementFilter, scheduleFilter, todayName, ci, pct } from "@/lib/queries";

// One request returns everything the student dashboard needs.
export const GET = route(async ({ db, user }) => {
  const courses = await getStudentCourses(db, user, { courseCode: 1 });
  const courseCodes = courses.map((c) => c.courseCode).filter(Boolean);
  const announcementQuery = announcementFilter(user, courseCodes);

  const [attendanceAgg, todaysClasses, announcements, announcementCount] = await Promise.all([
    db
      .collection("attendance")
      .aggregate([
        { $match: { studentEmail: user.email } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            attended: { $sum: { $cond: [{ $in: ["$status", ["present", "late"]] }, 1, 0] } },
          },
        },
      ])
      .toArray(),
    db
      .collection("classSchedule")
      .find(scheduleFilter(user, [{ day: ci(todayName()) }]))
      .sort({ startTime: 1 })
      .toArray(),
    db.collection("announcements").find(announcementQuery).sort({ createdAt: -1 }).limit(5).toArray(),
    db.collection("announcements").countDocuments(announcementQuery),
  ]);

  const { total = 0, attended = 0 } = attendanceAgg[0] || {};

  return ok({
    attendance: pct(attended, total),
    totalCourses: courses.length,
    todaysClasses,
    announcements,
    announcementCount,
  });
});

