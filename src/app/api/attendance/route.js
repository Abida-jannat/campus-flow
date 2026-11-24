import { route, ok, notFound, badRequest } from "@/lib/api";
import { validate, ATTENDANCE_STATUSES } from "@/lib/schemas";
import { teacherFilter, todayDate, assertAttendanceDate } from "@/lib/queries";

async function findOwnCourse(db, teacher, courseCode) {
  if (!courseCode) throw badRequest("Course code is required");
  const course = await db.collection("courses").findOne({ courseCode, ...teacherFilter(teacher) });
  if (!course) throw notFound("Course not found, or it does not belong to you");
  return course;
}

function rosterQuery(course) {
  return { role: "student", department: course.department, semester: course.semester };
}

// GET /api/attendance?courseCode=CSE101&date=2026-11-19
// The class roster for one day, with any attendance already saved for that day.
export const GET = route(
  async ({ db, user, query }) => {
    const course = await findOwnCourse(db, user, query.get("courseCode"));
    const date = assertAttendanceDate(query.get("date") || todayDate());

    const [students, saved] = await Promise.all([
      db
        .collection("user")
        .find(rosterQuery(course))
        .project({ name: 1, email: 1, studentId: 1 })
        .sort({ name: 1 })
        .toArray(),
      db
        .collection("attendance")
        .find({ courseCode: course.courseCode, date })
        .project({ studentEmail: 1, status: 1 })
        .toArray(),
    ]);

    const statusByEmail = new Map(saved.map((r) => [r.studentEmail, r.status]));

    return ok({
      course,
      date,
      taken: saved.length > 0,
      students: students.map((s) => ({ ...s, status: statusByEmail.get(s.email) || null })),
    });
  },
  { access: "teacher" }
);

// POST /api/attendance   { courseCode, date?, records: [{ studentEmail, status }] }
// One record per (course, student, date): saving again simply updates it.
export const POST = route(
  async ({ db, user, json }) => {
    const body = await json();
    const { courseCode, date: rawDate } = validate(body, {
      courseCode: { type: "string", required: true, label: "Course code", max: 20 },
      date: { type: "date", label: "Date" },
    });
    const { records } = validate(body, {
      records: { type: "array", required: true, label: "Attendance records", min: 1, maxItems: 500 },
    });

    const course = await findOwnCourse(db, user, courseCode);
    const date = assertAttendanceDate(rawDate || todayDate());

    const roster = await db
      .collection("user")
      .find(rosterQuery(course))
      .project({ email: 1 })
      .toArray();
    const allowed = new Set(roster.map((s) => s.email));

    const valid = [];
    let skipped = 0;
    for (const r of records) {
      if (
        typeof r?.studentEmail === "string" &&
        allowed.has(r.studentEmail) &&
        ATTENDANCE_STATUSES.includes(r.status)
      ) {
        valid.push({ studentEmail: r.studentEmail, status: r.status });
      } else {
        skipped += 1;
      }
    }

    if (valid.length === 0) {
      throw badRequest("None of the records are valid for this course");
    }

    const now = new Date();
    await db.collection("attendance").bulkWrite(
      valid.map((r) => ({
        updateOne: {
          filter: { courseCode: course.courseCode, studentEmail: r.studentEmail, date },
          update: {
            $set: {
              courseName: course.courseName || "",
              teacher: user.name,
              teacherEmail: user.email,
              status: r.status,
              updatedAt: now,
            },
            $setOnInsert: { createdAt: now },
          },
          upsert: true,
        },
      })),
      { ordered: false }
    );

    const summary = { present: 0, absent: 0, late: 0 };
    valid.forEach((r) => (summary[r.status] += 1));

    return ok({ date, count: valid.length, skipped, summary }, { message: "Attendance saved successfully" });
  },
  { access: "teacher" }
);

// DELETE /api/attendance?courseCode=CSE101&date=2026-11-19  - clear a day taken by mistake
export const DELETE = route(
  async ({ db, user, query }) => {
    const course = await findOwnCourse(db, user, query.get("courseCode"));
    const date = assertAttendanceDate(query.get("date") || "");

    const result = await db
      .collection("attendance")
      .deleteMany({ courseCode: course.courseCode, date });

    return ok({ deleted: result.deletedCount }, { message: "Attendance for that day was cleared" });
  },
  { access: "teacher" }
);
