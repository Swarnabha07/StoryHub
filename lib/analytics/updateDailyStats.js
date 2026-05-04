import PostAnalytics from "@/models/PostAnalytics";

export async function updateDailyStats({
  postId,
  authorId,
  type,
  isUnique = false,
  isUnlike = false,
}) {
  const today = new Date().toISOString().split("T")[0];

  const update = {};

  if (type === "view") {
    update.$inc = {
      views: 1,
      ...(isUnique && { uniqueViews: 1 }),
    };
  }

  if (type === "comment") {
    update.$inc = { comments: 1 };
  }

  if (type === "like") {
    update.$inc = {
      likes: isUnlike ? -1 : 1,
    };
  }
  await PostAnalytics.findOneAndUpdate(
    { post: postId, date: today },
    {
      ...update,
      $setOnInsert: {
        post: postId,
        author: authorId,
        date: today,
      },
    },
    { upsert: true, new: true },
  );
}
