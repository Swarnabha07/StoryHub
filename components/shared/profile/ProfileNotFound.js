"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const ProfileNotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFDF9] px-6">
      {/* Illustration */}
      <div className="flex flex-col items-center gap-6">
        <Image
          src="/empty-user.png"
          alt="Not Found"
          width={220}
          height={220}
          className="opacity-90 rounded-full h-[110px] md:h-[220px] w-[110px] md:w-[220px]"
        />

        {/* Title */}
        <h1 className="text-2xl md:text-4xl font-semibold text-[#1f1f1f] tracking-tight">
          User does not exist
        </h1>

        {/* Subtitle */}
        <p className="text-[#6b625e] text-sm md:text-lg max-w-md text-center leading-relaxed">
          The profile you’re looking for may have been deleted, renamed, or
          never existed on StoryHub.
        </p>

        {/* Actions */}
        <div className="flex gap-4 mt-4">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-full text-sm md:text-base bg-[#5A2A27] text-[#FFFDF9] font-medium
                       hover:bg-[#4b1f1d] transition-all duration-200"
          >
            Go Home
          </Link>

          <Link
            href="/search"
            className="px-5 py-2.5 text-sm md:text-base rounded-full border border-[#d6cec8] text-[#9c7a43] font-medium
                       hover:bg-[#fcf6ee] transition-all duration-200"
          >
            Search Users
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfileNotFound;
