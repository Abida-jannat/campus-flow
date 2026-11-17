import { NextResponse } from "next/server";
import { getTeacherContext } from "@/lib/api";
import { ObjectId } from "mongodb";


export const dynamic = "force-dynamic";


const getTeacher = getTeacherContext;


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

  
    // The "enrollments" collection is never filled anywhere in the app, so every
    // announcement fell back to ONE global notification. Target the students of the
    // course's department + semester instead (same rule the Students page uses).
    const students = await db
      .collection("user")
      .find({ role: "student", department: course.department, semester: course.semester })
      .project({ email: 1 })
      .toArray();

    const now = new Date();
    if (students.length > 0) {
      await db.collection("notifications").insertMany(
        students.map((student) => ({
          userId: student.email,
          title: `New Announcement: ${course.courseName}`,
          message: message.trim(),
          link: "/dashboard/announcements",
          isRead: false,
          createdAt: now,
        }))
      );
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