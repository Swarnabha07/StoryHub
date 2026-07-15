import Activity from "@/models/Activity";
import { sendNotification } from "../notifications/notificationManager";
import { triggerEmailNotification } from "../email/triggerEmailNotification";
import { getSignedEmailAvatar } from "@/actions/getSignedEmailAvatar";
import Comment from "@/models/Comment";
import { triggerInAppNotification } from "../notifications/triggerInAppNotification";

const DEDUP_TYPES = ["USER_FOLLOW", "POST_LIKE", "COMMENT_LIKE"];

export async function createActivity({
  actor,
  targetUser,
  type,
  post = null,
  comment = null,
}) {
  if (actor.toString() === targetUser.toString()) return;

  let activity;
  let isNewActivity = false;

  if (DEDUP_TYPES.includes(type)) {
    // only dedupe for like/follow actions
    activity = await Activity.findOne({
      actor,
      targetUser,
      type,
      post: post || null,
      comment: comment || null,
    });

    if (activity) {
      // if user already saw the old notification, treat this as new
      if (activity.isRead) {
        isNewActivity = true;
      }
      activity.createdAt = new Date();
      activity.isRead = false;
      await activity.save();
    } else {
      activity = await Activity.create({
        actor,
        targetUser,
        type,
        post,
        comment,
      });
      isNewActivity = true;
    }
  } else {
    // create new activity for comments & replies
    activity = await Activity.create({
      actor,
      targetUser,
      type,
      post,
      comment,
    });
    isNewActivity = true;
  }

  const populatedActivity = await activity.populate([
    { path: "actor", select: "username profileImagePath" },
    { path: "targetUser", select: "username name email emailPreferences inAppPreferences" },
    { path: "post", select: "title slug" },
    { path: "comment", select: "content" },
  ]);

  // final enriched activity object
  const activityObj = populatedActivity.toObject();

  let profileImageUrl = null;

  if (activityObj.actor?.profileImagePath) {
    const signedImage = await getSignedEmailAvatar(activityObj.actor._id);
    profileImageUrl = signedImage?.profileImage || null;
  }

  const activityWithImage = {
    ...activityObj,
    actor: activityObj.actor
      ? {
          ...activityObj.actor,
          profileImageUrl,
        }
      : null,
  };

  triggerInAppNotification({
    activity: activityWithImage,
    isNewActivity,
  }).catch((err) => {
    console.error("Notification realtime send failed:", err);
  });

  // email notification trigger
  triggerEmailNotification({
    type: activityWithImage.type,
    recipient: activityWithImage.targetUser,
    actor: activityWithImage.actor,
    post: activityWithImage.post,
    comment: activityWithImage.comment,
  }).catch((err) => {
    console.error("Notification email send failed:", err);
  });
}
