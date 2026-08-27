import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

// ১. সব নোটিফিকেশন ও কাউন্ট ফেচ করা
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("campus-flow");

    const notifications = await db
      .collection("notifications")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({
      success: true,
      unreadCount,
      notifications,
      latestNotification: notifications[0] || null,
    });
  } catch (error) {
    console.error("GET Notifications Error:", error);
    return NextResponse.json({ success: false, unreadCount: 0, notifications: [] });
  }
}

// ২. নোটিফিকেশন ডিলেট করা (একটি একটি করে অথবা সবগুলো একসাথে)
export async function DELETE(request) {
  try {
    const client = await clientPromise;
    const db = client.db("campus-flow");

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      // একটি নির্দিষ্ট নোটিফিকেশন ডিলেট
      await db.collection("notifications").deleteOne({ _id: new ObjectId(id) });
      return NextResponse.json({ success: true, message: "Notification deleted" });
    } else {
      // সব নোটিফিকেশন একসাথে ডিলেট
      await db.collection("notifications").deleteMany({});
      return NextResponse.json({ success: true, message: "All notifications cleared" });
    }
  } catch (error) {
    console.error("DELETE Notifications Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete notification" },
      { status: 500 }
    );
  }
}