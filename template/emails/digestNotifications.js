const escapeHTML = (str) => str?.replace(/</g, "&lt;").replace(/>/g, "&gt;");

const typeContentMap = {
  POST_COMMENT: "commented on your post",
  COMMENT_REPLY: "replied to your comment",
  USER_FOLLOW: "started following you",
  POST_LIKE: "liked your post",
  COMMENT_LIKE: "liked your comment",
};

export function buildDigestEmail({
  recipientName,
  events,
  visibleEvents,
  remaining,
  baseUrl,
}) {
  const subject =
    events.length === 1
      ? "You have a new notification"
      : `${events.length} new notifications waiting for you`;

  const html = `
  <div style="font-family: Arial, sans-serif; background:#f6f9fc; padding:20px;">
    
    <div style="max-width:600px;margin:0 auto;background:#ffffff;padding:20px;border-radius:10px;">

      <p style="font-size:16px;">Hi ${escapeHTML(recipientName)},</p>

      <p style="font-size:15px;color:#333;">
        You have <strong>${events.length}</strong> new notifications.
      </p>

      <h3 style="margin-top:20px;margin-bottom:10px;">Here’s what’s happening:</h3>

      <ul style="list-style:none;padding:0;margin:0;">
        ${visibleEvents
          .map((e) => {
            const avatarUrl = e.actorProfileImageUrl
              ? e.actorProfileImageUrl.startsWith("http")
                ? e.actorProfileImageUrl
                : `${baseUrl}${e.actorProfileImageUrl}`
              : `${baseUrl}/defaultAvatar.png`;

            const avatar = `
              <img 
                src="${avatarUrl}"
                alt="${escapeHTML(e.actors?.[0] || "User")}"
                width="32" 
                height="32" 
                style="
                  display:inline-block;
                  border-radius:50%;
                  vertical-align:middle;
                  margin-right:10px;
                  object-fit:cover;
                "
              />
            `;

            const firstActor = `<strong>${escapeHTML(e.actors[0])}</strong>`;
            const othersCount = e.count - 1;
            const othersText =
              e.isAggregated && othersCount > 0
                ? ` and ${othersCount} other${othersCount > 1 ? "s" : ""}`
                : "";

            let content = "";

            switch (e.type) {
              case "USER_FOLLOW":
                content = `${firstActor} ${typeContentMap[e.type]}`;
                break;

              case "POST_LIKE":
              case "POST_COMMENT":
                content = `${firstActor}${othersText} ${typeContentMap[e.type]} "<span style="color:#555;">${escapeHTML(
                  e.postTitle ?? "your post",
                )}</span>"`;
                break;

              case "COMMENT_REPLY":
                content = `${firstActor} ${typeContentMap[e.type]}`;
                break;

              case "COMMENT_LIKE":
                content = `${firstActor}${othersText} ${typeContentMap[e.type]}`;
                break;

              default:
                content = `${firstActor} did something`;
            }

            return `
              <li style="padding:10px 0;border-bottom:1px solid #eee;">
                ${avatar}
                <span style="font-size:14px;vertical-align:middle;">
                  ${content}
                </span>
              </li>
            `;
          })
          .join("")}
      </ul>

      ${
        remaining > 0
          ? `<p style="margin-top:10px;color:#666;font-size:13px;">
              <em>And ${remaining} more notifications...</em>
            </p>`
          : ""
      }

      <div style="text-align:center;margin-top:20px;">
        <a href="${baseUrl}/activity"
           style="background:#5A2A27;color:#fff;padding:12px 18px;text-decoration:none;border-radius:6px;font-size:14px;display:inline-block;">
           View all notifications
        </a>
      </div>

      <p style="margin-top:25px;color:#999;font-size:12px;text-align:center;">
        You’re receiving this because of activity on your account.
      </p>

      <p style="text-align:center;font-size:12px;">
        <a href="${baseUrl}/settings" style="color:#555;text-decoration:underline;">
          Manage preferences
        </a>
      </p>

    </div>
  </div>
  `;

  return { subject, html };
}
