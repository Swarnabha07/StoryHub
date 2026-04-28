"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function BookmarkButton({ postId, initialBookmarked }) {
  const [bookmarked, setBookmarked] = useState(!!initialBookmarked);
  const [loading, setLoading] = useState(false);
  const inFlight = useRef(false);
  const router = useRouter();

  useEffect(() => {
    setBookmarked(!!initialBookmarked);
  }, [initialBookmarked]);

  async function toggleBookmark() {
    if (inFlight.current) return;
    inFlight.current = true;

    const prev = bookmarked;
    setBookmarked(!prev);
    setLoading(true);

    try {
      const res = await fetch(`/api/posts/id/${postId}/bookmark`, {
        method: "POST",
      });

      if (res.status === 401) {
        alert("Please log in to bookmark posts");
        throw new Error();
      }

      if (res.status === 403) {
        alert("Cannot bookmark draft posts");
        throw new Error();
      }

      if (!res.ok) throw new Error();

      const data = await res.json();
      setBookmarked(data.bookmarked);
    } catch {
      setBookmarked(prev);
    } finally {
      setLoading(false);
      inFlight.current = false;
      router.refresh(); // this re-syncs from server
    }
  }

  return (
    <button
      onClick={toggleBookmark}
      disabled={loading}
      aria-pressed={bookmarked}
      aria-label={bookmarked ? "Unbookmark post" : "Bookmark post"}
      className={`flex items-center gap-1 text-sm transition-colors duration-200 ${
        loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
      } ${
        bookmarked ? "text-[#421b18]" : "text-gray-400 hover:text-[#5A2A27]"
      }`}
    >
      {bookmarked ? (
        <svg
          className="h-5 w-5 md:h-6 md:w-6"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 -960 960 960"
          fill="currentColor"
        >
          <path d="M713-600 600-713l56-57 57 57 141-142 57 57-198 198ZM200-120v-640q0-33 23.5-56.5T280-840h240v80H280v518l200-86 200 86v-278h80v400L480-240 200-120Zm80-640h240-240Z" />
        </svg>
      ) : (
        <svg
          className="h-5 w-5 md:h-6 md:w-6"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 -960 960 960"
          fill="currentColor"
        >
          <path d="M200-120v-640q0-33 23.5-56.5T280-840h240v80H280v518l200-86 200 86v-278h80v400L480-240 200-120Zm80-640h240-240Zm400 160v-80h-80v-80h80v-80h80v80h80v80h-80v80h-80Z" />
        </svg>
      )}
    </button>
  );
}
