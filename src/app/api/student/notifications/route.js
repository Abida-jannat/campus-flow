import { route, ok, objectId } from "@/lib/api";

// Notifications belong to ONE user (userId = email).
export const GET = route(async ({ db, user }) => {
  const col = db.collection("notifications");
  const [notifications, unreadCount] = await Promise.all([
    col.find({ userId: user.email }).sort({ createdAt: -1 }).limit(30).toArray(),
    col.countDocuments({ userId: user.email, isRead: false }),
  ]);

  return ok({ unreadCount, notifications, latestNotification: notifications[0] || null });
});

// Mark all of my notifications as read (called when the bell is opened).
export const PATCH = route(async ({ db, user }) => {
  await db
    .collection("notifications")
    .updateMany({ userId: user.email, isRead: false }, { $set: { isRead: true } });
  return ok({});
});

export const DELETE = route(async ({ db, user, query }) => {
  const id = query.get("id");

  if (id) {
    await db.collection("notifications").deleteOne({ _id: objectId(id, "notification id"), userId: user.email });
    return ok({}, { message: "Notification deleted" });
  }

  await db.collection("notifications").deleteMany({ userId: user.email });
  return ok({}, { message: "All notifications cleared" });
});
