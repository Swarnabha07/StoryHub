import CommentItem from "./CommentItem";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CommentReplies({
  replies,
  highlightedCommentId,
  currentUserId,
  postId,
  postAuthor,
  onReply,
  onEdit,
  onDelete,
  replyingTo,
  editingComment,
  onAddReply,
  onUpdateComment,
  setReplyingTo,
  setEditingComment,
}) {
  if (!replies || replies.length === 0) return null;

  const INITIAL_VISIBLE_REPLIES = 3;
  const LOAD_STEP = 5;

  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_REPLIES);

  function containsTarget(replies, targetId) {
    for (let r of replies) {
      if (r._id === targetId) return true;
      if (r.children?.length && containsTarget(r.children, targetId)) {
        return true;
      }
    }
    return false;
  }

  const shouldAutoExpand = containsTarget(replies, highlightedCommentId);

  const orderedReplies = [...replies].reverse(); // oldest → newest

  const visibleReplies = shouldAutoExpand
    ? orderedReplies
    : orderedReplies.slice(0, visibleCount);

  const remaining = orderedReplies.length - visibleReplies.length;

  return (
    <div className="mt-2">
      <AnimatePresence initial={false}>
        {visibleReplies.map((reply) => (
          <motion.div
            key={reply._id}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="ml-3 md:ml-6 pl-2 md:pl-4 border-l overflow-hidden" // SINGLE LEVEL INDENT ONLY
          >
            <CommentItem
              comment={reply}
              id={`comment-${reply._id}`}
              highlightedCommentId={highlightedCommentId}
              currentUserId={currentUserId}
              postId={postId}
              postAuthor={postAuthor}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              replyingTo={replyingTo}
              editingComment={editingComment}
              onAddReply={onAddReply}
              onUpdateComment={onUpdateComment}
              setReplyingTo={setReplyingTo}
              setEditingComment={setEditingComment}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {!shouldAutoExpand && orderedReplies.length > INITIAL_VISIBLE_REPLIES && (
        <button
          onClick={() => {
            if (remaining > 0) {
              // Load more
              setVisibleCount((prev) =>
                Math.min(prev + LOAD_STEP, orderedReplies.length),
              );
            } else {
              // Collapse
              setVisibleCount(INITIAL_VISIBLE_REPLIES);
            }
          }}
          className="text-[11px] md:text-sm text-[#5A2A27] mt-1 opacity-70 hover:opacity-100"
        >
          {remaining > 0
            ? `Show ${Math.min(LOAD_STEP, remaining)} more replies`
            : "Hide replies"}
        </button>
      )}
    </div>
  );
}
