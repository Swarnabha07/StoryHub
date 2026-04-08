"use server";

import { connectDB } from "@/lib/db";
import User from "@/models/User";

export const fetchUser = async (username) => {
  await connectDB();
  let u = await User.findOne({ username: username });
  if (!u) {
    return { error: "user with this username does not exist" };
  }
  let user = u.toObject({ flattenObjectIds: true });
  return user;
};
