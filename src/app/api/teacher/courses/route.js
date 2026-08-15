import { NextResponse } from "next/server";
import { headers } from "next/headers";
import clientPromise from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

async function getTeacher() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const client = await clientPromise;
  const db = client.db("campus-flow");

  const teacher = await db.collection("user").findOne({
    email: session.user.email,
  });

  if (!teacher) {
    return null;
  }

  return { session, client, db, teacher };
}

/* =========================
   GET COURSES
========================= */

export async function GET() {
  try {
    const data = await getTeacher();

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated or teacher not found",
        },
        { status: 401 }
      );
    }

    const { db, teacher } = data;

    const courses = await db
      .collection("courses")
      .find({
        teacher: teacher.name,
      })
      .project({
        courseCode: 1,
        courseName: 1,
        department: 1,
        semester: 1,
        credit: 1,
        teacher: 1,
      })
      .sort({ courseCode: 1 })
      .toArray();

    // FIX: previously this response never included "teacher", so the
    // frontend's `data.teacher` was always undefined and the teacher info
    // card never rendered.
    return NextResponse.json({
      success: true,
      courses,
      teacher: {
        name: teacher.name,
        department: teacher.department,
        image: teacher.image || null,
      },
    });
  } catch (error) {
    console.error("GET Teacher Courses Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load courses",
      },
      { status: 500 }
    );
  }
}

/* =========================
   ADD COURSE
========================= */

export async function POST(request) {
  try {
    const data = await getTeacher();

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated or teacher not found",
        },
        { status: 401 }
      );
    }

    const { db, teacher } = data;

    const body = await request.json();

    const {
      courseCode,
      courseName,
      department,
      semester,
      credit,
    } = body;

    if (
      !courseCode ||
      !courseName ||
      !department ||
      !semester ||
      !credit
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "All course fields are required",
        },
        { status: 400 }
      );
    }

    const existingCourse = await db.collection("courses").findOne({
      courseCode: courseCode.trim(),
      teacher: teacher.name,
    });

    if (existingCourse) {
      return NextResponse.json(
        {
          success: false,
          message: "You already have this course",
        },
        { status: 409 }
      );
    }

    const newCourse = {
      courseCode: courseCode.trim(),
      courseName: courseName.trim(),
      department,
      semester,
      credit: Number(credit),
      teacher: teacher.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection("courses")
      .insertOne(newCourse);

    return NextResponse.json({
      success: true,
      message: "Course added successfully",
      course: {
        _id: result.insertedId,
        ...newCourse,
      },
    });
  } catch (error) {
    console.error("POST Teacher Course Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add course",
      },
      { status: 500 }
    );
  }
}

/* =========================
   UPDATE COURSE
========================= */

export async function PUT(request) {
  try {
    const data = await getTeacher();

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated or teacher not found",
        },
        { status: 401 }
      );
    }

    const { db, teacher } = data;

    const body = await request.json();

    const {
      id,
      courseCode,
      courseName,
      department,
      semester,
      credit,
    } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Course ID is required",
        },
        { status: 400 }
      );
    }

    if (
      !courseCode ||
      !courseName ||
      !department ||
      !semester ||
      !credit
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "All course fields are required",
        },
        { status: 400 }
      );
    }

    const updatedCourse = {
      courseCode: courseCode.trim(),
      courseName: courseName.trim(),
      department,
      semester,
      credit: Number(credit),
      updatedAt: new Date(),
    };

    const result = await db.collection("courses").updateOne(
      {
        _id: new ObjectId(id),
        teacher: teacher.name,
      },
      {
        $set: updatedCourse,
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Course not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Course updated successfully",
    });
  } catch (error) {
    console.error("PUT Teacher Course Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update course",
      },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE COURSE
========================= */

export async function DELETE(request) {
  try {
    const data = await getTeacher();

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated or teacher not found",
        },
        { status: 401 }
      );
    }

    const { db, teacher } = data;

    const { searchParams } = new URL(request.url);

    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Course ID is required",
        },
        { status: 400 }
      );
    }

    const result = await db.collection("courses").deleteOne({
      _id: new ObjectId(id),
      teacher: teacher.name,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Course not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("DELETE Teacher Course Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete course",
      },
      { status: 500 }
    );
  }
}