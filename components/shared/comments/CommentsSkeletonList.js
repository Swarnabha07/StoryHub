"use client";

import CommentSkeletonLoader from "./CommentSkeletonLoader";

export default function CommentsSkeletonList({ count = 4 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <CommentSkeletonLoader />

          {/* simulate nested replies */}
          <CommentSkeletonLoader depth={1} />
        </div>
      ))}
    </>
  );
}
