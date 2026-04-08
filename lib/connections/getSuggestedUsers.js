import mongoose from "mongoose";
import User from "@/models/User";
import { connectDB } from "../db";

export async function getSuggestedUsers({
  viewerId,
  cursor = null,
  limit = 10,
}) {
  await connectDB();

  const viewer = await User.findById(viewerId).select("following");

  if (!viewer) return null;

  const followingIds = viewer.following.map(
    (id) => new mongoose.Types.ObjectId(id),
  );

  const pipeline = [
    // 1 Take users followed by people I follow
    {
      $match: {
        _id: { $nin: [...followingIds, viewer._id] },
      },
    },

    // 2 Compute mutual count
    {
      $addFields: {
        mutualCount: {
          $size: {
            $setIntersection: ["$followers", followingIds],
          },
        },
      },
    },

    // 3 Only keep users with at least 1 mutual
    {
      $match: {
        mutualCount: { $gt: 0 },
      },
    },

    // 4 Sort by strongest signal
    {
      $sort: {
        mutualCount: -1,
        _id: 1,
      },
    },
  ];

  // Cursor pagination
  if (cursor) {
    pipeline.push({
      $match: {
        _id: { $gt: new mongoose.Types.ObjectId(cursor) },
      },
    });
  }

  pipeline.push(
    { $limit: limit + 1 },
    {
      $project: {
        username: 1,
        name: 1,
        profileImagePath: 1,
        mutualCount: 1,
      },
    },
  );

  const users = await User.aggregate(pipeline);

  const hasMore = users.length > limit;
  const slicedUsers = users.slice(0, limit);
  const nextCursor = hasMore ? slicedUsers[slicedUsers.length - 1]._id : null;

  const serializedUsers = slicedUsers.map((u) => ({
    _id: u._id.toString(),
    name: u.name,
    username: u.username,
    profileImagePath: u.profileImagePath,
  }));

  return {
    users: serializedUsers,
    nextCursor,
    hasMore,
  };
}
