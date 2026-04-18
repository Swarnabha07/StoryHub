"use client";

import { useState } from "react";
import { Lora } from "next/font/google";
import { Bounce, ToastContainer, toast } from "react-toastify";
import Link from "next/link";

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
}) {
  const [status, setStatus] = useState(initialStatus || "draft");
  const [publishing, setPublishing] = useState(false);

  async function togglePublish() {
    if (!postId) return;

    try {
      setPublishing(true);

      const nextStatus = status === "draft" ? "published" : "draft";

      const res = await fetch(`/api/posts/id/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      setStatus(nextStatus);

      if (nextStatus === "published") {
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
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,
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
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={6000}
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
          className={`px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition 
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
            ? "Updating…"
            : status === "draft"
              ? "Publish"
              : "Unpublish"}
        </button>

        <p className="text-xs text-muted-foreground">
          {saveStatus === "saving" && "Saving..."}
          {saveStatus === "saved" && "Saved"}
          {saveStatus === "error" && "Save failed"}
        </p>
      </div>
    </>
  );
}
