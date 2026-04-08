"use client";

import { useState, useEffect } from "react";
import SearchBar from "../shared/search/SearchBar";
import SearchResults from "../shared/search/SearchResults";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "../layout/Sidebar";
import { useStore } from "@/Store/store";
import Navbar from "../layout/Navbar";

export default function SearchClient() {
  const { isSidebarOpen, setIsSidebarOpen } = useStore();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ users: [], posts: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults({ users: [], posts: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${query}`);
        const data = await res.json();
        setResults(data);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

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

      <div className="max-w-5xl mx-auto px-4 py-10">
        <SearchBar query={query} setQuery={setQuery} />
        <SearchResults results={results} loading={loading} query={query} />
      </div>
    </main>
  );
}
