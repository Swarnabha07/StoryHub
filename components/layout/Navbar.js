"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Lora } from "next/font/google";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useStore } from "@/Store/store";

const lora = Lora({
  weight: "600",
  subsets: ["latin"],
});

const Navbar = ({
  showLogin,
  setShowLogin,
  signInClicked,
  setSignInClicked,
}) => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { setIsSidebarOpen, unreadCount, setUnreadCount } = useStore();
  const [images, setImages] = useState({
    profileImage: null,
    coverImage: null,
  });
  const [loading, setLoading] = useState(true);

  // FETCH SIGNED URLS ON PAGE LOAD
  useEffect(() => {
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

  useEffect(() => {
    if (!session?.user?.id || pathname === "/activity") return;

    async function fetchUnreadCount() {
      try {
        const res = await fetch("/api/activity/unread-count");
        const data = await res.json();
        setUnreadCount(data.count);
      } catch (err) {
        console.error("Failed to fetch unread count");
      }
    }

    fetchUnreadCount();
  }, [session?.user?.id, pathname]);

  if (session) {
    return (
      <>
        <nav className="bg-[#FFFDF9] flex items-center px-1 py-2 md:px-6 lg:px-8 lg:py-4">
          <ul className="flex items-center gap-4 md:gap-10 lg:gap-16">
            <li>
              <svg
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                className="cursor-pointer fill-[#9c9c9c] hover:fill-[#000000] transition-colors duration-100 h-[25px] w-[25px] lg:h-[35px] lg:w-[35px]"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 -960 960 960"
              >
                <path d="M120-680v-80h720v80H120Zm0 480v-80h720v80H120Zm0-240v-80h720v80H120Z" />
              </svg>
            </li>
            <li>
              <div className="logo flex justify-center items-center gap-0.5 lg:gap-1">
                <svg
                  className="h-[25px] w-[25px] lg:h-[35px] lg:w-[35px]"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 -960 960 960"
                  fill="#000000"
                >
                  <path d="m490-527 37 37 217-217-37-37-217 217ZM200-200h37l233-233-37-37-233 233v37Zm355-205L405-555l167-167-29-29-219 219-56-56 218-219q24-24 56.5-24t56.5 24l29 29 50-50q12-12 28.5-12t28.5 12l93 93q12 12 12 28.5T828-678L555-405ZM270-120H120v-150l285-285 150 150-285 285Z" />
                </svg>
                <Link href={`/`}>
                  <span
                    className={`text-[#1F2937] text-2xl lg:text-3xl ${lora.className} cursor-pointer`}
                  >
                    StoryHub
                  </span>
                </Link>
              </div>
            </li>
            <li className="hidden lg:block">
              <Link href={`/search`}>
                <lord-icon
                  className=" w-8 h-8 md:w-10 md:h-10 lg:w-[50px] lg:h-[50px]"
                  src="https://cdn.lordicon.com/wjyqkiew.json"
                  trigger="hover"
                  colors="primary:#121331,secondary:#794628"
                ></lord-icon>
              </Link>
            </li>
          </ul>
          <ul className="flex items-center gap-4 md:gap-10 lg:gap-16 ml-auto">
            <li className="block lg:hidden">
              <Link href={`/search`}>
                <lord-icon
                  className="w-6 h-6 md:w-10 md:h-10"
                  src="https://cdn.lordicon.com/wjyqkiew.json"
                  trigger="hover"
                  colors="primary:#121331,secondary:#794628"
                ></lord-icon>
              </Link>
            </li>
            <li>
              <Link href={`/editor/new`}>
                <lord-icon
                  className=" w-6 h-6 md:w-10 md:h-10 lg:w-[50px] lg:h-[50px]"
                  src="https://cdn.lordicon.com/fikcyfpp.json"
                  trigger="hover"
                  colors="primary:#000000,secondary:#545454"
                ></lord-icon>
              </Link>
            </li>
            <li>
              <Link
                href="/activity"
                className="relative flex items-center justify-center mb-1 md:mb-0 leading-none"
              >
                {/* ICON */}
                <lord-icon
                  src="https://cdn.lordicon.com/apmrcxtj.json"
                  trigger="hover"
                  colors="primary:#121331,secondary:#d59f80"
                  className="w-6 h-6 md:w-10 md:h-10 lg:w-[50px] lg:h-[50px]"
                ></lord-icon>

                {/* BADGE */}
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 
        min-w-[16px] h-[16px] px-1.5 
        sm:min-w-[18px] sm:h-[18px] 
        md:min-w-[20px] md:h-[20px]
        flex items-center justify-center
        bg-red-500 text-white 
        text-[9px] sm:text-[10px] md:text-xs 
        font-semibold rounded-full leading-none"
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            </li>
            <li>
              <Link href={`/dashboard`}>
                <Image
                  className="rounded-full cursor-pointer object-cover w-[50px] h-[50px] lg:block hidden"
                  src={images.profileImage || "/defaultAvatar.png"}
                  height={50}
                  width={50}
                  alt="User profile picture"
                  unoptimized
                ></Image>
              </Link>
            </li>
          </ul>
        </nav>
      </>
    );
  }

  return (
    <nav className="bg-[#FFFDF9] flex items-center px-4 py-2 md:px-6 lg:px-28 lg:py-6">
      <div className="logo flex justify-center items-center gap-0.5 lg:gap-1">
        <svg
          className="h-[25px] w-[25px] lg:h-[35px] lg:w-[35px]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 -960 960 960"
          fill="#000000"
        >
          <path d="m490-527 37 37 217-217-37-37-217 217ZM200-200h37l233-233-37-37-233 233v37Zm355-205L405-555l167-167-29-29-219 219-56-56 218-219q24-24 56.5-24t56.5 24l29 29 50-50q12-12 28.5-12t28.5 12l93 93q12 12 12 28.5T828-678L555-405ZM270-120H120v-150l285-285 150 150-285 285Z" />
        </svg>
        <Link href={`/`}>
          <span
            className={`text-[#1F2937] text-2xl lg:text-3xl ${lora.className} cursor-pointer`}
          >
            StoryHub
          </span>
        </Link>
      </div>
      <ul className="flex items-center gap-4 md:gap-10 lg:gap-20 ml-auto">
        <Link href={`/about`}>
          <li
            className={`text-lg md:text-xl cursor-pointer hover:underline text-[#1F2937] ${
              pathname === "/about" ? "underline" : ""
            }`}
          >
            Our Story
          </li>
        </Link>
        <li
          onClick={() => {
            setSignInClicked(true);
            setShowLogin(true);
          }}
          className={`text-lg md:text-xl  cursor-pointer hover:underline text-[#1F2937] ${
            signInClicked ? "underline" : ""
          }`}
        >
          Sign in
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
