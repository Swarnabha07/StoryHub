export function serializePost(post) {
  return {
    id: post._id.toString(),
    title: post.title ?? "",
    slug: post.slug ?? "",
    content: post.content ?? "",
    excerpt: post.excerpt ?? "",
    coverImagePath: post.coverImagePath ?? null,
    coverImageUrl: post.coverImageUrl ?? null,

    author: post.author?.toString?.() ?? null,

    status: post.status,
    tags: post.tags ?? [],
    likesCount: post.likesCount ?? 0,
    readingTime: post.readingTime ?? 0,
    isDeleted: post.isDeleted ?? false,

    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,

    deletedAt: post.deletedAt ? post.deletedAt.toISOString() : null,

    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}
