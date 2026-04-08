"use client";

import { useState, useEffect, useRef } from "react";

export default function CommentEditor({
  postId,
  parentCommentId = null,
  initialValue = "",
  mode = "new", // new | reply | edit
  author = null,
  commentId = null,
  onSuccess,
  onCancel,
}) {
  const [content, setContent] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef(null);

  useEffect(() => {
    setContent(initialValue);
  }, [initialValue]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const handleSubmit = async () => {
    if (loading) return;

    if (!content.trim()) {
      setError("Missing field");
      return;
    }
    if (content.length > 1000) {
      setError("Comment too long");
      return;
    }

    // Abort any previous request before starting new one
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");

    try {
      let res;

      if (mode === "edit") {
        res = await fetch(`/api/comments/${commentId}`, {
          method: "PATCH",
          body: JSON.stringify({ content }),
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        });
      } else {
        res = await fetch("/api/comments", {
          method: "POST",
          body: JSON.stringify({
            content,
            postId,
            parentCommentId,
          }),
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        });
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Request failed");
      }

      const data = await res.json();

      setContent("");
      onSuccess?.(data.comment);
    } catch (err) {
      if (err.name === "AbortError") {
        // Request was cancelled — do nothing
        return;
      }

      setError(err.message || "Something went wrong");
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="mt-3 w-full">
      <textarea
        aria-label="Comment input"
        disabled={loading}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={
          mode === "reply"
            ? `Replying to @${author}`
            : mode === "edit"
              ? "Edit your comment..."
              : "Write a comment..."
        }
        className="w-full border rounded p-2"
        rows={3}
      />

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      <div className="flex gap-2 mt-2">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`px-3 py-1 text-[#5A2A27] hover:bg-[#5A2A27] hover:text-[#FFFDF9] transition-colors duration-200 border font-semibold rounded ${loading ? "bg-[#5A2A27] text-[#FFFDF9]" : ""} disabled:cursor-not-allowed`}
        >
          {loading ? "Posting..." : mode === "edit" ? "Save" : "Post"}
        </button>

        {mode !== "new" && (
          <button
            onClick={onCancel}
            className="px-3 py-1 border rounded font-semibold hover:bg-black hover:text-[#FFFDF9] transition-colors duration-200"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
