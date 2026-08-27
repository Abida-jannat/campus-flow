import { NextResponse } from "next/server";
import { headers } from "next/headers";
import clientPromise from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";


export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("campus-flow");

    const items = await db
      .collection("lost_found")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, items });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}


export async function POST(request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, type, image, description, contactInfo } = body;

    if (!title || !contactInfo) {
      return NextResponse.json(
        { success: false, message: "Title and Contact Info are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("campus-flow");

    const newItem = {
      title,
      type: type || "lost", // "lost" or "found"
      image: image || "",
      description: description || "",
      contactInfo,
      userEmail: session.user.email,
      userName: session.user.name || "Student",
      createdAt: new Date(),
    };

    const result = await db.collection("lost_found").insertOne(newItem);

    return NextResponse.json({
      success: true,
      message: "Report published successfully!",
      itemId: result.insertedId,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}


export async function DELETE(request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Item ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("campus-flow");

    const result = await db.collection("lost_found").deleteOne({
      _id: new ObjectId(id),
      userEmail: session.user.email,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Item not found or permission denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Report deleted successfully!",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}