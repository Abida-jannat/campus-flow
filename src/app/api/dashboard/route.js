import { getDb } from "@/lib/mongodb";
import { requireUser, json, ci, todayName } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { user, error } = await requireUser();
    if (error) return error;

    const db = await getDb();
    const dept = (user.department || "").trim();
    const sem = user.semester;

    const courseQuery = { department: ci(dept) };
    if (sem) courseQuery.semester = sem;

    const classAnd = [
      { day: ci(todayName()) },
      { $or: dept ? [{ department: ci(dept) }, { department: { $exists: false } }] : [{ department: { $exists: false } }] },
    ];
    if (sem) classAnd.push({ $or: [{ semester: sem }, { semester: { $exists: false } }] });

  
    const [totalCourses, attendanceAgg, todayClasses] = await Promise.all([
      dept ? db.collection("courses").countDocuments(courseQuery) : 0,
      db
        .collection("attendance")
        .aggregate([
          { $match: { studentEmail: user.email } },
          { $addFields: { s: { $toLower: { $ifNull: ["$status", ""] } } } },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              attended: { $sum: { $cond: [{ $in: ["$s", ["present", "late"]] }, 1, 0] } },
            },
          },
        ])
        .toArray(),
      db.collection("classSchedule").find({ $and: classAnd }).sort({ startTime: 1 }).limit(20).toArray(),
    ]);

    const a = attendanceAgg[0];
    const attendance = a && a.total > 0 ? Math.round((a.attended / a.total) * 100) : 0;

    return json({ success: true, attendance, totalCourses, todayClasses });
  } catch (err) {
    console.error("Dashboard API Error:", err);
    return json({ success: false, message: "Failed to load dashboard" }, 500);
  }
}
