import { NextResponse } from "next/server";
import { getSignedPostImage } from "@/actions/getSignedPostImage";

export async function POST(req) {
  try {
    const { coverImagePath } = await req.json();

    if (!coverImagePath) {
      return NextResponse.json({ error: "Path required" }, { status: 400 });
    }

    const signedUrl = await getSignedPostImage(coverImagePath);

    return NextResponse.json({ signedUrl }, { status: 200 });
  } catch (err) {
    console.error("Sign cover error:", err);
    return NextResponse.json(
      { error: "Failed to sign image" },
      { status: 500 }
    );
  }
}
