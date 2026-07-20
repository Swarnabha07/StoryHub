"use client";

import NotificationPreferencesSkeleton from "./NotificationPreferencesSkeleton";
import ToggleItem from "./ToggleItem";
import useNotificationPreferences from "@/hooks/useNotificationPreferences";

export default function EmailPreferences() {
  const preferenceItems = [
    {
      key: "comments",
      label: "Comments",
      description:
        "Get notified through email when someone comments on your post",
    },
    {
      key: "replies",
      label: "Replies",
      description:
        "Get notified through email when someone replies to your comment",
    },
    {
      key: "follows",
      label: "Follows",
      description: "Get notified through email when someone follows you",
    },
    {
      key: "likes",
      label: "Likes",
      description:
        "Get notified through email when someone likes your post or comment",
    },
  ];

  const { preferences, loading, savingKey, handleToggle } =
    useNotificationPreferences("/api/profile/preferenceType/email-preferences");

  if (loading) {
    return <NotificationPreferencesSkeleton />;
  }

  return (
    <div className="bg-[#FFFDF9] w-full md:px-4 py-10 space-y-6 border-b border-[#d3d3d3]">
      <h2 className="text-lg md:text-2xl font-bold">Email Notification Preferences</h2>

      <div className="space-y-4">
        {preferenceItems.map(({ key, label, description }) => (
          <ToggleItem
            key={key}
            label={label}
            description={description}
            checked={preferences[key]}
            onChange={() => handleToggle(key)}
            loading={savingKey === key}
          />
        ))}
      </div>
    </div>
  );
}
