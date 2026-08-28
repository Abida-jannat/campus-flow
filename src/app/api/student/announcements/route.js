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

    // Fetch user department
    const dbUser = await db.collection("user").findOne({ email: session.user.email });
    const userDepartment = (dbUser?.department || session.user?.department || "").trim();

    let query = {};
    if (userDepartment) {
      query = {
        $or: [
          { department: { $regex: new RegExp(`^${userDepartment}$`, "i") } },
          { department: { $in: ["General", "general", "ALL", "all", "All"] } },
          { department: { $exists: false } },
          { department: "" }
        ]
      };
    }

    const announcements = await db
      .collection("announcements")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(30)
      .toArray();

   
    return NextResponse.json(
      {
        success: true,
        announcements: announcements,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-validate, proxy-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("GET Announcements Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load announcements" },
      { status: 500 }
    );
  }
}