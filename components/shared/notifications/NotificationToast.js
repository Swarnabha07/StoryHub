"use client";

import Image from "next/image";

export default function NotificationToast({ actor, message }) {
  return (
    <div className="flex gap-2 items-center text-xs">
      <Image
        className="rounded-full cursor-pointer object-cover w-[25px] h-[25px]"
        src={actor.profileImageUrl || "/defaultAvatar.png"}
        height={25}
        width={25}
        alt="User profile picture"
        unoptimized
      ></Image>
      <p>
        <span className="font-medium">{actor.username}</span> {message}
      </p>
    </div>
  );
}
