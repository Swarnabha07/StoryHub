"use server";

import { connectDB } from "@/lib/db";
import User from "@/models/User";

export const fetchUser = async (username) => {
  await connectDB();

  const user = await User.findOne({
    username,
    isDeleted: false,
  }).select("_id name username bio followersCount followingCount");

  if (!user) {
    return {
      error: "user not found",
    };
  }

  return user.toObject({
    flattenObjectIds: true,
  });
};
