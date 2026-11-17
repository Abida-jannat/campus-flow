import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { email, currentPassword, newPassword } = await req.json();

    const client = await clientPromise;
    const db = client.db("campus-flow");


    const user = await db.collection("user").findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }


    const account = await db.collection("account").findOne({
      userId: user._id.toString(),
      providerId: "credential",
    });

  
    if (!account || !account.password) {
      return NextResponse.json(
        { message: "This account was created with Google or has no password set." },
        { status: 400 }
      );
    }

  
    const isMatch = await bcrypt.compare(currentPassword, account.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Current password is incorrect" },
        { status: 400 }
      );
    }

  
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.collection("account").updateOne(
      { _id: account._id },
      { $set: { password: hashedPassword } }
    );

    return NextResponse.json(
      { success: true, message: "Password updated successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Server error during password update" },
      { status: 500 }
    );
  }
}