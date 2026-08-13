import { NextResponse } from "next/server";
import { headers } from "next/headers";
import clientPromise from "@/lib/mongodb";
import { auth } from "@/lib/auth";

export async function GET(req) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseCode = searchParams.get("courseCode");

    if (!courseCode) {
      return NextResponse.json(
        { success: false, message: "courseCode is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("campus-flow");

    // Find the course first, so we know which department + semester to match students against
    const course = await db.collection("courses").findOne({ courseCode });
    if (!course) {
      return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 });
    }

    const students = await db
      .collection("user")
      .find({
        role: "student",
        department: course.department,
        semester: course.semester,
      })
      .project({ name: 1, email: 1, studentId: 1 })
      .toArray();

    return NextResponse.json({ success: true, students, course });
  } catch (error) {
    console.error("Teacher Students Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load students" },
      { status: 500 }
    );
  }
}