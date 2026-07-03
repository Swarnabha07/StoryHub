"use client";

import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/Store/store";
import { AlertTriangle, RefreshCcw, House } from "lucide-react";
import Link from "next/link";

export default function Error({ error, reset }) {
  const { isSidebarOpen, setIsSidebarOpen } = useStore();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FFFDF9]">
      {/* Navbar */}
      <Navbar />
      <div className="bg-black h-0.5 opacity-20"></div>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/60"
              onClick={() => setIsSidebarOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            />

            <Sidebar />
          </>
        )}
      </AnimatePresence>

      {/* Background Gradient Orbs */}
      <div className="pointer-events-none absolute left-[-120px] top-20 h-[320px] w-[320px] rounded-full " />

      <div className="pointer-events-none absolute bottom-10 right-[-120px] h-[320px] w-[320px] rounded-full " />

      {/* Noise Texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url('https://grainy-gradients.vercel.app/noise.svg')",
        }}
      />

      {/* Main Content */}
      <section className="relative z-10 flex min-h-[calc(100vh-70px)] items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative w-full max-w-2xl overflow-hidden rounded-[36px] p-10 "
        >
          {/* Huge Background Error Code */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <h1 className="select-none text-[170px] font-black leading-none tracking-[-10px] text-black/[0.035]">
              500
            </h1>
          </div>

          {/* Floating Icon */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl border border-orange-200 bg-orange-50 shadow-sm"
          >
            <AlertTriangle
              className="text-orange-500"
              size={34}
              strokeWidth={2.2}
            />
          </motion.div>

          {/* Content */}
          <div className="relative text-center">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-3 text-sm font-medium tracking-[0.2em] text-black/40 uppercase"
            >
              Internal Server Error
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-4 text-4xl font-black tracking-tight text-black md:text-5xl"
            >
              We hit an unexpected issue.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mx-auto max-w-xl text-base leading-7 text-black/60 md:text-lg"
            >
              Don&apos;t worry — your analytics, posts, and account data are
              safe. Try refreshing the page or head back to the home page.
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              {/* Retry Button */}
              <button
                onClick={() => reset()}
                className="group inline-flex items-center gap-2 rounded-full bg-[#5A2A27] px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:scale-[1.03] hover:bg-black/90 active:scale-[0.98]"
              >
                <RefreshCcw
                  size={16}
                  className="transition-transform duration-300 group-hover:rotate-180"
                />
                Try Again
              </button>

              {/* Home Button */}
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-medium text-[#5A2A27] transition-all duration-300 hover:scale-[1.03] hover:border-black/20 hover:bg-black/[0.02] active:scale-[0.98]"
              >
                <House size={16} />
                Go Home
              </Link>
            </motion.div>

            {/* Bottom Status */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="mt-10 flex flex-col items-center justify-center gap-3"
            >
              <div className="flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-4 py-2 text-xs font-medium text-black/60">
                <div className="h-2 w-2 rounded-full bg-orange-400" />
                System Status: Recovering
              </div>

              <p className="text-xs text-black/35">
                Error ID:{" "}
                {error?.digest
                  ? error.digest.slice(0, 12)
                  : "UNEXPECTED_RUNTIME_ERROR"}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
