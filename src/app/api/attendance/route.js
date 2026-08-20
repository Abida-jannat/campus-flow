 
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import clientPromise from "@/lib/mongodb";
import { auth } from "@/lib/auth";

export async function POST(request) {
  try {
    // ==============================
    // CHECK TEACHER SESSION
    // ==============================

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    // ==============================
    // GET REQUEST DATA
    // ==============================

    const body = await request.json();

    const { courseCode, records } = body;

    if (!courseCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Course code is required",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Attendance records are required",
        },
        { status: 400 }
      );
    }

    // ==============================
    // CONNECT DATABASE
    // ==============================

    const client = await clientPromise;
    const db = client.db("campus-flow");

    // ==============================
    // FIND TEACHER
    // ==============================

    const teacher = await db.collection("user").findOne({
      email: session.user.email,
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

    // ==============================
    // VERIFY COURSE BELONGS TO TEACHER
    // ==============================

    const course = await db.collection("courses").findOne({
      courseCode: courseCode,
      teacher: teacher.name,
    });

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          message: "Course not found or does not belong to this teacher",
        },
        { status: 403 }
      );
    }

    // ==============================
    // TODAY
    // ==============================

    const now = new Date();

    const date = now.toISOString().split("T")[0];

    // ==============================
    // PREPARE ATTENDANCE RECORDS
    // ==============================

    const attendanceRecords = records.map((record) => ({
      teacher: teacher.name,
      teacherEmail: teacher.email,

      courseCode: course.courseCode,
      courseName: course.courseName || "",

      studentEmail: record.studentEmail,
      status: record.status,

      date: date,

      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // ==============================
    // REMOVE OLD RECORDS
    // ==============================

    const studentEmails = attendanceRecords.map(
      (record) => record.studentEmail
    );

    await db.collection("attendance").deleteMany({
      teacherEmail: teacher.email,
      courseCode: courseCode,
      date: date,
      studentEmail: {
        $in: studentEmails,
      },
    });

    // ==============================
    // INSERT NEW RECORDS
    // ==============================

    await db.collection("attendance").insertMany(attendanceRecords);

    // ==============================
    // SUCCESS
    // ==============================

    return NextResponse.json({
      success: true,
      message: "Attendance saved successfully",
      count: attendanceRecords.length,
    });
  } catch (error) {
    console.error("Save Attendance Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save attendance",
        error: error.message,
      },
      { status: 500 }
    );
  }
}