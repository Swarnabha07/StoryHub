"use client";

import { useState } from "react";

export default function PostImageUploader({ postId, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/posts/images/upload/${postId}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Image upload failed");
      }

      const data = await res.json();

      // Important: we only store the PATH, not URL
      onChange(data.coverImagePath);
    } catch (err) {
      console.error(err);
      setError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  }

  if (!postId)
    return (
      <div className="flex justify-center items-center gap-2 bg-yellow-100 rounded-xl py-2 px-4 mb-12 text-yellow-600 text-xs md:text-base">
        <svg
        className="h-6 w-6"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 -960 960 960"
          fill="#d08700"
        >
          <path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z" />
        </svg>
        <p className="">
          You can upload images in your post only after saving the post as draft
        </p>
      </div>
    );

  return (
    <div className="space-y-3">
      {/* Upload button */}
      <label className="inline-block cursor-pointer">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          hidden
        />

        <div className="px-4 py-2 rounded-lg border border-dashed border-[#d6ccc6] text-xs md:text-sm text-[#5A2A27] hover:bg-[#faf7f3] transition">
          {uploading ? "Uploading..." : value ? "Change image" : "Upload image"}
        </div>
      </label>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
