import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";
import { connectDB } from "@/lib/db";

export async function POST() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updated = await User.findByIdAndUpdate(session.user.id, {
      $inc: { sessionVersion: 1 },
    });

    if (!updated) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error("Logout error:", error);

    return Response.json({ error: "Logout failed" }, { status: 500 });
  }
}
