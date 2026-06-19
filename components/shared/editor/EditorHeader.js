"use client";

import { useState } from "react";
import { Lora } from "next/font/google";
import { Bounce, ToastContainer, toast } from "react-toastify";
import Link from "next/link";
import ScheduleModal from "./ScheduleModal";
import EditorOptionsMenu from "./EditorOptionsMenu";

const lora = Lora({
  weight: "700",
  subsets: ["latin"],
});

export default function EditorHeader({
  title,
  setTitle,
  onSaveDraft,
  saving,
  saveStatus,
  postId,
  postSlug,
  initialStatus,
  initialScheduledFor,
}) {
  const [status, setStatus] = useState(initialStatus || "draft");
  const [publishing, setPublishing] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(initialScheduledFor || null);

  async function togglePublish() {
    if (!postId) return;

    try {
      setPublishing(true);

      let nextStatus;

      if (status === "draft") {
        nextStatus = "published";
      } else if (status === "published") {
        nextStatus = "draft";
      } else if (status === "scheduled") {
        nextStatus = "published";
      } else {
        return;
      }

      const res = await fetch(`/api/posts/id/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      setStatus(nextStatus);

      if (nextStatus === "published") {
        setScheduleDate(null);
        toast.success(
          <div>
            Post is live!
            <Link
              href={`/posts/${postSlug}`}
              target="_blank"
              rel="noreferrer"
              className="underline ml-3"
            >
              View Now
            </Link>
          </div>,
          {
            containerId: "ui",
          },
        );
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setPublishing(false);
    }
  }

  //for scheduling posts
  async function schedulePost(date) {
    if (!postId) return;

    if (!date) {
      toast.error("Please select a schedule date", {
        containerId: "ui",
      });
      return;
    }

    const isoDate = new Date(date).toISOString();

    try {
      setPublishing(true);

      const res = await fetch(`/api/posts/id/${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "scheduled",
          scheduledFor: isoDate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to schedule post");
      }

      setStatus("scheduled");
      setScheduleDate(isoDate);

      toast.success("Post scheduled", {
        containerId: "ui",
      });

      setShowScheduleModal(false);
    } catch (err) {
      console.error(err);

      toast.error(err.message, {
        containerId: "ui",
      });
    } finally {
      setPublishing(false);
    }
  }

  async function cancelSchedule() {
    if (!postId) return;

    try {
      setPublishing(true);

      const res = await fetch(`/api/posts/id/${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "draft",
        }),
      });

      if (!res.ok) {
        throw new Error();
      }

      setStatus("draft");
      setScheduleDate(null);

      toast.success("Schedule cancelled", {
        containerId: "ui",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setPublishing(false);
    }
  }

  function getFutureDate(hours) {
    const date = new Date();
    date.setHours(date.getHours() + hours);

    return date.toISOString();
  }

  return (
    <>
      <div className="flex gap-4  md:items-center md:justify-between">
        <input
          type="text"
          placeholder="Story Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`text-lg md:text-3xl font-bold outline-none w-full bg-transparent ${lora.className}`}
        />

        <div className="flex items-center gap-2 md:gap-4">
          {!postId ? (
            <button
              onClick={onSaveDraft}
              disabled={saving}
              className="px-2 py-1 md:px-4 md:py-2 rounded-sm md:rounded-lg bg-[#5A2A27] hover:bg-[#3d1917] text-white text-xs md:text-sm font-medium disabled:opacity-60 whitespace-nowrap"
            >
              {saving ? "Saving..." : "Save Draft"}
            </button>
          ) : (
            <EditorOptionsMenu
              status={status}
              publishing={publishing}
              postId={postId}
              setShowScheduleModal={setShowScheduleModal}
              togglePublish={togglePublish}
              cancelSchedule={cancelSchedule}
            />
          )}

          <p className="text-[10px] md:text-xs text-muted-foreground">
            {saveStatus === "saving" && "Saving..."}
            {saveStatus === "saved" && "Saved"}
            {saveStatus === "error" && "Save failed"}
          </p>
        </div>
      </div>
      {status === "scheduled" && scheduleDate && (
        <p className="text-[10px] md:text-xs text-amber-700">
          Scheduled for{" "}
          {new Date(scheduleDate).toLocaleString([], {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      )}

      {/* schedule modal */}
      <ScheduleModal
        showScheduleModal={showScheduleModal}
        setShowScheduleModal={setShowScheduleModal}
        getFutureDate={getFutureDate}
        scheduleDate={scheduleDate}
        setScheduleDate={setScheduleDate}
        status={status}
        schedulePost={schedulePost}
      />
    </>
  );
}
