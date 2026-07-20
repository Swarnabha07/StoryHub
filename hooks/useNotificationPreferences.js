"use client";

import { useEffect, useState } from "react";

const defaultPreferences = {
  likes: false,
  comments: false,
  replies: false,
  follows: false,
};

export default function useNotificationPreferences(endpoint) {
  const [preferences, setPreferences] = useState(defaultPreferences);

  const [loading, setLoading] = useState(true);

  const [savingKey, setSavingKey] = useState(null);

  // Fetch current preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const res = await fetch(endpoint);
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
  }, [endpoint]);

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
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [key]: newValue,
        }),
      });

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

  return {
    preferences,
    loading,
    savingKey,
    handleToggle,
  };
}
