import { getDb } from "@/lib/mongodb";
import { requireUser, json, todayISO } from "@/lib/api";

export const dynamic = "force-dynamic";

const VALID_STATUS = new Set(["present", "absent", "late"]);

export async function POST(request) {
  try {
    const { user: teacher, error } = await requireUser({ role: "teacher" });
    if (error) return error;

    const body = await request.json();
    const { courseCode, records } = body;

    if (!courseCode || typeof courseCode !== "string") {
      return json({ success: false, message: "Course code is required" }, 400);
    }
    if (!Array.isArray(records) || records.length === 0 || records.length > 500) {
      return json({ success: false, message: "Attendance records are required" }, 400);
    }

    const db = await getDb();

    const course = await db.collection("courses").findOne({ courseCode, teacher: teacher.name });
    if (!course) {
      return json({ success: false, message: "Course not found or does not belong to this teacher" }, 403);
    }

 
    const emails = [...new Set(records.map((r) => r?.studentEmail).filter((e) => typeof e === "string"))];
    const validStudents = await db
      .collection("user")
      .find({ role: "student", department: course.department, semester: course.semester, email: { $in: emails } })
      .project({ email: 1 })
      .toArray();
    const allowed = new Set(validStudents.map((s) => s.email));

    const clean = records.filter((r) => allowed.has(r?.studentEmail) && VALID_STATUS.has(String(r.status).toLowerCase()));
    if (clean.length === 0) {
      return json({ success: false, message: "No valid student records" }, 400);
    }

    const date = todayISO();
    const now = new Date();


    await db.collection("attendance").bulkWrite(
      clean.map((r) => ({
        updateOne: {
          filter: { courseCode: course.courseCode, studentEmail: r.studentEmail, date },
          update: {
            $set: {
              teacher: teacher.name,
              teacherEmail: teacher.email,
              courseName: course.courseName || "",
              status: String(r.status).toLowerCase(),
              updatedAt: now,
            },
            $setOnInsert: { createdAt: now },
          },
          upsert: true,
        },
      }))
    );


    const studentEmails = clean.map((r) => r.studentEmail);
    const totals = await db
      .collection("attendance")
      .aggregate([
        { $match: { courseCode: course.courseCode, studentEmail: { $in: studentEmails } } },
        { $addFields: { s: { $toLower: { $ifNull: ["$status", ""] } } } },
        {
          $group: {
            _id: "$studentEmail",
            totalClasses: { $sum: 1 },
            attendedClasses: { $sum: { $cond: [{ $in: ["$s", ["present", "late"]] }, 1, 0] } },
          },
        },
      ])
      .toArray();

    if (totals.length) {
      await db.collection("summary_attendance").bulkWrite(
        totals.map((t) => ({
          updateOne: {
            filter: { studentEmail: t._id, courseCode: course.courseCode },
            update: {
              $set: {
                courseName: course.courseName || "",
                totalClasses: t.totalClasses,
                attendedClasses: t.attendedClasses,
                percentage: Math.round((t.attendedClasses / t.totalClasses) * 100),
                lastUpdated: now,
              },
            },
            upsert: true,
          },
        }))
      );
    }

    return json({
      success: true,
      message: "Attendance saved and percentages updated successfully",
      count: clean.length,
    });
  } catch (err) {
    console.error("Save Attendance Error:", err);
    return json({ success: false, message: "Failed to save attendance" }, 500);
  }
}
