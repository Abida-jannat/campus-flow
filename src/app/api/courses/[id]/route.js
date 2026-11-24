import { route, ok, objectId, notFound, forbidden } from "@/lib/api";
import { teacherFilter, pct, sameText } from "@/lib/queries";

// GET /api/courses/:id - everything about one course (students and its teacher).
export const GET = route(async ({ db, user, params }) => {
  const course = await db.collection("courses").findOne({ _id: objectId(params.id, "course id") });
  if (!course) throw notFound("Course not found");

  const isTeacher = user.role === "teacher" || user.role === "admin";

  if (isTeacher) {
    const owns = await db.collection("courses").countDocuments({ _id: course._id, ...teacherFilter(user) });
    if (!owns && user.role !== "admin") throw forbidden("This course belongs to another teacher");
  } else {
    const inMySemester =
      sameText(user.department, course.department) &&
      (!user.semester || course.semester === user.semester);
    if (!inMySemester) {
      throw forbidden("This course is not part of your semester");
    }
  }

  const [schedule, announcements, myRecords, studentCount] = await Promise.all([
    db.collection("classSchedule").find({ courseCode: course.courseCode }).sort({ startTime: 1 }).toArray(),
    db
      .collection("announcements")
      .find({ courseCode: course.courseCode })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray(),
    isTeacher
      ? []
      : db
          .collection("attendance")
          .find({ courseCode: course.courseCode, studentEmail: user.email })
          .sort({ date: -1 })
          .toArray(),
    db.collection("user").countDocuments({
      role: "student",
      department: course.department,
      semester: course.semester,
    }),
  ]);

  let attendance = null;
  if (!isTeacher) {
    const count = (status) => myRecords.filter((r) => r.status === status).length;
    const present = count("present");
    const late = count("late");
    attendance = {
      present,
      late,
      absent: count("absent"),
      total: myRecords.length,
      percentage: pct(present + late, myRecords.length),
      recent: myRecords.slice(0, 10).map((r) => ({ date: r.date, status: r.status })),
    };
  }

  return ok({ course, schedule, announcements, studentCount, attendance });
});
