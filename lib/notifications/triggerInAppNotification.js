import { sendNotification } from "./notificationManager";

const TYPE_TO_PREF = {
  POST_COMMENT: "comments",
  COMMENT_REPLY: "replies",
  USER_FOLLOW: "follows",
  POST_LIKE: "likes",
  COMMENT_LIKE: "likes",
};

export async function triggerInAppNotification({ activity, isNewActivity }) {
  if (!activity) return;

  const actor = activity.actor;
  const recipient = activity.targetUser;

  const recipientId = recipient?._id?.toString();

  if (!actor || !recipientId) {
    console.warn("Missing recipient or actor for in-app notification.");
    return;
  }

  // don't notify yourself
  if (recipientId === actor._id?.toString()) {
    return;
  }

  const prefs = {
    comments: true,
    replies: true,
    follows: true,
    likes: false,
    ...recipient.inAppPreferences,
  };

  const prefKey = TYPE_TO_PREF[activity.type];

  if (prefKey && !prefs[prefKey]) {
    return;
  }

  try {
    sendNotification(recipientId, {
      type: "activity",
      activity,
      isNewActivity,
    });
  } catch (err) {
    console.error("Realtime notification send failed:", err);
  }
}
