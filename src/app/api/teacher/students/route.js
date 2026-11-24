import { route, ok, notFound } from "@/lib/api";
import { teacherFilter } from "@/lib/queries";

const studentFields = { name: 1, email: 1, studentId: 1 };

export const GET = route(
  async ({ db, user, query }) => {
    const courseCode = query.get("courseCode");

    // Students of one course
    if (courseCode) {
      const course = await db.collection("courses").findOne({ courseCode, ...teacherFilter(user) });
      if (!course) throw notFound("Course not found");

      const students = await db
        .collection("user")
        .find({ role: "student", department: course.department, semester: course.semester })
        .project(studentFields)
        .sort({ name: 1 })
        .toArray();

      return ok({ students, course });
    }

    // All students across all of this teacher's courses (ONE query for all of them)
    const courses = await db.collection("courses").find(teacherFilter(user)).toArray();
    if (courses.length === 0) return ok({ students: [] });

    const groups = new Map();
    for (const c of courses) {
      const key = `${c.department}|${c.semester}`;
      if (!groups.has(key)) groups.set(key, { department: c.department, semester: c.semester, courses: [] });
      groups.get(key).courses.push({ courseCode: c.courseCode, courseName: c.courseName });
    }

    const found = await db
      .collection("user")
      .find({
        role: "student",
        $or: [...groups.values()].map(({ department, semester }) => ({ department, semester })),
      })
      .project({ ...studentFields, department: 1, semester: 1 })
      .toArray();

    const students = found
      .map((s) => ({
        name: s.name,
        email: s.email,
        studentId: s.studentId || "",
        courses: groups.get(`${s.department}|${s.semester}`)?.courses || [],
      }))
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    return ok({ students });
  },
  { access: "teacher" }
);
