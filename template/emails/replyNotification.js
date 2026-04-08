export function replyNotificationTemplate({
  recipientName,
  actorName,
  replyText,
  postUrl,
}) {
  return {
    subject: `${actorName} replied to your comment`,
    html: `
      <h2>New reply to your comment</h2>
      <p>Hi ${recipientName},</p>

      <p><strong>${actorName}</strong> replied:</p>

      <blockquote>${replyText}</blockquote>

      <p>
        <a href="${postUrl}">View reply</a>
      </p>

      <br/>
      <p>— StoryHub Team</p>
    `,
  };
}
