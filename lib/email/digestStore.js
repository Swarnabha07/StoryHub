import { getRedis } from "./upstashRedis.js";

const redis = getRedis();

const DIGEST_WINDOW = 10 * 60; // 10 minutes (seconds)

export async function addToDigest(userId, event) {
  const key = `digest:${userId}`;

  // push event into Redis list
  await redis.rpush(key, JSON.stringify(event));

  // set expiry (only if first time)
  const ttl = await redis.ttl(key);
  if (ttl === -1) {
    await redis.expire(key, DIGEST_WINDOW);
  }
}
