"use client";

import NotificationToast from "@/components/shared/notifications/NotificationToast";
import useNotificationStream from "@/hooks/useNotificationStream";
import notificationAggregator from "@/lib/notifications/notificationAggregator";
import { useStore } from "@/Store/store";
import { useCallback, useRef } from "react";
import { Bounce, ToastContainer, toast } from "react-toastify";

const activityMessages = {
  POST_LIKE: "liked your post",
  POST_COMMENT: "commented on your post",
  USER_FOLLOW: "followed you",
  COMMENT_REPLY: "replied to your comment",
  COMMENT_LIKE: "liked your comment",
};

export default function NotificationProvider({ children }) {
  const { incrementUnread } = useStore();

  const seenIdsRef = useRef(new Set());

  const handleNotification = useCallback(
    (data) => {
      if (data.type !== "activity") return;

      const { activity, isNewActivity } = data;
      const actor = activity?.actor;
      const message = activityMessages[activity?.type];
      const id = activity?._id;

      if (!actor || !message || !id) return;

      // prevent duplicate events
      if (seenIdsRef.current.has(id)) return;
      seenIdsRef.current.add(id);

      if (isNewActivity) {
        incrementUnread();
      }

      if (!toast.isActive(id)) {
        notificationAggregator.enqueue({
          content: <NotificationToast actor={actor} message={message} />,
          options: {
            toastId: id,
            containerId: "activity",
          },
        });
      }
    },
    [incrementUnread],
  );

  useNotificationStream(handleNotification);

  return (
    <>
      <ToastContainer
        containerId="activity"
        position="top-right"
        autoClose={8000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />

      <ToastContainer
        containerId="ui"
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />

      {children}
    </>
  );
}
