import { getDb } from "@/lib/mongodb";
import { requireUser, json } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { user: teacher, error } = await requireUser({ role: "teacher" });
    if (error) return error;

    const db = await getDb();
    const courseCode = new URL(req.url).searchParams.get("courseCode");

    if (courseCode) {
      // Must be one of THIS teacher's courses (before, any course code worked).
      const course = await db.collection("courses").findOne({ courseCode, teacher: teacher.name });
      if (!course) return json({ success: false, message: "Course not found" }, 404);

      const students = await db
        .collection("user")
        .find({ role: "student", department: course.department, semester: course.semester })
        .project({ name: 1, email: 1, studentId: 1 })
        .toArray();

      return json({ success: true, students, course });
    }

    const courses = await db.collection("courses").find({ teacher: teacher.name }).toArray();
    if (courses.length === 0) return json({ success: true, students: [] });

    const combos = [...new Map(courses.map((c) => [`${c.department}|${c.semester}`, c])).values()].map((c) => ({
      department: c.department,
      semester: c.semester,
    }));

    // Single query for every student across all combos.
    const users = await db
      .collection("user")
      .find({ role: "student", $or: combos })
      .project({ name: 1, email: 1, studentId: 1, department: 1, semester: 1 })
      .toArray();

    const students = users
      .map((u) => ({
        name: u.name,
        email: u.email,
        studentId: u.studentId || "",
        courses: courses
          .filter((c) => c.department === u.department && c.semester === u.semester)
          .map((c) => ({ courseCode: c.courseCode, courseName: c.courseName })),
      }))
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    return json({ success: true, students });
  } catch (err) {
    console.error("Teacher Students Error:", err);
    return json({ success: false, message: "Failed to load students" }, 500);
  }
}
