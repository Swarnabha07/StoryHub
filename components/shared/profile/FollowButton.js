"use client";
import { useState, useEffect, useRef } from "react";

export default function FollowButton({
  userId,
  initialIsFollowing,
  onFollowersChange,
  className,
}) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);
  const inFlight = useRef(false);

  useEffect(() => {
    setIsFollowing(!!initialIsFollowing);
  }, [initialIsFollowing]);

  async function toggleFollow() {
    if (inFlight.current) return;
    inFlight.current = true;

    //For optimistic ui
    const prev = isFollowing;
    setIsFollowing(!prev);
    setLoading(true);

    try {
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: "POST",
      });

      if (res.status === 401) {
        alert("Please log in to follow users");
        throw new Error();
      }

      const data = await res.json();

      if (res.ok) {
        setIsFollowing(data.isFollowing);
        onFollowersChange?.(data.followersCount);
      }
    } catch {
      setIsFollowing(prev); //rollback
    } finally {
      setLoading(false);
      inFlight.current = false;
    }
  }

  return (
    <button
      onClick={toggleFollow}
      disabled={loading}
      className={`${className} rounded-full  transition-colors duration-200 ${
        loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
      } ${
        isFollowing
          ? "bg-white text-black border"
          : "bg-[#5A2A27] text-[#FFFDF9] hover:bg-[#4b1f1d]"
      }`}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
}
