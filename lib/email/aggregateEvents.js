const AGGREGATE_TYPES = ["POST_LIKE", "COMMENT_LIKE"];

export function aggregateEvents(events) {
  const grouped = {};
  const result = [];

  for (const event of events) {
    // If NOT aggregatable → push directly
    if (!AGGREGATE_TYPES.includes(event.type)) {
      result.push({
        type: event.type,
        actors: [event.actorName],
        actorProfileImageUrl: event.actorProfileImageUrl,
        postTitle: event.postTitle,
        commentText: event.commentText,
        count: 1,
        isAggregated: false,
      });
      continue;
    }

    // Aggregatable types (POST_LIKE, COMMENT_LIKE)
    const key = `${event.type}_${event.postId || event.commentId || ""}`;

    if (!grouped[key]) {
      grouped[key] = [];
    }

    grouped[key].push(event);
  }

  // Process aggregated groups (ONLY POST_LIKE)
  for (const key in grouped) {
    const group = grouped[key];
    const first = group[0];

    result.push({
      type: first.type,
      actors: [...new Set(group.map((e) => e.actorName))],
      actorProfileImageUrl: first.actorProfileImageUrl,
      postTitle: first.postTitle,
      count: group.length,
      isAggregated: true,
    });
  }

  return result;
}
