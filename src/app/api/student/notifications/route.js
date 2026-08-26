import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("campus-flow");

    const unreadCount = await db.collection("notifications").countDocuments({ isRead: false });


    const latestNotification = await db
      .collection("notifications")
      .findOne({}, { sort: { createdAt: -1 } });

    return NextResponse.json({
      success: true,
      unreadCount,
      latestNotification,
    });
  } catch (error) {
    console.error("GET Notifications Error:", error);
    return NextResponse.json({ success: false, unreadCount: 0 });
  }
}