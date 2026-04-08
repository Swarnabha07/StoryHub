"use client";

import Navbar from "../layout/Navbar";
import Sidebar from "../layout/Sidebar";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/Store/store";
import { Lora } from "next/font/google";
import EmailPreferences from "../shared/settings/EmailPreferences";

const lora = Lora({
  weight: "600",
  subsets: ["latin"],
});

export default function SettingsClient() {
  const { isSidebarOpen, setIsSidebarOpen } = useStore();

  return (
    <main className=" min-h-screen bg-[#FFFDF9]">
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

      <div className="flex flex-col items-center gap-6 w-full px-20 mx-auto">
        <h2
          className={`text-4xl font-bold border-b border-[#a1a1a1] py-2 my-4 ${lora.className}`}
        >
          Settings
        </h2>

        <EmailPreferences />
      </div>
    </main>
  );
}
