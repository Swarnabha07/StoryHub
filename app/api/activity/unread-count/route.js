import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Activity from "@/models/Activity";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  await connectDB();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ count: 0 });
  }

  const count = await Activity.countDocuments({
    targetUser: session.user.id,
    isRead: false,
  });

  return NextResponse.json({ count });
}
