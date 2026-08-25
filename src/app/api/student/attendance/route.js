import { NextResponse } from "next/server";
import { headers } from "next/headers";
import clientPromise from "@/lib/mongodb";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    
    const reqHeaders = await headers();
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    const studentEmail = session.user.email;
    
    const client = await clientPromise;
    const db = client.db("campus-flow")

    const records = await db
      .collection("attendance")
      .find({
        studentEmail: studentEmail,
      })
      .sort({
        date: -1,
      })
      .toArray();
    
    const courseMap = {};

    records.forEach((record) => {
      const courseCode = record.courseCode || "Unknown";
      const status = record.status?.toLowerCase() || "";

      if (!courseMap[courseCode]) {
        courseMap[courseCode] = {
          courseCode: courseCode,
          courseName: record.courseName || courseCode,

          present: 0,
          absent: 0,
          late: 0,
          total: 0,
        };
      }

      courseMap[courseCode].total += 1;

      if (status === "present") courseMap[courseCode].present += 1;
      if (status === "absent") courseMap[courseCode].absent += 1;
      if (status === "late") courseMap[courseCode].late += 1;
    });



    const courseAttendance = Object.values(courseMap).map((course) => {
      const percentage =
        course.total > 0
          ? Math.round((course.present / course.total) * 100)
          : 0;

      return {
        ...course,
        percentage,
      };
    });


    const overall = records.reduce(
      (acc, record) => {
        const status = record.status?.toLowerCase() || "";
        acc.total += 1;

        if (status === "present") acc.present += 1;
        if (status === "absent") acc.absent += 1;
        if (status === "late") acc.late += 1;

        return acc;
      },
      {
        present: 0,
        absent: 0,
        late: 0,
        total: 0,
      }
    );

    const overallPercentage =
      overall.total > 0
        ? Math.round((overall.present / overall.total) * 100)
        : 0;
    
    return NextResponse.json({
      success: true,

      student: {
        name: session.user.name,
        email: session.user.email,
      },

      records,

      courses: courseAttendance,

      overall: {
        present: overall.present,
        absent: overall.absent,
        late: overall.late,
        total: overall.total,
        percentage: overallPercentage,
      },
    });
  } catch (error) {
    console.error("Student Attendance Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load attendance",
      },
      { status: 500 }
    );
  }
}