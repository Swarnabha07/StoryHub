"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import EditorHeader from "./EditorHeader";
import RichTextEditor from "./RichTextEditor";
import PostImageUploader from "./PostImageUploader";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { useStore } from "@/Store/store";
import { useSession } from "next-auth/react";
import { Bounce, ToastContainer, toast } from "react-toastify";
import Image from "next/image";

export default function PostEditor({ initialPost }) {
  const { data: session, status } = useSession();
  const { isSidebarOpen, setIsSidebarOpen } = useStore();
  const router = useRouter();
  const [title, setTitle] = useState(initialPost?.title || "");
  const [content, setContent] = useState(initialPost?.content || "");
  const [coverImagePath, setCoverImagePath] = useState(
    initialPost?.coverImagePath || null,
  );
  const [coverImageUrl, setCoverImageUrl] = useState(
    initialPost?.coverImageUrl || null,
  );
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef(null);
  const lastSavedRef = useRef({
    title: initialPost?.title,
    content: initialPost?.content,
  });

  // idle | saving | saved | error
  const [saveStatus, setSaveStatus] = useState("idle");

  const isEditMode = Boolean(initialPost?.id);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, session, router]);

  //Debouncing
  useEffect(() => {
    if (!isEditMode) return;

    // if (title.trim().length < 3 && content.trim().length < 10) return;

    // Detect real changes
    const isUnchanged =
      title === lastSavedRef.current.title &&
      content === lastSavedRef.current.content;

    if (isUnchanged) {
      setSaveStatus("saved");
      return;
    }

    setSaveStatus("saving");

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/posts/id/${initialPost.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            content,
          }),
        });

        if (!res.ok) throw new Error();

        lastSavedRef.current = { title, content };
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    }, 1000);

    return () => clearTimeout(debounceRef.current);
  }, [title, content, isEditMode, initialPost?.id]);

  async function refreshSignedCover(path) {
    const res = await fetch("/api/posts/images/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coverImagePath: path }),
    });

    const data = await res.json();
    if (!res.ok) {
      toast.error("Failed to load cover image", {
        containerId: "ui",
      });
      return;
    }
    setCoverImageUrl(data.signedUrl);
  }

  async function savePost() {
    if (!title.trim() || !content.trim()) {
      toast.warn("Title and content are required", {
        containerId: "ui",
      });
      return;
    }

    if (title.length > 150) {
      toast.warn("Title is too long", {
        containerId: "ui",
      });
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(
        isEditMode ? `/api/posts/id/${initialPost.id}` : "/api/posts",
        {
          method: isEditMode ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            content,
            status: "draft",
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      if (!isEditMode) {
        router.push(`/editor/${data.post.id}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save", {
        containerId: "ui",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Navbar />
      <div className="bg-black h-0.5 opacity-20"></div>
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Overlay (click outside to close) */}
            <motion.div
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setIsSidebarOpen(false)}
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            <Sidebar />
          </>
        )}
      </AnimatePresence>
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        {/* Cover Preview */}
        {coverImageUrl && (
          <Image
            src={coverImageUrl}
            alt="Cover"
            width={220}
            height={160}
            unoptimized
            className="w-full h-40 md:h-64 object-cover rounded-xl border"
          />
        )}

        {/* Cover Upload */}
        <PostImageUploader
          postId={initialPost?.id}
          value={coverImagePath}
          onChange={async (path) => {
            setCoverImagePath(path);
            await refreshSignedCover(path);
          }}
        />

        <EditorHeader
          title={title}
          setTitle={setTitle}
          onSaveDraft={savePost}
          saving={saving}
          saveStatus={saveStatus}
          postId={initialPost?.id}
          postSlug={initialPost?.slug}
          initialStatus={initialPost?.status}
          initialScheduledFor={initialPost?.scheduledFor}
        />

        <RichTextEditor content={content} onChange={setContent} />
      </div>
    </div>
  );
}
