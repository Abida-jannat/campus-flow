
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { user, db, error } = await requireUser();
    if (error) return error;

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

    const schedules = await db
      .collection("classSchedule")
      .find({ building, day })
      .project({ room: 1, startTime: 1, endTime: 1 })
      .toArray();

    const occupied = new Set(
      schedules
        .filter((s) => time >= s.startTime && time < s.endTime)
        .map((s) => s.room)
    );

    const allRooms = [...new Set(schedules.map((s) => s.room))];

    return NextResponse.json({
      success: true,
      building,
      day,
      time,
      availableRooms: allRooms.filter((r) => !occupied.has(r)),
      occupiedRooms: [...occupied],
    });

  } catch (err) {
    console.error("Classroom API Error:", err);

    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}
