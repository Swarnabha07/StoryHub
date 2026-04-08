import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Activity from "@/models/Activity";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({}, { status: 401 });

  const { ids } = await req.json(); // array of activity IDs

  await Activity.updateMany(
    {
      _id: { $in: ids },
      targetUser: session.user.id,
      isRead: false,
    },
    { $set: { isRead: true } },
  );

  return NextResponse.json({ success: true });
}
