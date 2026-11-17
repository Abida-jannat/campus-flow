import { getDb } from "@/lib/mongodb";
import { requireUser, json } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { user, error } = await requireUser();
    if (error) return error;

    const db = await getDb();
    const doc = await db.collection("user").findOne({ email: user.email });
    return json(doc);
  } catch (err) {
    console.error("GET user error:", err);
    return json({ message: "Server Error" }, 500);
  }
}

export async function PUT(request) {
  try {
    const { user, error } = await requireUser();
    if (error) return error;

    const body = await request.json();
    const set = {};
    // Only write fields that were actually sent (before, missing fields were saved as null).
    if (typeof body.name === "string" && body.name.trim()) set.name = body.name.trim().slice(0, 100);
    if (typeof body.studentId === "string") set.studentId = body.studentId.trim().slice(0, 50);
    if (typeof body.department === "string") set.department = body.department.trim().slice(0, 100);
    if (typeof body.image === "string" || body.image === null) {
      if (body.image && body.image.length > 300_000) {
        return json({ message: "Image is too large" }, 413);
      }
      set.image = body.image;
    }
    if (Object.keys(set).length === 0) return json({ message: "Nothing to update" }, 400);

    const db = await getDb();
    await db.collection("user").updateOne({ email: user.email }, { $set: set });
    return json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("PUT user error:", err);
    return json({ message: "Server Error" }, 500);
  }
}
