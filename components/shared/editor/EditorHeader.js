"use client";

import { useState } from "react";
import { Lora } from "next/font/google";
import { Bounce, ToastContainer, toast } from "react-toastify";
import Link from "next/link";
import ScheduleModal from "./ScheduleModal";

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
      <div className="flex items-center justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Story Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`text-xl md:text-3xl font-bold outline-none w-full bg-transparent ${lora.className}`}
        />

        <button
          onClick={onSaveDraft}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-[#5A2A27] hover:bg-[#3d1917] text-white text-xs md:text-sm font-medium disabled:opacity-60 whitespace-nowrap"
        >
          {saving ? "Saving..." : "Save Draft"}
        </button>

        <button
          onClick={togglePublish}
          disabled={publishing}
          className={`px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition  whitespace-nowrap
          ${
            !postId
              ? "bg-slate-100 cursor-not-allowed"
              : `${
                  status === "draft"
                    ? "bg-[#C5A572] text-white hover:bg-[#b89257]"
                    : "border border-gray-300"
                }`
          }
            `}
        >
          {publishing
            ? "Updating..."
            : status === "draft"
              ? "Publish"
              : status === "published"
                ? "Unpublish"
                : "Publish Now"}
        </button>

        {status !== "published" && (
          <button
            onClick={() => setShowScheduleModal(true)}
            disabled={!postId || publishing}
            className="px-4 py-2 rounded-lg border border-gray-300 text-xs md:text-sm font-medium whitespace-nowrap disabled:bg-slate-100 disabled:cursor-not-allowed"
          >
            {status === "scheduled" ? "Reschedule" : "Schedule"}
          </button>
        )}

        {status === "scheduled" && (
          <button
            onClick={cancelSchedule}
            disabled={publishing}
            className="px-4 py-2 rounded-lg border border-red-300 text-red-600 text-xs md:text-sm font-medium whitespace-nowrap"
          >
            Cancel Schedule
          </button>
        )}

        <p className="text-xs text-muted-foreground">
          {saveStatus === "saving" && "Saving..."}
          {saveStatus === "saved" && "Saved"}
          {saveStatus === "error" && "Save failed"}
        </p>
      </div>
      {status === "scheduled" && scheduleDate && (
        <p className="text-xs text-amber-700">
          Scheduled for {new Date(scheduleDate).toLocaleString()}
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
