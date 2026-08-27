import { NextResponse } from "next/server";
import { headers } from "next/headers";
import clientPromise from "@/lib/mongodb";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("campus-flow");


    const student = await db.collection("users").findOne({ email: session.user.email });
    const studentDept = student?.department || "BBA"; 

   
    const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });

   
    const todaysClasses = await db
      .collection("classSchedule")
      .find({
        $and: [
          { day: { $regex: new RegExp(`^${todayName}$`, "i") } },
          {
            $or: [
              { department: { $regex: new RegExp(`^${studentDept}$`, "i") } },
              { department: { $exists: false } },
              { courseCode: { $regex: /^BBA/i } } // Fallback match for BBA courses
            ]
          }
        ]
      })
      .sort({ startTime: 1 })
      .toArray();

    return NextResponse.json({ success: true, todaysClasses });
  } catch (error) {
    console.error("GET Today's Classes Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}