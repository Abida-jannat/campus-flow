import { getDb } from "@/lib/mongodb";
import { requireUser, json, ci } from "@/lib/api";

export const dynamic = "force-dynamic";


export async function GET(request) {
  try {
    const { user, error } = await requireUser();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const mine = searchParams.get("mine") === "1";
    const department = mine ? user.department : searchParams.get("department");
    const semester = mine ? user.semester : searchParams.get("semester");

    const query = {};
    if (department) query.department = ci(department);
    if (semester) query.semester = semester;

  
    if (mine && !department) return json([]);

    const db = await getDb();
    const courses = await db.collection("courses").find(query).limit(200).toArray();
    return json(courses);
  } catch (err) {
    console.error("GET courses error:", err);
    return json({ message: "Failed to load courses" }, 500);
  }
}
