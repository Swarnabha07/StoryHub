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
  depth,
}) {
  if (!replies || replies.length === 0) return null;

  const INITIAL_VISIBLE_REPLIES = 3;
  const [showAllReplies, setShowAllReplies] = useState(false);

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

  const visibleReplies =
    showAllReplies || shouldAutoExpand
      ? replies
      : replies.slice(0, INITIAL_VISIBLE_REPLIES);

  return (
    <div className="mt-2">
      <AnimatePresence initial={false}>
        {visibleReplies.length > 0 && (
          <motion.div
            key="replies-container"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="ml-6 border-l pl-4 overflow-hidden"
          >
            {visibleReplies.map((reply) => (
              <motion.div
                key={reply._id}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
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
                  depth={depth}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {replies?.length > INITIAL_VISIBLE_REPLIES && (
        <button
          onClick={() => setShowAllReplies(!showAllReplies)}
          className="flex items-center gap-1 text-sm text-[#5A2A27] mt-1  opacity-70 hover:opacity-100"
        >
          <motion.span
            animate={{ rotate: showAllReplies || shouldAutoExpand ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="currentColor"
            >
              <path d="M320-200v-560l440 280-440 280Zm80-280Zm0 134 210-134-210-134v268Z" />
            </svg>
          </motion.span>
          {showAllReplies || shouldAutoExpand
            ? "Hide replies"
            : `Show ${replies.length - INITIAL_VISIBLE_REPLIES} more replies`}
        </button>
      )}
    </div>
  );
}
