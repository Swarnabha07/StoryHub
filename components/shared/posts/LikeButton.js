"use client";
import { useState, useEffect, useRef } from "react";

export default function LikeButton({ postId, initialLiked, initialCount }) {
  const [count, setCount] = useState(initialCount ?? 0);
  const [liked, setLiked] = useState(!!initialLiked);
  const [loading, setLoading] = useState(false);
  const inFlight = useRef(false);

  useEffect(() => {
    setLiked(!!initialLiked);
    setCount(initialCount ?? 0);
  }, [initialLiked, initialCount]);

  async function toggleLike() {
    if (inFlight.current) return;
    inFlight.current = true;

    const prevLiked = liked;
    const prevCount = count;

    // Optimistic UI
    setLiked(!prevLiked);
    setCount(prevLiked ? prevCount - 1 : prevCount + 1);
    setLoading(true);

    try {
      const res = await fetch(`/api/posts/id/${postId}/like`, {
        method: "POST",
      });

      if (res.status === 401) {
        alert("Please log in to like posts");
        throw new Error();
      }

      if (res.status === 403) {
        alert("Cannot like unpublished posts");
        throw new Error();
      }
      if (!res.ok) throw new Error();

      const data = await res.json();

      // Sync with backend truth
      setLiked(data.liked);
      setCount(data.likesCount);
    } catch {
      // Rollback on failure
      setLiked(prevLiked);
      setCount(prevCount);
    } finally {
      setLoading(false);
      inFlight.current = false;
    }
  }

  return (
    <button
      onClick={toggleLike}
      disabled={loading}
      aria-pressed={liked}
      aria-label={liked ? "Unlike post" : "Like post"}
      className={`flex items-center gap-1 text-xs md:text-sm transition-colors duration-200 ${
        loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
      } ${liked ? "text-[#c22014]" : "text-gray-400 hover:text-[#c22014]"}`}
    >
      <svg
        className="h-4 w-4 md:h-5 md:w-5"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 -960 960 960"
        fill="currentColor"
      >
        <path d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Z" />
      </svg>{" "}
      {count}
    </button>
  );
}
