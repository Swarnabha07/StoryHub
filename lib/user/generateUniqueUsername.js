import User from "@/models/User";
import { connectDB } from "../db";

export async function generateUniqueUsername(baseUsername) {
  await connectDB();
  let username = baseUsername;
  let count = 0;

  while (await User.findOne({ username })) {
    count++;
    username = `${baseUsername}_${count}`;
  }

  return username;
}
