import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("campus-flow");
    const userEmail = session.user.email;

    // 1. Fetch Logged-in User (Checking both "user" and "users" collections for safety)
    let user = await db.collection("users").findOne({ email: userEmail });
    if (!user) {
      user = await db.collection("user").findOne({ email: userEmail });
    }

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const userDept = user.department || "BBA";
    const userSem = user.semester;

    // 2. Courses Filter
    const courseQuery = {
      department: { $regex: new RegExp(`^${userDept}$`, "i") },
    };
    if (userSem) {
      courseQuery.semester = userSem;
    }

    const courses = await db
      .collection("courses")
      .find(courseQuery)
      .toArray();

    // 3. Attendance Calculation
    const attendance = await db
      .collection("attendance")
      .find({ studentEmail: userEmail })
      .toArray();

    let averageAttendance = 85; // Fallback default
    if (attendance.length > 0) {
      const total = attendance.reduce(
        (sum, item) => sum + (item.percentage || 0),
        0
      );
      averageAttendance = Math.round(total / attendance.length);
    }

    // 4. Today's Classes Fix (Flexible regex matching for Department & Day)
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
    });

    const classQuery = {
      $and: [
        { day: { $regex: new RegExp(`^${today}$`, "i") } },
        {
          $or: [
            { department: { $regex: new RegExp(`^${userDept}$`, "i") } },
            { department: { $exists: false } },
            { courseCode: { $regex: /^BBA/i } }
          ]
        }
      ]
    };

    // Include semester filter only if it exists on schedule documents
    if (userSem) {
      classQuery.$and.push({
        $or: [{ semester: userSem }, { semester: { $exists: false } }]
      });
    }

    const todayClasses = await db
      .collection("classSchedule")
      .find(classQuery)
      .sort({ startTime: 1 })
      .toArray();

    // 5. Announcements
    const announcements = await db
      .collection("announcements")
      .find({
        $or: [
          { department: "All" },
          { department: { $regex: new RegExp(`^${userDept}$`, "i") } },
        ],
      })
      .sort({ date: -1 })
      .toArray();

    // Response structure supporting multiple key styles
    return NextResponse.json({
      user,
      attendance: averageAttendance,
      totalCourses: courses.length,
      courses,
      todayClasses,       // camelCase
      todaysClasses: todayClasses, // alias for safety
      TodayClasses: todayClasses,  // PascalCase alias
      announcements,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}