import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createActivity } from "@/lib/activity/createActivity";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = session.user.id;
    const { id } = await params;
    const targetUserId = id;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 });
    }

    if (currentUserId === targetUserId) {
      return NextResponse.json(
        { error: "You cannot follow yourself" },
        { status: 400 },
      );
    }

    await connectDB();

    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(targetUserId),
    ]);

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      // UNFOLLOW
      currentUser.following.pull(targetUserId);
      targetUser.followers.pull(currentUserId);

      currentUser.followingCount -= 1;
      targetUser.followersCount -= 1;
    } else {
      // FOLLOW
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);

      currentUser.followingCount += 1;
      targetUser.followersCount += 1;

      await createActivity({
        actor: currentUserId,
        targetUser: targetUserId,
        type: "USER_FOLLOW",
      });
    }

    await Promise.all([currentUser.save(), targetUser.save()]);

    return NextResponse.json({
      isFollowing: !isFollowing,
      followersCount: targetUser.followersCount,
      followingCount: currentUser.followingCount,
    });
  } catch (err) {
    console.error("Follow error:", err);
    return NextResponse.json(
      { error: "Failed to update follow state" },
      { status: 500 },
    );
  }
}
