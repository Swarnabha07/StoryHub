import UserAnalytics from "@/models/UserAnalytics";

export async function updateUserAnalytics({
  userId,
  type, // "follow" | "unfollow"
}) {
  const today = new Date().toISOString().split("T")[0];

  const update = {
    $inc: {
      followersGained: type === "follow" ? 1 : 0,
      followersLost: type === "unfollow" ? 1 : 0,
    },
  };

  await UserAnalytics.findOneAndUpdate(
    { user: userId, date: today },
    {
      ...update,
      $setOnInsert: {
        user: userId,
        date: today,
      },
    },
    { upsert: true },
  );
}
