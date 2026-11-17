import { getDb } from "@/lib/mongodb";
import { requireUser, json, ci } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { user, error } = await requireUser();
    if (error) return error;

    const db = await getDb();
    const dept = (user.department || "").trim();

    const schedule = await db
      .collection("classSchedule")
      .find({
        $or: dept
          ? [{ department: ci(dept) }, { department: { $exists: false } }]
          : [{ department: { $exists: false } }],
      })
      .sort({ startTime: 1 })
      .limit(300)
      .toArray();

    return json({ success: true, department: dept, schedule });
  } catch (err) {
    console.error("Fetch Schedule Error:", err);
    return json({ success: false, message: "Failed to load schedule" }, 500);
  }
}
