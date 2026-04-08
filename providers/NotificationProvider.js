"use client";

import NotificationToast from "@/components/shared/notifications/NotificationToast";
import useNotificationStream from "@/hooks/useNotificationStream";
import { useStore } from "@/Store/store";
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

  useNotificationStream((data) => {
    if (data.type !== "activity") return;

    const { activity, isNewActivity } = data;
    const actor = activity?.actor;
    const message = activityMessages[activity?.type];

    if (!actor || !message) return;

    if (isNewActivity) {
      incrementUnread();
    }

    toast(<NotificationToast actor={actor} message={message} />, {
      toastId: activity._id,
    });
  });

  return (
    <>
      <ToastContainer
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
      {children}
    </>
  );
}
