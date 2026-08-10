import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  try {
    
    const { searchParams } = new URL(request.url);

    const building = searchParams.get("building");

    const client = await clientPromise;
    const db = client.db("campusflow");

    const roomsCollection = db.collection("rooms");

    const query = building
      ? { building: building }
      : {};

    const rooms = await roomsCollection
      .find(query)
      .sort({ room: 1 })
      .toArray();

    return NextResponse.json({
      success: true,
      rooms,
    });

  } catch (error) {
    console.error("Rooms API Error:", error);

    return NextResponse.json(
      {
        
        success: false,
        message: "Failed to load rooms",

      },
      { status: 500 }
    );
  }
}