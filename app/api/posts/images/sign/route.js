import { NextResponse } from "next/server";
import { getSignedPostImage } from "@/actions/getSignedPostImage";

export async function POST(req) {
  try {
    const body = await req.json();

    if (!body || typeof body.coverImagePath !== "string") {
      return NextResponse.json(
        { error: "Invalid image path" },
        { status: 400 },
      );
    }

    const signedUrl = await getSignedPostImage(body.coverImagePath);

    if (!signedUrl) {
      return NextResponse.json(
        { error: "Invalid image path" },
        { status: 400 },
      );
    }

    return NextResponse.json({ signedUrl }, { status: 200 });
  } catch (err) {
    console.error("Sign cover error:", err);

    return NextResponse.json(
      { error: "Failed to sign image" },
      { status: 500 },
    );
  }
}
