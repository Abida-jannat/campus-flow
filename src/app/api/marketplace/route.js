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
      .collection("marketplace")
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
    const { title, price, image, description, contactInfo } = body;

    if (!title || !price || !contactInfo) {
      return NextResponse.json(
        { success: false, message: "Title, Price, and Contact Info are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("campus-flow");

    const newItem = {
      title,
      price: Number(price),
      image: image || "", // Image URL
      description: description || "",
      contactInfo,
      userEmail: session.user.email,
      userName: session.user.name || "Student",
      status: "available",
      createdAt: new Date(),
    };

    const result = await db.collection("marketplace").insertOne(newItem);

    return NextResponse.json({
      success: true,
      message: "Product posted successfully!",
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

    // Only delete if the item exists and belongs to the logged-in user
    const result = await db.collection("marketplace").deleteOne({
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
      message: "Item deleted successfully!",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}