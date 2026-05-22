"use client";
import React, { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { Lora } from "next/font/google";
import Navbar from "../layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { useStore } from "@/Store/store";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import AvatarUpload from "../shared/profile/AvatarUpload";
import { fetchUser } from "@/actions/useractions";
import { Bounce, ToastContainer, toast } from "react-toastify";

const lora = Lora({
  weight: "700",
  subsets: ["latin"],
});

const Dashboard = () => {
  const { data: session, status, update } = useSession();
  const { isSidebarOpen, setIsSidebarOpen } = useStore();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", username: "", bio: "" });
  const [images, setImages] = useState({
    profileImage: null,
    coverImage: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // REDIRECT UNAUTHENTICATED USERS
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status]);

  // FOR FETCHING CURRENT USER FEILDS
  useEffect(() => {
    if (!session?.user?.id) return;

    const getData = async () => {
      const data = await fetchUser(session?.user?.username);

      setForm({
        name: data.name || session.user.name || "",
        username: data.username || session.user.username || "",
        bio: data.bio || session.user.bio || "",
      });
    };
    getData();
  }, [session?.user?.id]);

  // FETCH SIGNED URLS ON PAGE LOAD
  useEffect(() => {
    if (!session?.user?.id) return;

    async function loadImages() {
      try {
        const res = await fetch(
          `/api/profile/images/getsignedurl?userId=${session?.user?.id}`,
        );
        const data = await res.json();

        setImages({
          profileImage: data.profileImage || null,
          coverImage: data.coverImage || null,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadImages();
  }, [session?.user?.id]);

  // HANDLE AFTER Upload
  const refreshSignedUrls = async () => {
    if (!session?.user?.id) return;

    const res = await fetch(
      `/api/profile/images/getsignedurl?userId=${session.user.id}`,
    );
    const data = await res.json();

    setImages({
      profileImage: data.profileImage || null,
      coverImage: data.coverImage || null,
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;
    setSaving(true);

    if (form.username.length > 30) {
      toast.warn(`Username is too long`, {
        containerId: "ui",
      });
      setSaving(false);
      return;
    }
    if (form.name.length > 50) {
      toast.warn(`Name is too long`, {
        containerId: "ui",
      });
      setSaving(false);
      return;
    }
    if (form.bio.length > 400) {
      toast.warn(`Bio is too long`, {
        containerId: "ui",
      });
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          username: form.username.trim().toLowerCase(),
          bio: form.bio.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      await update();

      toast.success("Profile updated successfully", {
        containerId: "ui",
      });
      router.refresh(); // refresh server components
    } catch (err) {
      console.error(err);
      toast.warn(`${err.message}`, {
        containerId: "ui",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
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
      <div className="w-full mx-auto flex flex-col items-center gap-8 md:gap-10 pb-14">
        <div className="images relative w-full h-[220px] md:h-[300px] lg:h-[350px] flex flex-col items-center">
          {/* ------------ COVER IMAGE -------------- */}
          <div className="relative w-full h-[350px] group">
            <AvatarUpload
              userId={session?.user?.id}
              field="coverImage"
              onDone={refreshSignedUrls}
              className="w-full h-full"
            >
              <div className="relative w-full h-full">
                <Image
                  src={images.coverImage || "/defaultCover.png"}
                  alt="Cover"
                  width={1200}
                  height={400}
                  className="w-full h-[220px] md:h-[300px] lg:h-[350px] object-cover"
                  unoptimized
                />

                {/* Hover camera icon */}
                <div className="absolute top-4 right-4 bg-black/60 p-2 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>
            </AvatarUpload>
          </div>

          {/* ------------ PROFILE IMAGE -------------- */}
          <div className="absolute -bottom-10  md:-bottom-16 group">
            <AvatarUpload
              userId={session?.user?.id}
              field="profileImage"
              onDone={refreshSignedUrls}
              className="block"
            >
              <div className="relative w-[100px] h-[100px] md:w-[150px] md:h-[150px]">
                <Image
                  src={images.profileImage || "/defaultAvatar.png"}
                  alt="User avatar"
                  width={150}
                  height={150}
                  className="rounded-full border-4 border-white shadow-xl object-cover w-[100px] h-[100px] md:w-[150px] md:h-[150px]"
                  unoptimized
                />

                <div className="absolute bottom-2 right-2 bg-black/70 p-1.5 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </div>
            </AvatarUpload>
          </div>
        </div>

        <form
          className="inputContainer w-full md:w-fit px-4 md:px-0 space-y-5 md:space-y-6 mt-8 md:mt-14"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">Email</label>
            <input
              type="text"
              readOnly
              value={session?.user?.email ?? ""}
              className="w-full md:w-[500px] bg-white text-left text-gray-800 px-4 py-3 rounded-xl shadow-sm border border-gray-300 
             focus:border-[#C5A572] focus:ring-2 focus:ring-[#C5A572]/40 focus:outline-none 
             placeholder:text-gray-400 transition"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={form.username ? form.username : ""}
              onChange={handleChange}
              placeholder="Enter username"
              className="w-full md:w-[500px] bg-white text-left text-gray-800 px-4 py-3 rounded-xl shadow-sm border border-gray-300 
             focus:border-[#C5A572] focus:ring-2 focus:ring-[#C5A572]/40 focus:outline-none 
             placeholder:text-gray-400 transition"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">Name</label>
            <input
              type="text"
              placeholder="Enter name"
              name="name"
              value={form.name ? form.name : ""}
              onChange={handleChange}
              className="w-full md:w-[500px] bg-white text-left text-gray-800 px-4 py-3 rounded-xl shadow-sm border border-gray-300 
             focus:border-[#C5A572] focus:ring-2 focus:ring-[#C5A572]/40 focus:outline-none 
             placeholder:text-gray-400 transition"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">About you</label>
            <textarea
              value={form.bio ? form.bio : ""}
              name="bio"
              onChange={handleChange}
              placeholder="Write something about you..."
              className="w-full md:w-[500px] bg-white text-left text-gray-800 px-4 py-3 rounded-xl shadow-sm border border-gray-300 
             focus:border-[#C5A572] focus:ring-2 focus:ring-[#C5A572]/40 focus:outline-none 
             placeholder:text-gray-400 transition"
              rows="4"
            ></textarea>
          </div>

          <button
            disabled={saving}
            className="bg-[#C5A572] text-white font-bold cursor-pointer w-full md:w-[500px] py-2 rounded-lg 
             hover:bg-[#b89257] focus:ring-2 focus:ring-[#C5A572]/40 
             focus:outline-none transition duration-200 text-lg md:text-2xl disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Save
          </button>
        </form>
      </div>
    </>
  );
};

export default Dashboard;
