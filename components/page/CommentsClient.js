"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import Navbar from "../layout/Navbar";
import Sidebar from "../layout/Sidebar";
import { useStore } from "@/Store/store";
import { Lora } from "next/font/google";
import CommentItem from "../shared/comments/CommentItem";
import CommentEditor from "../shared/comments/CommentEditor";
import { useSession } from "next-auth/react";
import CommentsSkeletonList from "../shared/comments/CommentsSkeletonList";
import { useRouter, useSearchParams } from "next/navigation";

const lora = Lora({
  weight: "600",
  subsets: ["latin"],
});

export default function CommentsClient({ postId, postSlug, postAuthor }) {
  const [flatComments, setFlatComments] = useState([]);
  // const [treeComments, setTreeComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  const { isSidebarOpen, setIsSidebarOpen } = useStore();
  const { data: session } = useSession();
  const loadMoreRef = useRef(null);
  const hasHighlighted = useRef(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const commentId = searchParams.get("comment");
  const highlightedCommentId = commentId;

  const treeComments = useMemo(() => {
    return buildCommentTree(flatComments);
  }, [flatComments]);

  //For fetching a single comment if comment id exists in params (if the authorized user navigated from activity page)
  useEffect(() => {
    if (!commentId) return;

    const exists = flatComments.some((c) => c._id === commentId);

    if (!exists) {
      fetchCommentContext(commentId);
    }
  }, [commentId, flatComments]);

  //For scroll highlight feature
  useEffect(() => {
    if (!commentId) return;
    if (hasHighlighted.current) return;

    const timer = setTimeout(() => {
      const el = document.getElementById(`comment-${commentId}`);

      if (!el) return;

      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      el.classList.add("highlight-comment");

      hasHighlighted.current = true; // mark as done

      setTimeout(() => {
        el.classList.remove("highlight-comment");
      }, 3000);
    }, 300); // small delay for DOM + animation

    return () => clearTimeout(timer);
  }, [flatComments, commentId]);

  //For pagination
  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchComments();
        }
      },
      {
        root: null,
        rootMargin: "200px", // triggers slightly before bottom
        threshold: 0,
      },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [cursor, hasMore, loading]);

  //For rendering the page for the first time
  useEffect(() => {
    setFlatComments([]);
    setCursor(null);
    setHasMore(true);
    setInitialLoading(true);
    fetchComments();
  }, [postId]);

  //for transforming flat -> tree nested comments
  function buildCommentTree(comments) {
    const map = {};
    const roots = [];

    comments.forEach((comment) => {
      map[comment._id] = { ...comment, children: [] };
    });

    comments.forEach((comment) => {
      if (comment.parentComment) {
        map[comment.parentComment]?.children.push(map[comment._id]);
      } else {
        roots.push(map[comment._id]);
      }
    });

    return roots;
  }

  async function fetchComments() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/comments/post/${postId}?cursor=${cursor}&limit=20`,
      );

      if (!res.ok) throw new Error("Failed to fetch comments");

      const data = await res.json();

      setFlatComments((prev) => {
        const newComments = cursor
          ? [...prev, ...data.comments] // loading more
          : data.comments; // first load / refresh

        return Array.from(new Map(newComments.map((c) => [c._id, c])).values());
      });
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }

  async function fetchCommentContext(commentId) {
    try {
      const res = await fetch(`/api/comments/${commentId}/context`);

      if (!res.ok) throw new Error("Failed to fetch comment");

      const data = await res.json();

      setFlatComments((prev) => {
        const map = new Map(prev.map((c) => [c._id, c]));

        // insert parents first
        data.parents.forEach((parent) => {
          map.set(parent._id, parent);
        });

        // insert target comment
        map.set(data.comment._id, data.comment);

        return Array.from(map.values());
      });
    } catch (err) {
      console.error(err);
    }
  }

  //for adding a comment
  const handleAddComment = useCallback((newComment) => {
    setFlatComments((prev) => [newComment, ...prev]);
  }, []);

  //for replying to a comment
  const handleAddReply = useCallback((newReply) => {
    setFlatComments((prev) => [newReply, ...prev]);
    setReplyingTo(null);
  }, []);

  //for editing a comment
  const handleUpdateComment = useCallback((updatedComment) => {
    setFlatComments((prev) =>
      prev.map((c) => (c._id === updatedComment._id ? updatedComment : c)),
    );
    setEditingComment(null);
  }, []);

  //for deleting a comment (soft delete)
  const handleDelete = useCallback(async (commentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment? This action cannot be undone.",
    );

    if (!confirmed) return;

    const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });

    if (!res.ok) {
      console.error("Delete failed");
      return;
    }

    setFlatComments((prev) =>
      prev.map((c) => (c._id === commentId ? { ...c, isDeleted: true } : c)),
    );
  }, []);

  return (
    <main className="min-h-screen bg-[#FFFDF9]">
      <Navbar />
      <div className="bg-black h-0.5 opacity-20"></div>

      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Overlay (click outside to close) */}
            <motion.div
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setIsSidebarOpen(false)}
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            <Sidebar />
          </>
        )}
      </AnimatePresence>

      <button
        onClick={() => {
          router.push(`/posts/${postSlug}`);
        }}
        className="flex gap-2 relative left-5 top-5 text-gray-600 hover:text-black font-semibold"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="currentColor"
        >
          <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
        </svg>
        <p>Back to post</p>
      </button>
      <div className="flex flex-col items-center gap-6 w-3/4 mx-auto mb-12">
        <h1
          className={`text-4xl font-bold border-b border-[#a1a1a1] py-2 my-4 ${lora.className}`}
        >
          Comments
        </h1>

        <CommentEditor
          postId={postId}
          onSuccess={(newComment) => handleAddComment(newComment)}
        />

        {initialLoading ? (
          <div className=" w-full">
            <CommentsSkeletonList count={5} />
          </div>
        ) : treeComments.length === 0 ? (
          <p className={`text-gray-500 text-xl my-4 ${lora.className}`}>
            No comments on this post yet.
          </p>
        ) : (
          treeComments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              id={`comment-${comment._id}`}
              highlightedCommentId={highlightedCommentId}
              currentUserId={session?.user?.id}
              postId={postId}
              postAuthor={postAuthor}
              onReply={(commentId) => {
                setEditingComment(null); // close edit editor
                setReplyingTo(commentId);
              }}
              onEdit={(comment) => {
                setReplyingTo(null); // close reply editor
                setEditingComment(comment);
              }}
              onDelete={handleDelete}
              replyingTo={replyingTo}
              editingComment={editingComment}
              onAddReply={handleAddReply}
              onUpdateComment={handleUpdateComment}
              setReplyingTo={setReplyingTo}
              setEditingComment={setEditingComment}
            />
          ))
        )}

        {hasMore && (
          <div
            ref={loadMoreRef}
            className="h-10 flex items-center justify-center text-sm opacity-60"
          >
            {loading && (
              <div className="w-5 h-5 border-2 border-[#5A2A27] border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        )}
      </div>
    </main>
  );
}
