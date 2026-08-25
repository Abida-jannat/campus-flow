import { NextResponse } from "next/server";
import { headers } from "next/headers";
import clientPromise from "@/lib/mongodb";
import { auth } from "@/lib/auth";

export async function GET(req) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("campus-flow");

    const teacher = await db.collection("user").findOne({ email: session.user.email });
    if (!teacher) {
      return NextResponse.json({ success: false, message: "Teacher not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const courseCode = searchParams.get("courseCode");

    if (courseCode) {
      
      const course = await db.collection("courses").findOne({ courseCode });
      if (!course) {
        return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 });
      }

      const students = await db
        .collection("user")
        .find({ role: "student", department: course.department, semester: course.semester })
        .project({ name: 1, email: 1, studentId: 1 })
        .toArray();

      return NextResponse.json({ success: true, students, course });
    }

  
    const courses = await db.collection("courses").find({ teacher: teacher.name }).toArray();

    if (courses.length === 0) {
      return NextResponse.json({ success: true, students: [] });
    }

    // Build a set of unique department+semester combos across all courses,
    // so we don't run duplicate queries for courses that share the same combo.
    const comboMap = new Map();
    for (const course of courses) {
      const key = `${course.department}|${course.semester}`;
      if (!comboMap.has(key)) {
        comboMap.set(key, { department: course.department, semester: course.semester, courses: [] });
      }
      comboMap.get(key).courses.push({ courseCode: course.courseCode, courseName: course.courseName });
    }

    const studentMap = new Map(); // email -> { name, email, studentId, courses: [] }

    for (const combo of comboMap.values()) {
      const students = await db
        .collection("user")
        .find({ role: "student", department: combo.department, semester: combo.semester })
        .project({ name: 1, email: 1, studentId: 1 })
        .toArray();

      for (const student of students) {
        if (!studentMap.has(student.email)) {
          studentMap.set(student.email, {
            name: student.name,
            email: student.email,
            studentId: student.studentId || "",
            courses: [],
          });
        }
        // Attach this combo's courses to the student (dedupe by courseCode)
        const entry = studentMap.get(student.email);
        for (const c of combo.courses) {
          if (!entry.courses.some((existing) => existing.courseCode === c.courseCode)) {
            entry.courses.push(c);
          }
        }
      }
    }

    const allStudents = Array.from(studentMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    return NextResponse.json({ success: true, students: allStudents });
  } catch (error) {
    console.error("Teacher Students Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load students" },
      { status: 500 }
    );
  }
}