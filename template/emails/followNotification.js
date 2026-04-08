export function followNotificationTemplate({
  recipientName,
  actorName,
  profileUrl,
}) {
  return {
    subject: `${actorName} started following you`,
    html: `
      <h2>New follower 🎉</h2>
      <p>Hi ${recipientName},</p>

      <p><strong>${actorName}</strong> started following you.</p>

      <p>
        <a href="${profileUrl}">View profile</a>
      </p>

      <br/>
      <p>— StoryHub Team</p>
    `,
  };
}
