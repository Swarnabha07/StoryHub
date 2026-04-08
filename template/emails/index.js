import { commentNotificationTemplate } from "./commentNotification";
import { followNotificationTemplate } from "./followNotification";
import { replyNotificationTemplate } from "./replyNotification";

export const emailTemplates = {
  POST_COMMENT: commentNotificationTemplate,
  COMMENT_REPLY: replyNotificationTemplate,
  USER_FOLLOW: followNotificationTemplate,
};
