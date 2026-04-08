"use client";

import { useState } from "react";

export default function AvatarUpload({
  userId,
  field = "profileImage", // "profileImage" or "coverImage"
  onDone,
  children,
  className = "",
}) {
  const [loading, setLoading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (file.size > 5 * 1024 * 1024) return alert("Max 5MB allowed.");
    if (!file.type.startsWith("image/"))
      return alert("Only image files allowed.");

    setLoading(true);

    try {
      // Send file + field to backend
      const form = new FormData();
      form.append("file", file);
      form.append("field", field);

      const res = await fetch("/api/profile/images/upload", {
        method: "PUT",
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed!");

      // Upload succeeded
      onDone?.(true);
    } catch (err) {
      console.error(err);
      alert(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <label className={` block ${className}`}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFile}
        disabled={loading}
        className="hidden"
      />

      <div className="relative">
        {children}

        {loading && (
          <div
            className={`absolute inset-0 bg-black/40 ${
              field === "profileImage" ? "rounded-full" : ""
            } flex items-center justify-center text-white text-sm`}
          >
            Uploading...
          </div>
        )}
      </div>
    </label>
  );
}
