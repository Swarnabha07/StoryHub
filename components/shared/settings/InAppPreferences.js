"use client";

import { useEffect, useState } from "react";
import ToggleItem from "./ToggleItem";

export default function InAppPreferences() {
  const [preferences, setPreferences] = useState({
    likes: false,
    comments: false,
    replies: false,
    follows: false,
  });

  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null); // track which toggle is updating

  //  Fetch current preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const res = await fetch(
          "/api/profile/preferenceType/in-app-preferences",
        );
        const data = await res.json();

        if (data?.preferences) {
          setPreferences(data.preferences);
        }
      } catch (err) {
        console.error("Failed to load preferences:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  // Toggle handler
  const handleToggle = async (key) => {
    const newValue = !preferences[key];

    // optimistic update
    setPreferences((prev) => ({
      ...prev,
      [key]: newValue,
    }));

    setSavingKey(key);

    try {
      const res = await fetch(
        "/api/profile/preferenceType/in-app-preferences",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            [key]: newValue,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update");
      }

      // sync with backend response (optional but safe)
      setPreferences(data.preferences);
    } catch (err) {
      console.error("Update failed:", err);

      // rollback if failed
      setPreferences((prev) => ({
        ...prev,
        [key]: !newValue,
      }));
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Loading preferences...</p>;
  }

  return (
    <div className="bg-[#FFFDF9] w-full px-4 py-10 space-y-6 border-b border-[#d3d3d3]">
      <h2 className="text-2xl font-bold">Popup Notification Preferences</h2>

      <div className="space-y-4">
        <ToggleItem
          label="Comments"
          description="Get notified through in-app toasts when someone comments on your post"
          checked={preferences.comments}
          onChange={() => handleToggle("comments")}
          loading={savingKey === "comments"}
        />

        <ToggleItem
          label="Replies"
          description="Get notified through in-app toasts when someone replies to your comment"
          checked={preferences.replies}
          onChange={() => handleToggle("replies")}
          loading={savingKey === "replies"}
        />

        <ToggleItem
          label="Follows"
          description="Get notified through in-app toasts when someone follows you"
          checked={preferences.follows}
          onChange={() => handleToggle("follows")}
          loading={savingKey === "follows"}
        />

        <ToggleItem
          label="Likes"
          description="Get notified through in-app toasts when someone likes your post or comment"
          checked={preferences.likes}
          onChange={() => handleToggle("likes")}
          loading={savingKey === "likes"}
        />
      </div>
    </div>
  );
}
