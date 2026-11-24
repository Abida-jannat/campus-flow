import { route, ok, created, objectId, notFound } from "@/lib/api";
import { validate, announcementSchema } from "@/lib/schemas";
import { teacherFilter } from "@/lib/queries";

async function ownCourse(db, teacher, courseCode) {
  const course = await db.collection("courses").findOne({ courseCode, ...teacherFilter(teacher) });
  if (!course) throw notFound("Course not found or you do not teach this course");
  return course;
}

export const GET = route(
  async ({ db, user }) => {
    const announcements = await db
      .collection("announcements")
      .find(teacherFilter(user))
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    const codes = [...new Set(announcements.map((a) => a.courseCode))];
    const courses = codes.length
      ? await db
          .collection("courses")
          .find({ courseCode: { $in: codes }, ...teacherFilter(user) })
          .project({ courseCode: 1, courseName: 1, department: 1, semester: 1 })
          .toArray()
      : [];
    const byCode = new Map(courses.map((c) => [c.courseCode, c]));

    return ok({
      announcements: announcements.map((a) => {
        const c = byCode.get(a.courseCode);
        return {
          ...a,
          courseName: a.courseName || c?.courseName || "",
          department: c?.department || a.department || "",
          semester: c?.semester || a.semester || "",
        };
      }),
    });
  },
  { access: "teacher" }
);

export const POST = route(
  async ({ db, user, json }) => {
    const { courseCode, message } = validate(await json(), announcementSchema);
    const course = await ownCourse(db, user, courseCode);

    const now = new Date();
    const announcement = {
      courseCode: course.courseCode,
      courseName: course.courseName,
      message,
      teacher: user.name,
      teacherName: user.name,
      teacherEmail: user.email,
      department: course.department,
      semester: course.semester,
      createdAt: now,
      updatedAt: now,
    };
    const result = await db.collection("announcements").insertOne(announcement);

    // One notification per student of this course (same department + semester).
    const students = await db
      .collection("user")
      .find({ role: "student", department: course.department, semester: course.semester })
      .project({ email: 1 })
      .toArray();

    if (students.length > 0) {
      await db.collection("notifications").insertMany(
        students.map((s) => ({
          userId: s.email,
          title: `New Announcement: ${course.courseName}`,
          message,
          link: "/dashboard/announcements",
          isRead: false,
          createdAt: now,
        }))
      );
    }

    return created(
      { announcement: { _id: result.insertedId, ...announcement }, notified: students.length },
      { message: "Announcement published successfully" }
    );
  },
  { access: "teacher" }
);

export const PUT = route(
  async ({ db, user, json }) => {
    const body = await json();
    const _id = objectId(body?.id, "announcement id");
    const { courseCode, message } = validate(body, announcementSchema);
    const course = await ownCourse(db, user, courseCode);

    const result = await db.collection("announcements").updateOne(
      { _id, ...teacherFilter(user) },
      {
        $set: {
          courseCode: course.courseCode,
          courseName: course.courseName,
          department: course.department,
          semester: course.semester,
          message,
          updatedAt: new Date(),
        },
      }
    );
    if (result.matchedCount === 0) throw notFound("Announcement not found");

    return ok({}, { message: "Announcement updated successfully" });
  },
  { access: "teacher" }
);

export const DELETE = route(
  async ({ db, user, query }) => {
    const _id = objectId(query.get("id"), "announcement id");
    const result = await db.collection("announcements").deleteOne({ _id, ...teacherFilter(user) });
    if (result.deletedCount === 0) throw notFound("Announcement not found");
    return ok({}, { message: "Announcement deleted successfully" });
  },
  { access: "teacher" }
);
