import { getDb } from "@/lib/mongodb";
import { requireUser, json, ci } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { user, error } = await requireUser();
    if (error) return error;

    const db = await getDb();
    const dept = (user.department || "").trim();

    let query = {};
    if (dept) {
      query = {
        $or: [
          { department: ci(dept) },
          { department: { $in: ["General", "general", "ALL", "all", "All"] } },
          { department: { $exists: false } },
          { department: "" },
        ],
      };
    }

    const announcements = await db
      .collection("announcements")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(30)
      .toArray();

    return json(
      { success: true, announcements },
      200,
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (err) {
    console.error("GET Announcements Error:", err);
    return json({ success: false, message: "Failed to load announcements" }, 500);
  }
}
