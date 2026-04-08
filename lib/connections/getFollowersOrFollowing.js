import User from "@/models/User";
import { connectDB } from "@/lib/db";

export async function getUserConnections({
  username,
  type, // "followers" | "following"
  viewerId,
  limit = 10,
  cursor = null,
}) {
  await connectDB();

  const profileUser = await User.findOne({ username }).select(type).lean();

  if (!profileUser) return null;

  const ids = profileUser[type].map(String);

  // Cursor filtering
  const startIndex = cursor ? ids.indexOf(cursor) + 1 : 0;
  const paginatedIds = ids.slice(startIndex, startIndex + limit);

  const users = await User.find({ _id: { $in: paginatedIds } })
    .select("name username profileImagePath followersCount")
    .lean();

  // Maintain order
  const usersMap = new Map(users.map((u) => [u._id.toString(), u]));

  const orderedUsers = paginatedIds
    .map((id) => usersMap.get(id))
    .filter(Boolean);

  let viewerFollowing = [];
  if (viewerId) {
    const viewer = await User.findById(viewerId).select("following").lean();
    viewerFollowing = viewer?.following?.map(String) || [];
  }

  const serializedUsers = orderedUsers.map((u) => ({
    _id: u._id.toString(),
    name: u.name,
    username: u.username,
    profileImagePath: u.profileImagePath,
    followersCount: u.followersCount,
    isFollowing: viewerFollowing.includes(u._id.toString()),
  }));

  const nextCursor =
    paginatedIds.length === limit
      ? paginatedIds[paginatedIds.length - 1]
      : null;

  return {
    users: serializedUsers,
    nextCursor,
    hasMore: !!nextCursor,
  };
}
