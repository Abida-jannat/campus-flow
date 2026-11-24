import { route, ok } from "@/lib/api";
import { pct } from "@/lib/queries";

export const GET = route(async ({ db, user }) => {
  const records = await db
    .collection("attendance")
    .find({ studentEmail: user.email })
    .sort({ date: -1 })
    .toArray();

  const byCourse = new Map();
  const overall = { present: 0, absent: 0, late: 0, total: 0 };

  for (const record of records) {
    const courseCode = record.courseCode || "Unknown";
    const status = String(record.status || "").toLowerCase();

    if (!byCourse.has(courseCode)) {
      byCourse.set(courseCode, {
        courseCode,
        courseName: record.courseName || courseCode,
        present: 0,
        absent: 0,
        late: 0,
        total: 0,
      });
    }
    const course = byCourse.get(courseCode);

    course.total += 1;
    overall.total += 1;
    if (status === "present" || status === "absent" || status === "late") {
      course[status] += 1;
      overall[status] += 1;
    }
  }

  const withPercent = (c) => ({ ...c, percentage: pct(c.present + c.late, c.total) });

  return ok({
    student: { name: user.name, email: user.email },
    records,
    courses: [...byCourse.values()].map(withPercent),
    overall: withPercent(overall),
  });
});
