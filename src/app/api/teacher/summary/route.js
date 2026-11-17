import { getDb } from "@/lib/mongodb";
import { requireUser, json, todayName } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { user: teacher, error } = await requireUser({ role: "teacher" });
    if (error) return error;

    const db = await getDb();

    const courses = await db
      .collection("courses")
      .find({ teacher: teacher.name })
      .project({ department: 1, semester: 1 })
      .toArray();

    // One query for all unique dept+semester combos (was one query per combo).
    const combos = [...new Map(courses.map((c) => [`${c.department}|${c.semester}`, c])).values()].map((c) => ({
      department: c.department,
      semester: c.semester,
    }));

    const [studentCount, classesToday] = await Promise.all([
      combos.length ? db.collection("user").countDocuments({ role: "student", $or: combos }) : 0,
      db.collection("classSchedule").countDocuments({ teacher: teacher.name, day: todayName() }),
    ]);

    return json({
      success: true,
      teacher: {
        name: teacher.name,
        email: teacher.email,
        department: teacher.department,
        image: teacher.image || null,
      },
      stats: { courseCount: courses.length, studentCount, classesToday },
    });
  } catch (err) {
    console.error("Teacher Summary Error:", err);
    return json({ success: false, message: "Failed to load teacher summary" }, 500);
  }
}
