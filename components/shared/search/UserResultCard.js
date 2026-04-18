import Link from "next/link";
import Image from "next/image";

export default function UserResultCard({ user }) {
  return (
    <Link
      href={`/profile/${user.username}`}
      className="flex justify-between items-center group px-2 hover:bg-gray-100 py-1.5 rounded-lg transition-all duration-300 my-6"
    >
      <div className="flex items-center gap-3 md:gap-6">
        <Image
          src={user.profileImageUrl || "/defaultAvatar.png"}
          alt="profile"
          width={40}
          height={40}
          unoptimized
          className="rounded-full border border-[#e8e2dd] bg-white w-[45px] h-[45px] md:w-[60px] md:h-[60px]  object-cover"
        />
        <div>
          <h1 className="md:text-xl font-medium text-[#1f1f1f] group-hover:text-[#5A2A27] transition-colors duration-200">
            {user.name}
          </h1>
          <p className="text-sm md:text-lg text-[#6b625e]">@{user.username}</p>
        </div>
      </div>
    </Link>
  );
}
