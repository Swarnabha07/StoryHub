import User from "@/models/User";
import { connectDB } from "@/lib/db";

export async function getMutualFollowers({
  username,
  viewerId,
  limit = 10,
  cursor = null,
}) {
  await connectDB();

  if (!viewerId) return null;

  // 1. Fetch profile user followers
  const profileUser = await User.findOne({ username })
    .select("followers")
    .lean();

  if (!profileUser) return null;

  // 2. Fetch viewer following
  const viewer = await User.findById(viewerId).select("following").lean();

  if (!viewer) return null;

  // 3. Compute mutuals (intersection)
  const profileFollowersSet = new Set(profileUser.followers.map(String));

  const mutualIds = viewer.following
    .map(String)
    .filter((id) => profileFollowersSet.has(id));

  // 4. Cursor pagination
  const startIndex = cursor ? mutualIds.indexOf(cursor) + 1 : 0;

  const paginatedIds = mutualIds.slice(startIndex, startIndex + limit);

  // 5. Fetch user docs
  const users = await User.find({
    _id: { $in: paginatedIds },
  })
    .select("name username profileImagePath followersCount")
    .lean();

  // 6. Maintain order
  const usersMap = new Map(users.map((u) => [u._id.toString(), u]));

  const orderedUsers = paginatedIds
    .map((id) => usersMap.get(id))
    .filter(Boolean);

  // 7. Serialize
  const serializedUsers = orderedUsers.map((u) => ({
    _id: u._id.toString(),
    name: u.name,
    username: u.username,
    profileImagePath: u.profileImagePath,
    followersCount: u.followersCount,
    isFollowing: true, // mutual means viewer follows them
  }));

  // 8. Next cursor
  const nextCursor =
    paginatedIds.length === limit
      ? paginatedIds[paginatedIds.length - 1]
      : null;

  return {
    users: serializedUsers,
    mutualFollowersCount: mutualIds.length,
    nextCursor,
    hasMore: !!nextCursor,
  };
}
