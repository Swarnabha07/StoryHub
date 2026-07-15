import { getServerSession } from "next-auth";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const preferenceMap = {
  "email-preferences": "emailPreferences",
  "in-app-preferences": "inAppPreferences",
};

const allowedFields = ["comments", "replies", "follows", "likes"];

// GET
export async function GET(req, { params }) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { preferenceType } = await params;

    const preferenceKey = preferenceMap[preferenceType];

    if (!preferenceKey) {
      return NextResponse.json(
        { error: "Invalid preference type" },
        { status: 400 },
      );
    }

    const user = await User.findById(session.user.id).select(preferenceKey);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      preferences: user[preferenceKey],
    });
  } catch (err) {
    console.error("Preference fetch error:", err);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

// PATCH
export async function PATCH(req, { params }) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { preferenceType } = await params;

    const preferenceKey = preferenceMap[preferenceType];

    if (!preferenceKey) {
      return NextResponse.json(
        { error: "Invalid preference type" },
        { status: 400 },
      );
    }

    const body = await req.json();

    const updateFields = {};

    for (const key in body) {
      if (allowedFields.includes(key) && typeof body[key] === "boolean") {
        updateFields[`${preferenceKey}.${key}`] = body[key];
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
      {
        $set: updateFields,
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    return NextResponse.json({
      success: true,
      preferences: updatedUser[preferenceKey],
    });
  } catch (err) {
    console.error("Preference update error:", err);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
