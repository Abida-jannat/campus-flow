import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { courseCode, courseName, attendanceRecords, date } = await req.json();
    const client = await clientPromise;
    const db = client.db("campus-flow");

  
    for (const record of attendanceRecords) {
      const { studentEmail, status } = record; 

      
      const existing = await db.collection("attendance").findOne({
        studentEmail,
        courseCode,
      });

      let totalClasses = (existing?.totalClasses || 0) + 1;
      let attendedClasses = existing?.attendedClasses || 0;

    
      if (status === "present" || status === "late") {
        attendedClasses += 1;
      }

      const percentage = Math.round((attendedClasses / totalClasses) * 100);

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