import { NextResponse } from "next/server";
import { headers } from "next/headers";
import clientPromise from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

async function getTeacher() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  const client = await clientPromise;
  const db = client.db("campus-flow");

  const teacher = await db.collection("user").findOne({ email: session.user.email });
  if (!teacher) return null;

  return { db, teacher };
}



export async function GET() {
  try {
    const data = await getTeacher();
    if (!data) {
      return NextResponse.json(
        { success: false, message: "Not authenticated or teacher not found" },
        { status: 401 }
      );
    }

    const { db, teacher } = data;

    const schedule = await db
      .collection("classSchedule")
      .find({ teacher: teacher.name })
      .sort({ day: 1, startTime: 1 })
      .toArray();

    return NextResponse.json({ success: true, schedule });
  } catch (error) {
    console.error("GET Schedule Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load schedule" },
      { status: 500 }
    );
  }
}



export async function POST(request) {
  try {
    const data = await getTeacher();
    if (!data) {
      return NextResponse.json(
        { success: false, message: "Not authenticated or teacher not found" },
        { status: 401 }
      );
    }

    const { db, teacher } = data;
    const body = await request.json();

    const { courseCode, days, startTime, endTime, building, floor, room, type } = body;

    
    if (
      !courseCode ||
      !Array.isArray(days) ||
      days.length === 0 ||
      !startTime ||
      !endTime ||
      !building ||
      !room
    ) {
      return NextResponse.json(
        { success: false, message: "All schedule fields are required, including at least one day" },
        { status: 400 }
      );
    }

    const course = await db.collection("courses").findOne({
      courseCode,
      teacher: teacher.name,
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found in your course list" },
        { status: 404 }
      );
    }

    const newEntries = days.map((day) => ({
      courseCode: course.courseCode,
      courseName: course.courseName,
      department: course.department,
      semester: course.semester,
      teacher: teacher.name,
      day,
      startTime,
      endTime,
      building,
      floor: floor || "",
      room,
      type: type || "Theory",
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const result = await db.collection("classSchedule").insertMany(newEntries);

    return NextResponse.json({
      success: true,
      message:
        newEntries.length > 1
          ? `Class added to schedule for ${newEntries.length} days`
          : "Class added to schedule",
      insertedCount: result.insertedCount,
    });
  } catch (error) {
    console.error("POST Schedule Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add schedule entry" },
      { status: 500 }
    );
  }
}


export async function PUT(request) {
  try {
    const data = await getTeacher();
    if (!data) {
      return NextResponse.json(
        { success: false, message: "Not authenticated or teacher not found" },
        { status: 401 }
      );
    }

    const { db, teacher } = data;
    const body = await request.json();

    const { id, day, startTime, endTime, building, floor, room, type } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Schedule entry ID is required" },
        { status: 400 }
      );
    }

    if (!day || !startTime || !endTime || !building || !room) {
      return NextResponse.json(
        { success: false, message: "All schedule fields are required" },
        { status: 400 }
      );
    }

    const result = await db.collection("classSchedule").updateOne(
      { _id: new ObjectId(id), teacher: teacher.name },
      {
        $set: {
          day,
          startTime,
          endTime,
          building,
          floor: floor || "",
          room,
          type: type || "Theory",
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Schedule entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Schedule updated successfully" });
  } catch (error) {
    console.error("PUT Schedule Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update schedule" },
      { status: 500 }
    );
  }
}



export async function DELETE(request) {
  try {
    const data = await getTeacher();
    if (!data) {
      return NextResponse.json(
        { success: false, message: "Not authenticated or teacher not found" },
        { status: 401 }
      );
    }

    const { db, teacher } = data;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Schedule entry ID is required" },
        { status: 400 }
      );
    }

    const result = await db.collection("classSchedule").deleteOne({
      _id: new ObjectId(id),
      teacher: teacher.name,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Schedule entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Schedule entry deleted" });
  } catch (error) {
    console.error("DELETE Schedule Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete schedule entry" },
      { status: 500 }
    );
  }
}