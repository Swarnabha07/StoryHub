import { redis } from "../queue/redis.js";

const RATE_LIMIT_WINDOW = 5 * 60; // // 5 minutes

export async function canSendEmail(userId, type) {
  if (!userId || !type) return false;

  const key = `rate_limit:${userId}:${type}`;

  // set value if not exists (atomic operation)
  const result = await redis.set(key, "1", "EX", RATE_LIMIT_WINDOW, "NX");

  if (result === null) {
    // key already exists -> rate limited
    console.log("⛔ Rate limited:", key);
    return false;
  }

  console.log("✅ Allowed:", key);
  return true;
}
