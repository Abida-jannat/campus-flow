import { NextResponse } from "next/server";
import { headers } from "next/headers";
import clientPromise from "@/lib/mongodb";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const teacherEmail = session.user.email;
    console.log("Session email:", teacherEmail);

    const client = await clientPromise;
    const db = client.db("campus-flow");

    const teacher = await db.collection("user").findOne({
      email: teacherEmail,
    });

    if (!teacher) {
      return NextResponse.json(
        {
          success: false,
          message: "Teacher not found",
        },
        { status: 404 }
      );
    }

    const courses = await db.collection("classSchedule").distinct(
      "courseCode",
      {
        teacher: teacher.name,
      }
    );

    const students = await db.collection("attendance").distinct(
      "studentEmail",
      {
        teacher: teacher.name,
      }
    );

    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
    });

    const classesToday = await db.collection("classSchedule").countDocuments({
      teacher: teacher.name,
      day: today,
    });

    return NextResponse.json({
      success: true,

      teacher: {
        name: teacher.name,
        email: teacher.email,
        department: teacher.department,
      },

      stats: {
        courseCount: courses.length,
        studentCount: students.length,
        classesToday: classesToday,
      },
    });

  } catch (error) {
    console.error("Teacher Summary Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load teacher summary",
      },
      { status: 500 }
    );
  }
}