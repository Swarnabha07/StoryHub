import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getUserConnections } from "@/lib/connections/getFollowersOrFollowing";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getMutualFollowers } from "@/lib/connections/getMutualFollowers";
import { getSuggestedUsers } from "@/lib/connections/getSuggestedUsers";
import { attachProfileImages } from "@/lib/attachProfileImages";

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username, type } = await params;
  const { searchParams } = req.nextUrl;
  const cursor = searchParams.get("cursor");

  if (!["followers", "following", "mutuals", "suggested"].includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  let result;

  if (type === "followers" || type === "following") {
    result = await getUserConnections({
      username,
      type,
      viewerId: session?.user?.id,
      cursor,
      limit: 10,
    });
  } else if (type === "mutuals") {
    result = await getMutualFollowers({
      username,
      viewerId: session.user.id,
      cursor,
      limit: 10,
    });
  } else if (type === "suggested") {
    result = await getSuggestedUsers({
      viewerId: session.user.id,
      cursor,
      limit: 10,
    });
  }

  if (!result) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // 1. Process the main users list with images
  const updatedUsers = await attachProfileImages(result.users);

  // 2. Reconstruct the final result object
  const finalResults = {
    ...result,
    users: updatedUsers,
    // Slice from the updated list so you don't call the function again
    previewUsers: type === "mutuals" ? updatedUsers.slice(0, 2) : undefined,
  };

  return NextResponse.json(finalResults);
}
