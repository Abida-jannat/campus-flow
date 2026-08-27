import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { courseCode, courseName, attendanceRecords, date } = await req.json();
    const client = await clientPromise;
    const db = client.db("campus-flow");

    // Loop through each student attendance entry
    for (const record of attendanceRecords) {
      const { studentEmail, status } = record; // status: "present", "late", or "absent"

      // Check existing attendance record for this student and course
      const existing = await db.collection("attendance").findOne({
        studentEmail,
        courseCode,
      });

      let totalClasses = (existing?.totalClasses || 0) + 1;
      let attendedClasses = existing?.attendedClasses || 0;

      // Increment attended count if Present or Late
      if (status === "present" || status === "late") {
        attendedClasses += 1;
      }

      // Calculate percentage
      const percentage = Math.round((attendedClasses / totalClasses) * 100);

      // Update or Insert into 'attendance' collection
      await db.collection("attendance").updateOne(
        { studentEmail, courseCode },
        {
          $set: {
            courseName: courseName || "Accounting",
            totalClasses,
            attendedClasses,
            percentage,
            lastDate: date || new Date().toISOString(),
          },
          $push: {
            history: {
              date: date || new Date().toISOString(),
              status,
            },
          },
        },
        { upsert: true }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Attendance recorded successfully!",
    });
  } catch (error) {
    console.error("Save Attendance Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}