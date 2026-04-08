"use client";
import Link from "next/link";
import { FileX } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/Store/store";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

export default function PostNotFound() {
  const { isSidebarOpen, setIsSidebarOpen } = useStore();

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
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center px-4">
        {/* Icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f0ebe7] text-gray-600">
          <FileX className="h-8 w-8" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-semibold text-gray-900">Post not found</h1>

        {/* Description */}
        <p className="max-w-md text-sm text-gray-500">
          The post you’re looking for doesn’t exist or may have been removed.
        </p>

        {/* Action */}
        <Link
          href="/"
          className="mt-2 inline-flex items-center rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
