"use client";
import React, { useEffect, useState } from "react";
import { Lora } from "next/font/google";
import Navbar from "../layout/Navbar";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/Store/store";
import Sidebar from "../layout/Sidebar";
import { useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { Bounce, ToastContainer, toast } from "react-toastify";

const lora = Lora({
  weight: "500",
  subsets: ["latin"],
});

const NewBlog = () => {
  const { data: session, status } = useSession();
  const { isSidebarOpen, setIsSidebarOpen } = useStore();
  const router = useRouter();
  const [blog, setBlog] = useState({ title: "", description: "" });

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, session, router]);

  const handleChange = (e) => {
    setBlog({ ...blog, [e.target.name]: e.target.value });
  };

  const handlePublish = () => {
    toast.success("Story published", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Bounce,
    });
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
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
        <div className="flex flex-col justify-center items-center space-y-2 md:space-y-6 my-10">
          <input
            name="title"
            value={blog.title ? blog.title : ""}
            onChange={handleChange}
            type="text"
            placeholder="Title"
            className={`w-3/4 p-4 rounded-xl bg-[#FFFDF9] text-gray-600 
              placeholder-gray-400 border-b-2 border-[#b86c67]/60
              focus:outline-none focus:border-[#5A2A27] 
              text-3xl shadow-lg shadow-black/20
              transition-all duration-300 ${lora.className}`}
          />

          <textarea
            name="description"
            value={blog.description ? blog.description : ""}
            onChange={handleChange}
            placeholder="Tell your story..."
            className={`w-3/4 min-h-[50vh] md:min-h-[70vh] p-5 rounded-2xl bg-[#FFFDF9] text-gray-600 text-lg
              placeholder-gray-400 border border-[#b86c67]/40
              focus:outline-none focus:ring-2 focus:ring-[#5A2A27] 
              shadow-xl shadow-black/20 resize-none
              transition-all duration-300 ${lora.className}`}
          />
        </div>

        <div>
          <button
            onClick={() => {
              handlePublish();
            }}
            disabled={blog.title.length < 3 || blog.description.length < 5}
            className="cursor-pointer text-2xl bg-[#943a34] hover:bg-[#964e49] 
              rounded-xl px-8 py-3 fixed bottom-8 right-8 not-disabled:shadow-lg 
              not-disabled:hover:scale-105 transition-all duration-300 text-white disabled:cursor-not-allowed disabled:bg-gray-300 "
          >
            Publish
          </button>

          {/* {showNote && (
              <button
                className="cursor-pointer text-2xl bg-red-500 hover:bg-red-700 
                rounded-xl px-8 py-3 fixed bottom-8 left-8 shadow-lg 
                hover:scale-105 transition-all duration-300"
              >
                DELETE
              </button>
            )} */}

          {/* <button
            className=" md:mt-4 px-6 py-2 bg-[#9c589c] text-white rounded-lg 
              hover:bg-[#703870] absolute top-17 md:top-20 left-3 md:left-5 cursor-pointer 
              shadow-md hover:scale-105 transition-all duration-300"
          >
            Back
          </button> */}
        </div>
      </div>
    </>
  );
};

export default NewBlog;
