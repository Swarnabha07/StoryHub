"use client";

import React from "react";
import CommentActions from "./CommentActions";
import CommentBody from "./CommentBody";
import CommentEditor from "./CommentEditor";
import CommentHeader from "./CommentHeader";
import CommentReplies from "./CommentReplies";

const CommentItem = ({
  comment,
  id,
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
  depth = 0,
}) => {
  return (
    <div
      id={id}
      className={`comment-item w-full mt-8 ${depth > 0 ? "ml-6 border-l pl-4" : ""}`}
    >
      <div className="flex flex-col gap-1">
        <CommentHeader
          author={comment.author}
          postAuthor={postAuthor}
          createdAt={comment.createdDate}
          comment={comment}
          currentUserId={currentUserId}
          onEdit={onEdit}
          onDelete={onDelete}
          isEdited={comment.isEdited}
          isDeleted={comment.isDeleted}
        />

        <CommentBody content={comment.content} isDeleted={comment.isDeleted} />

        <CommentActions
          comment={comment}
          postId={postId}
          onReply={onReply}
          currentUserId={currentUserId}
        />
      </div>

      {editingComment?._id === comment._id && (
        <CommentEditor
          postId={comment.post}
          mode="edit"
          commentId={comment._id}
          initialValue={comment.content}
          onSuccess={onUpdateComment}
          onCancel={() => setEditingComment(null)}
        />
      )}

      {replyingTo === comment._id && (
        <CommentEditor
          postId={comment.post}
          parentCommentId={comment._id}
          mode="reply"
          author={comment.author.username}
          onSuccess={onAddReply}
          onCancel={() => setReplyingTo(null)}
        />
      )}

      <CommentReplies
        replies={comment.children}
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
        depth={depth + 1}
      />
    </div>
  );
};

export default React.memo(CommentItem, (prev, next) => {
  return (
    prev.comment === next.comment &&
    prev.replyingTo === next.replyingTo &&
    prev.editingComment === next.editingComment &&
    prev.currentUserId === next.currentUserId
  );
});
