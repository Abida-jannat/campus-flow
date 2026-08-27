
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import clientPromise from "@/lib/mongodb";
import { auth } from "@/lib/auth";

export async function POST(request) {
  try {
    
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }



    const body = await request.json();

    const { courseCode, records } = body;

    if (!courseCode) {
      return NextResponse.json(
        { success: false, message: "Course code is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { success: false, message: "Attendance records are required" },
        { status: 400 }
      );
    }


    const client = await clientPromise;
    const db = client.db("campus-flow");

  
    const teacher = await db.collection("user").findOne({
      email: session.user.email,
    });

    if (!teacher) {
      return NextResponse.json(
        { success: false, message: "Teacher not found" },
        { status: 404 }
      );
    }



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

    const date = new Date().toISOString().split("T")[0];

  
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

    const studentEmails = attendanceRecords.map((r) => r.studentEmail);

    
    await db.collection("attendance").deleteMany({
      teacherEmail: teacher.email,
      courseCode: courseCode,
      date: date,
      studentEmail: { $in: studentEmails },
    });

    // Insert daily logs
    await db.collection("attendance").insertMany(attendanceRecords);

   
    for (const record of records) {
      const { studentEmail, status } = record;

      // Check current aggregate status for student in this course
      const summary = await db.collection("summary_attendance").findOne({
        studentEmail,
        courseCode,
      });

      let totalClasses = (summary?.totalClasses || 0) + 1;
      let attendedClasses = summary?.attendedClasses || 0;

      if (status === "present" || status === "late") {
        attendedClasses += 1;
      }

      const percentage = Math.round((attendedClasses / totalClasses) * 100);

      await db.collection("summary_attendance").updateOne(
        { studentEmail, courseCode },
        {
          $set: {
            courseName: course.courseName || "",
            totalClasses,
            attendedClasses,
            percentage,
            lastUpdated: new Date(),
          },
        },
        { upsert: true }
      );
    }


    return NextResponse.json({
      success: true,
      message: "Attendance saved and percentages updated successfully",
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