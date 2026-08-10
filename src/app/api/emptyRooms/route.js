import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db("campus-flow");

    const { searchParams } = new URL(request.url);

    const department = searchParams.get("department");
    const building = searchParams.get("building");
    const day = searchParams.get("day");
    const time = searchParams.get("time");

    // Base query
    const query = {
      available: true,
    };

    // Show department rooms + common rooms
    if (department) {
      query.$or = [
        { department: department },
        { department: "All" },
      ];
    }

    // Optional filters
    if (building) {
      query.building = building;
    }

    if (day) {
      query.day = day;
    }

    if (time) {
      query.time = time;
    }

    const rooms = await db
      .collection("emptyRooms")
      .find(query)
      .toArray();

    return NextResponse.json(rooms);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}