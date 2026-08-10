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

    // Courses
    const courses = await db
      .collection("courses")
      .find({
        department: user.department,
      })
      .toArray();

    // Attendance
    const attendance = await db
      .collection("attendance")
      .find({
        studentEmail: session.user.email,
      })
      .toArray();

    // Today's classes
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
    });

    const todayClasses = await db
      .collection("classSchedule")
      .find({
        department: user.department,
        day: today,
      })
      .toArray();

    // Latest Announcements
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