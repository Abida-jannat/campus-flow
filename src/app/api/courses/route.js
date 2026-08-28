import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
export async function GET(request) {

  try {

    const client = await clientPromise;
    const db = client.db("campus-flow");
      const { searchParams } = new URL(request.url);
    const department = searchParams.get("department");
    const semester = searchParams.get("semester");
    let query = {};
    if (department) {
      query.department = { $regex: new RegExp(`^${department}$`, "i") };
    }
    if (semester) {
      query.semester = semester;
    }
    const courses = await db.collection("courses").find(query).toArray();
    return NextResponse.json(courses, { status: 200 });

  } catch (error) {

    return NextResponse.json({ message: error.message }, { status: 500 });

  }

}

export async function POST(request) {

    try {

        const session = await auth.api.getSession({

            headers: await headers(),

        });
        if (!session?.user) {

            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        }

        const body = await request.json();

        const { title, code, department, semester, instructor, totalClasses } = body;



        const client = await clientPromise;

        const db = client.db("campus-flow");



        const newCourse = {

            title,

            code,

            department,

            semester,

            instructor: instructor || session.user.name,

            totalClasses: totalClasses || 20,

            completedClasses: 0,

            progress: 0,

            status: "Ongoing",

            createdAt: new Date(),

        };



        const result = await db.collection("courses").insertOne(newCourse);



        return NextResponse.json(

            { message: "Course added successfully", courseId: result.insertedId },

            { status: 201 }

        );

    } catch (error) {

        return NextResponse.json({ message: error.message }, { status: 500 });

    }
}