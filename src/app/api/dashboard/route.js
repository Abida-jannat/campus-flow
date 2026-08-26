import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("campus-flow");

    // Logged in user
    const user = await db.collection("user").findOne({
      email: session.user.email,
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Courses — FIX: added semester filter so this only counts courses
    // for the student's current semester, not every semester in the department
    const courses = await db
      .collection("courses")
      .find({
        department: user.department,
        semester: user.semester,
      })
      .toArray();

    // Attendance
    const attendance = await db
      .collection("attendance")
      .find({
        studentEmail: session.user.email,
      })
      .toArray();

    // Today's classes — FIX: added semester filter, same reason as above
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
    });

    const todayClasses = await db
      .collection("classSchedule")
      .find({
        department: user.department,
        semester: user.semester,
        day: today,
      })
      .toArray();

    // Latest Announcements
    // NOTE: announcements documents don't have a "department" field (they're
    // matched by courseCode instead — see /api/student/announcements), so
    // this array will always come back empty. Left as-is since the dashboard
    // page now fetches announcements separately from that dedicated route.
    const announcements = await db
      .collection("announcements")
      .find({
        $or: [
          { department: "All" },
          { department: user.department },
        ],
      })
      .sort({ date: -1 })
      .toArray();

    // Average Attendance
    let averageAttendance = 0;

    if (attendance.length > 0) {
      const total = attendance.reduce(
        (sum, item) => sum + item.percentage,
        0
      );

      averageAttendance = Math.round(
        total / attendance.length
      );
    }

    return NextResponse.json({
      user,
      attendance: averageAttendance,
      totalCourses: courses.length,
      courses,
      todayClasses,
      announcements,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}