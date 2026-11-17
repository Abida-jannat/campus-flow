import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireUser, json } from "@/lib/api";

export const dynamic = "force-dynamic";

// A notification belongs to this student (userId = email) or is a shared/global
// one (no userId). Global ones are "dismissed" per student, never deleted for everyone.
const visibleTo = (email) => ({
  $and: [
    { $or: [{ userId: email }, { userId: { $exists: false } }] },
    { dismissedBy: { $ne: email } },
  ],
});

export async function GET() {
  try {
    const { user, error } = await requireUser();
    if (error) return json({ success: false, unreadCount: 0, notifications: [] }, 401);

    const db = await getDb();
    const filter = visibleTo(user.email);

    const [notifications, unreadCount] = await Promise.all([
      db.collection("notifications").find(filter).sort({ createdAt: -1 }).limit(20).toArray(),
      db.collection("notifications").countDocuments({ ...filter, isRead: { $ne: true } }),
    ]);

    return json({
      success: true,
      unreadCount,
      notifications,
      latestNotification: notifications[0] || null,
    });
  } catch (err) {
    console.error("GET Notifications Error:", err);
    return json({ success: false, unreadCount: 0, notifications: [] }, 500);
  }
}

export async function DELETE(request) {
  try {
    const { user, error } = await requireUser();
    if (error) return error;

    const db = await getDb();
    const col = db.collection("notifications");
    const id = new URL(request.url).searchParams.get("id");

    if (id) {
      if (!ObjectId.isValid(id)) return json({ success: false, message: "Invalid id" }, 400);
      const _id = new ObjectId(id);
      await col.deleteOne({ _id, userId: user.email });
      await col.updateOne({ _id, userId: { $exists: false } }, { $addToSet: { dismissedBy: user.email } });
      return json({ success: true, message: "Notification deleted" });
    }

    await col.deleteMany({ userId: user.email });
    await col.updateMany({ userId: { $exists: false } }, { $addToSet: { dismissedBy: user.email } });
    return json({ success: true, message: "All notifications cleared" });
  } catch (err) {
    console.error("DELETE Notifications Error:", err);
    return json({ success: false, message: "Failed to delete notification" }, 500);
  }
}
