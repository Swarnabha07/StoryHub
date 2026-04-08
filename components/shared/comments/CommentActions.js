import CommentLikeButton from "./CommentLikeButton";

export default function CommentActions({
  comment,
  postId,
  onReply,
  currentUserId,
}) {
  const likedByMe =
    !!currentUserId &&
    comment.likes?.some((id) => id.toString() === currentUserId);
  return (
    <div>
      {!comment.isDeleted && (
        <div className="flex gap-4 text-sm text-gray-500 mt-2">
          <CommentLikeButton
            commentId={comment._id}
            postId={postId}
            initialLiked={likedByMe}
            initialCount={comment.likesCount}
          />
          <button onClick={() => onReply(comment._id)}>Reply</button>
        </div>
      )}
    </div>
  );
}
