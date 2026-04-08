export function commentNotificationTemplate({
  recipientName,
  actorName,
  postTitle,
  commentText,
  postUrl,
}) {
  return {
    subject: `${actorName} commented on your post`,
    html: `
      <h2>New comment on your post</h2>
      <p>Hi ${recipientName},</p>

      <p><strong>${actorName}</strong> commented on your post:</p>

      <blockquote>${commentText}</blockquote>

      <p>
        <a href="${postUrl}">View comment</a>
      </p>

      <br/>
      <p>— StoryHub Team</p>
    `,
  };
}
