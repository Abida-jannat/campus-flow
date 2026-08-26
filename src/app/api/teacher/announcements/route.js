import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { ObjectId } from "mongodb";

import clientPromise from "@/lib/mongodb";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function getTeacher() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  if (!session?.user?.email) {
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

    // Fetch announcements filtered by teacher name or email
    const announcements = await db
      .collection("announcements")
      .find({
        $or: [{ teacherEmail: teacher.email }, { teacher: teacher.name }],
      })
      .sort({ createdAt: -1 })
      .toArray();

    if (announcements.length === 0) {
      return NextResponse.json({ success: true, announcements: [] });
    }

    // Single query batch fetch to prevent N+1 overhead
    const courseCodes = [...new Set(announcements.map((a) => a.courseCode))];

    const courses = await db
      .collection("courses")
      .find({
        courseCode: { $in: courseCodes },
        $or: [{ teacherEmail: teacher.email }, { teacher: teacher.name }],
      })
      .toArray();

    const courseMap = new Map(courses.map((c) => [c.courseCode, c]));

    const announcementsWithCourse = announcements.map((announcement) => {
      const course = courseMap.get(announcement.courseCode);

      return {
        ...announcement,
        courseName: announcement.courseName || course?.courseName || "",
        department: course?.department || "",
        semester: course?.semester || "",
      };
    });

    return NextResponse.json({
      success: true,
      announcements: announcementsWithCourse,
    });
  } catch (error) {
    console.error("GET Teacher Announcements Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load announcements" },
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
    const { courseCode, message } = body;

    if (!courseCode || !courseCode.trim()) {
      return NextResponse.json(
        { success: false, message: "Course is required" },
        { status: 400 }
      );
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, message: "Announcement message is required" },
        { status: 400 }
      );
    }

    if (message.trim().length > 1000) {
      return NextResponse.json(
        {
          success: false,
          message: "Announcement message cannot exceed 1000 characters",
        },
        { status: 400 }
      );
    }

    // Verify course belongs to teacher
    const course = await db.collection("courses").findOne({
      courseCode: courseCode.trim(),
      $or: [{ teacherEmail: teacher.email }, { teacher: teacher.name }],
    });

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          message: "Course not found or you do not teach this course",
        },
        { status: 404 }
      );
    }

    const newAnnouncement = {
      courseCode: course.courseCode,
      courseName: course.courseName,
      message: message.trim(),
      teacher: teacher.name,
      teacherName: teacher.name,
      teacherEmail: teacher.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection("announcements")
      .insertOne(newAnnouncement);

    // --- নোটিফিকেশন লজিক যুক্ত করা হলো ---
    const enrolledStudents = await db
      .collection("enrollments")
      .find({ courseCode: course.courseCode })
      .toArray();

    if (enrolledStudents.length > 0) {
      const notifications = enrolledStudents.map((student) => ({
        userId: student.studentEmail,
        title: `New Announcement: ${course.courseName}`,
        message: message.trim(),
        link: "/dashboard/announcements",
        isRead: false,
        createdAt: new Date(),
      }));

      await db.collection("notifications").insertMany(notifications);
    } else {
      // যদি enrollments ফোল্ডারে ডাটা না থাকে, তবুও জেনারেট করে রাখবে
      await db.collection("notifications").insertOne({
        title: `New Announcement: ${course.courseName}`,
        message: message.trim(),
        link: "/dashboard/announcements",
        isRead: false,
        createdAt: new Date(),
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Announcement published successfully",
        announcement: {
          _id: result.insertedId,
          ...newAnnouncement,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Teacher Announcement Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create announcement" },
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
    const { id, courseCode, message } = body;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Valid Announcement ID is required" },
        { status: 400 }
      );
    }

    if (!courseCode || !courseCode.trim()) {
      return NextResponse.json(
        { success: false, message: "Course is required" },
        { status: 400 }
      );
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, message: "Announcement message is required" },
        { status: 400 }
      );
    }

    if (message.trim().length > 1000) {
      return NextResponse.json(
        {
          success: false,
          message: "Announcement message cannot exceed 1000 characters",
        },
        { status: 400 }
      );
    }

    const course = await db.collection("courses").findOne({
      courseCode: courseCode.trim(),
      $or: [{ teacherEmail: teacher.email }, { teacher: teacher.name }],
    });

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          message: "Course not found or you do not teach this course",
        },
        { status: 404 }
      );
    }

    const updatedData = {
      courseCode: course.courseCode,
      courseName: course.courseName,
      message: message.trim(),
      updatedAt: new Date(),
    };

    const result = await db.collection("announcements").updateOne(
      {
        _id: new ObjectId(id),
        $or: [{ teacherEmail: teacher.email }, { teacher: teacher.name }],
      },
      { $set: updatedData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Announcement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Announcement updated successfully",
    });
  } catch (error) {
    console.error("PUT Teacher Announcement Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update announcement" },
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

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Valid Announcement ID is required" },
        { status: 400 }
      );
    }

    const result = await db.collection("announcements").deleteOne({
      _id: new ObjectId(id),
      $or: [{ teacherEmail: teacher.email }, { teacher: teacher.name }],
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Announcement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    console.error("DELETE Teacher Announcement Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete announcement" },
      { status: 500 }
    );
  }
}