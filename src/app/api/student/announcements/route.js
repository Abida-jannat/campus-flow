import { route, ok } from "@/lib/api";
import { getStudentCourses, announcementFilter } from "@/lib/queries";

export const GET = route(async ({ db, user }) => {
  const courses = await getStudentCourses(db, user, { courseCode: 1 });
  const courseCodes = courses.map((c) => c.courseCode).filter(Boolean);

  const announcements = await db
    .collection("announcements")
    .find(announcementFilter(user, courseCodes))
    .sort({ createdAt: -1 })
    .limit(30)
    .toArray();

  return ok({ announcements });
});

