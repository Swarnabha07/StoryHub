import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";

//for fetching user email preferences
export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(session.user.id).select(
      "emailPreferences",
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      emailPreferences: user.emailPreferences,
    });
  } catch (err) {
    console.error("Fetch email preferences error:", err);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

//for updating user email preferences
export async function PATCH(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const allowedFields = ["comments", "replies", "follows", "likes"];
    const updateFields = {};

    for (const key in body) {
      if (allowedFields.includes(key) && typeof body[key] === "boolean") {
        updateFields[`emailPreferences.${key}`] = body[key];
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided" },
        { status: 400 },
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updateFields },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      emailPreferences: updatedUser.emailPreferences,
    });
  } catch (err) {
    console.error("Email preferences update error:", err);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
