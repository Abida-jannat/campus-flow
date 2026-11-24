import { route, ok, created, objectId, notFound, conflict, badRequest } from "@/lib/api";
import { validate, courseSchema } from "@/lib/schemas";
import { teacherFilter, ci } from "@/lib/queries";

const teacherCard = (t) => ({ name: t.name, department: t.department, image: t.image || null });

// GET /api/teacher/courses
export const GET = route(
  async ({ db, user }) => {
    const courses = await db
      .collection("courses")
      .find(teacherFilter(user))
      .project({ courseCode: 1, courseName: 1, department: 1, semester: 1, credit: 1, teacher: 1, teacherEmail: 1 })
      .sort({ courseCode: 1 })
      .toArray();

    return ok({ courses, teacher: teacherCard(user) });
  },
  { access: "teacher" }
);

// POST /api/teacher/courses
export const POST = route(
  async ({ db, user, json }) => {
    const data = validate(await json(), courseSchema);

    const exists = await db
      .collection("courses")
      .findOne({ courseCode: ci(data.courseCode), ...teacherFilter(user) });
    if (exists) throw conflict("You already have a course with this code");

    const course = {
      ...data,
      teacher: user.name,
      teacherEmail: user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection("courses").insertOne(course);

    return created({ course: { _id: result.insertedId, ...course } }, { message: "Course added successfully" });
  },
  { access: "teacher" }
);

// PUT /api/teacher/courses   { id, courseCode, courseName, department, semester, credit }
// If the code/name/department/semester change, everything that points at the course follows.
export const PUT = route(
  async ({ db, user, json }) => {
    const body = await json();
    const _id = objectId(body?.id, "course id");
    const data = validate(body, courseSchema);

    const current = await db.collection("courses").findOne({ _id, ...teacherFilter(user) });
    if (!current) throw notFound("Course not found");

    if (data.courseCode !== current.courseCode) {
      const clash = await db.collection("courses").findOne({
        _id: { $ne: _id },
        courseCode: ci(data.courseCode),
        ...teacherFilter(user),
      });
      if (clash) throw conflict("You already have a course with this code");
    }

    await db
      .collection("courses")
      .updateOne({ _id }, { $set: { ...data, teacherEmail: user.email, updatedAt: new Date() } });

    const oldCode = current.courseCode;
    await Promise.all([
      db.collection("classSchedule").updateMany(
        { courseCode: oldCode, ...teacherFilter(user) },
        { $set: { courseCode: data.courseCode, courseName: data.courseName, department: data.department, semester: data.semester } }
      ),
      db
        .collection("announcements")
        .updateMany({ courseCode: oldCode, ...teacherFilter(user) }, { $set: { courseCode: data.courseCode, courseName: data.courseName } }),
      db
        .collection("attendance")
        .updateMany({ courseCode: oldCode, ...teacherFilter(user) }, { $set: { courseCode: data.courseCode, courseName: data.courseName } }),
    ]);

    return ok({}, { message: "Course updated successfully" });
  },
  { access: "teacher" }
);

// DELETE /api/teacher/courses?id=...
// Removes the course with its schedule and announcements. Attendance history is
// protected: delete it first (or pass &force=true) so records are never lost by accident.
export const DELETE = route(
  async ({ db, user, query }) => {
    const _id = objectId(query.get("id"), "course id");
    const course = await db.collection("courses").findOne({ _id, ...teacherFilter(user) });
    if (!course) throw notFound("Course not found");

    const force = query.get("force") === "true";
    const attendanceCount = await db.collection("attendance").countDocuments({ courseCode: course.courseCode });
    if (attendanceCount > 0 && !force) {
      throw conflict(
        `This course has ${attendanceCount} attendance records. Deleting it would erase them. Confirm to delete anyway.`,
        { attendanceCount }
      );
    }

    await Promise.all([
      db.collection("classSchedule").deleteMany({ courseCode: course.courseCode, ...teacherFilter(user) }),
      db.collection("announcements").deleteMany({ courseCode: course.courseCode, ...teacherFilter(user) }),
      force && attendanceCount > 0
        ? db.collection("attendance").deleteMany({ courseCode: course.courseCode })
        : null,
    ]);
    await db.collection("courses").deleteOne({ _id });

    return ok({}, { message: "Course deleted successfully" });
  },
  { access: "teacher" }
);
