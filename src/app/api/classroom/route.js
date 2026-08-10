import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const building = searchParams.get("building");
    const day = searchParams.get("day");
    const time = searchParams.get("time");

    if (!building || !day || !time) {
      return NextResponse.json(
        {
          success: false,
          message: "Building, day and time are required",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("campus-flow");

    const schedules = await db
      .collection("classSchedule")
      .find({
        building: building,
        day: day,
      })
      .toArray();

    // Find rooms that are occupied at the requested time
    const occupiedRooms = schedules
      .filter((schedule) => {
        return (
          time >= schedule.startTime &&
          time < schedule.endTime
        );
      })
      .map((schedule) => schedule.room);

  
    const allRooms = [
      ...new Set(
        schedules.map((schedule) => schedule.room)
      ),
    ];

    // Remove occupied rooms
    const availableRooms = allRooms.filter(
      (room) => !occupiedRooms.includes(room)
    );

    return NextResponse.json({
      success: true,
      building,
      day,
      time,
      availableRooms,
      occupiedRooms,
    });

  } catch (error) {
    console.error("Classroom API Error:", error);

    return  NextResponse.json(
      {
        success: false,
            message: "Server Error", 
        
      },
      { status: 500 }
    );
  }
}