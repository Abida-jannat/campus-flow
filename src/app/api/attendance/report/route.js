import { route, ok, notFound, badRequest } from "@/lib/api";
import { teacherFilter, pct } from "@/lib/queries";

const counters = {
  present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
  absent: { $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] } },
  late: { $sum: { $cond: [{ $eq: ["$status", "late"] }, 1, 0] } },
  total: { $sum: 1 },
};

const AT_RISK_BELOW = 75;


export const GET = route(
  async ({ db, user, query }) => {
    const courseCode = query.get("courseCode");
    if (!courseCode) throw badRequest("Course code is required");

    const course = await db.collection("courses").findOne({ courseCode, ...teacherFilter(user) });
    if (!course) throw notFound("Course not found, or it does not belong to you");

    const match = { $match: { courseCode: course.courseCode } };

    const [roster, perStudent, perDate] = await Promise.all([
      db
        .collection("user")
        .find({ role: "student", department: course.department, semester: course.semester })
        .project({ name: 1, email: 1, studentId: 1 })
        .sort({ name: 1 })
        .toArray(),
      db.collection("attendance").aggregate([match, { $group: { _id: "$studentEmail", ...counters } }]).toArray(),
      db
        .collection("attendance")
        .aggregate([match, { $group: { _id: "$date", ...counters } }, { $sort: { _id: -1 } }, { $limit: 90 }])
        .toArray(),
    ]);

    const byEmail = new Map(perStudent.map((r) => [r._id, r]));

    const students = roster.map((s) => {
      const r = byEmail.get(s.email) || { present: 0, absent: 0, late: 0, total: 0 };
      const percentage = pct(r.present + r.late, r.total);
      return {
        name: s.name,
        email: s.email,
        studentId: s.studentId || "",
        present: r.present,
        absent: r.absent,
        late: r.late,
        total: r.total,
        percentage,
        atRisk: r.total > 0 && percentage < AT_RISK_BELOW,
      };
    });

    const sessions = perDate.map((r) => ({
      date: r._id,
      present: r.present,
      absent: r.absent,
      late: r.late,
      total: r.total,
      percentage: pct(r.present + r.late, r.total),
    }));

    const classesHeld = sessions.length;
    const average = students.length
      ? Math.round(students.reduce((sum, s) => sum + s.percentage, 0) / students.length)
      : 0;

    return ok({
      course: { courseCode: course.courseCode, courseName: course.courseName },
      threshold: AT_RISK_BELOW,
      classesHeld,
      averagePercentage: average,
      atRiskCount: students.filter((s) => s.atRisk).length,
      students,
      sessions,
    });
  },
  { access: "teacher" }
);
