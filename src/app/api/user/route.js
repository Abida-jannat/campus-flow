import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("campus-flow");

    const user = await db.collection("user").findOne({
      email: session.user.email,
    });

    return NextResponse.json(user);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}

// নতুন PUT মেথড যা সেটিংস থেকে পাঠানো ডেটা (Student ID, Department, Name, Image) ডাটাবেসে সেভ করবে
export async function PUT(request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, studentId, department, image } = body;

    const client = await clientPromise;
    const db = client.db("campus-flow");

    // ডাটাবেসে ইউজারের তথ্য আপডেট করা
    const result = await db.collection("user").updateOne(
      { email: session.user.email },
      {
        $set: {
          name: name,
          studentId: studentId,
          department: department,
          image: image,
        },
      }
    );

    return NextResponse.json({ message: "Profile updated successfully", result });
  } catch (error) {
    console.log("PUT Error:", error);
    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}