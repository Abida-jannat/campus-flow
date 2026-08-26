import { NextResponse } from "next/server";
import { headers } from "next/headers";
import clientPromise from "@/lib/mongodb";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("campus-flow");


    const announcements = await db
      .collection("announcements")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      announcements: announcements,
    });
  } catch (error) {
    console.error("GET Announcements Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load announcements" },
      { status: 500 }
    );
  }
}