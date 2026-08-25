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

    const client = await clientPromise;
    const db = client.db("campus-flow");

    const teacher = await db.collection("user").findOne({
      email: teacherEmail,
    });

    if (!teacher) {
      return NextResponse.json(
        { success: false, message: "Teacher not found" },
        { status: 404 }
      );
    }

    const courses = await db.collection("courses").find({ teacher: teacher.name }).toArray();

    // FIX: studentCount used to come from attendance.distinct("studentEmail"),
    // which only counted students AFTER attendance had been taken at least
    // once. Now it matches the same department/semester logic the Students
    // page and attendance page use, so the count is accurate immediately.
    const comboSeen = new Set();
    const studentEmails = new Set();

    for (const course of courses) {
      const comboKey = `${course.department}|${course.semester}`;
      if (comboSeen.has(comboKey)) continue;
      comboSeen.add(comboKey);

      const students = await db
        .collection("user")
        .find({ role: "student", department: course.department, semester: course.semester })
        .project({ email: 1 })
        .toArray();

      students.forEach((s) => studentEmails.add(s.email));
    }

    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

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
        image: teacher.image || null,
      },
      stats: {
        courseCount: courses.length,
        studentCount: studentEmails.size,
        classesToday,
      },
    });
  } catch (error) {
    console.error("Teacher Summary Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load teacher summary" },
      { status: 500 }
    );
  }
}