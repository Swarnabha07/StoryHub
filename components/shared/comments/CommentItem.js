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
}) => {
  return (
    <div id={id} className={`comment-item w-full mt-4 md:mt-8 min-w-0 `}>
      <div className="flex flex-col gap-1 min-w-0">
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

        <CommentBody
          content={comment.content}
          isDeleted={comment.isDeleted}
          parentAuthor={comment.parentAuthor}
        />

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
