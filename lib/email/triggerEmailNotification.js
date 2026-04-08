import { Job } from "bullmq";
import { emailQueue } from "../queue/emailQueue";
import { addToDigest } from "./digestStore";

export async function triggerEmailNotification({
  type,
  recipient,
  actor,
  post,
  comment,
}) {
  if (!recipient?.email) return;

  const recipientId = recipient?._id?.toString();
  if (!actor || !recipientId || recipientId === actor?._id?.toString()) {
    console.warn(
      "Missing recipient ID or actor details for email notification",
    );
    return;
  }

  // Check user preferences
  const prefs = {
    comments: true,
    replies: true,
    follows: true,
    likes: false,
    ...recipient.emailPreferences,
  };

  const typeToPrefKey = {
    POST_COMMENT: "comments",
    COMMENT_REPLY: "replies",
    USER_FOLLOW: "follows",
    POST_LIKE: "likes",
    COMMENT_LIKE: "likes",
  };

  const normalizedType = String(type).toUpperCase();

  const prefKey = typeToPrefKey[normalizedType];
  if (prefKey && !prefs[prefKey]) return;

  await addToDigest(recipientId, {
    type: normalizedType,
    actorName: actor.username,
    actorProfileImageUrl: actor.profileImageUrl,
    postTitle: post?.title,
    commentText: comment?.content,
    postId: post?._id,
    commentId: comment?._id,
  });

  // Properly remove existing job
  const job = await Job.fromId(emailQueue, `digest-${recipientId}`);
  if (job) {
    await job.remove();
  }

  // schedule digest job (deduplicated)
  await emailQueue.add(
    "send-digest",
    {
      userId: recipientId,
      email: recipient.email,
      recipientName: recipient.name,
    },
    {
      delay: 30 * 60 * 1000, // 30 * 60 * 1000 (30 minutes)
      jobId: `digest-${recipientId}`,
      attempts: 5,
      backoff: {
        type: "fixed",
        delay: 2 * 60 * 1000, // retry every 2 min
      },
    },
  );
}
