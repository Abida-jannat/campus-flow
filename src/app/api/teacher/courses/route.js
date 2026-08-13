import { NextResponse } from "next/server";
import { headers } from "next/headers";
import clientPromise from "@/lib/mongodb";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("campus-flow");

    const teacher = await db.collection("user").findOne({ email: session.user.email });
    if (!teacher) {
      return NextResponse.json({ success: false, message: "Teacher not found" }, { status: 404 });
    }

    const courses = await db
      .collection("courses")
      .find({ teacher: teacher.name })
      .project({ courseCode: 1, courseName: 1, department: 1, semester: 1, credit: 1 })
      .toArray();

    return NextResponse.json({ success: true, courses });
  } catch (error) {
    console.error("Teacher Courses Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load courses" },
      { status: 500 }
    );
  }
}