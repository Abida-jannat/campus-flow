
import { route, ok } from "@/lib/api";
import { teacherFilter, ci, todayName } from "@/lib/queries";

export const GET = route(
  async ({ db, user }) => {
    const courses = await db
      .collection("courses")
      .find(teacherFilter(user))
      .project({ department: 1, semester: 1 })
      .toArray();

    const groups = [
      ...new Map(
        courses.map((c) => [
          `${c.department}|${c.semester}`,
          {
            department: c.department,
            semester: c.semester,
          },
        ])
      ).values(),
    ];

    const [studentCount, classesToday] = await Promise.all([
      groups.length
        ? db.collection("user").countDocuments({
            role: "student",
            $or: groups,
          })
        : 0,

      db.collection("classSchedule").countDocuments({
        ...teacherFilter(user),
        day: ci(todayName()),
      }),
    ]);

    return ok({
      teacher: {
        name: user.name,
        email: user.email,
        department: user.department,
        image: user.image || null,
      },
      stats: {
        courseCount: courses.length,
        studentCount,
        classesToday,
      },
    });
  },
  { access: "teacher" }
);
