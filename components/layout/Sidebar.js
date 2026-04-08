import { motion } from "framer-motion";
import { useStore } from "@/Store/store";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const followings = [
    { name: "Lina Codes", username: "@linacodes" },
    { name: "DevWithJay", username: "@jaydev" },
    { name: "Awais Khan", username: "@angular_with_awais" },
  ];

  const currentYear = new Date().getFullYear();
  const { setIsSidebarOpen } = useStore();
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <motion.div
      initial={{ x: -250, opacity: 1 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -250, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed top-0 left-0 h-full lg:w-1/5 w-1/2 bg-[#FFFDF9] border-r border-[#f0ebe7] px-5 py-7 flex flex-col justify-between z-50 shadow-xl"
    >
      <button
        onClick={() => setIsSidebarOpen(false)}
        className="absolute top-4 right-4 text-[#5A2A27]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24"
          width="24"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 
          12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
          />
        </svg>
      </button>

      {/* Top Menu */}
      <div className="space-y-6 overflow-y-auto scrollbar-hide">
        <nav className="space-y-2 mt-8 md:mt-4">
          {[
            {
              label: "Home",
              icon: "M3 10.5 12 3l9 7.5v10.5a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5z",
            },
            {
              label: "Library",
              icon: "M4 3h2v18H4V3zm14 0h2v18h-2V3zM9 3h6v18H9V3z",
            },
            {
              label: "Profile",
              icon: "M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z",
            },
            {
              label: "Stories",
              icon: "M6 2h9l5 5v15a1 1 0 0 1-1 1H6V2zm9 1.5V8h4.5L15 3.5zM8 10h8v1.5H8V10zm0 3h8v1.5H8V13zm0 3h8v1.5H8V16z",
            },
            {
              label: "Stats",
              icon: "M3 3v18h18v-2H5V3H3zm14 10h2v5h-2v-5zm-4-4h2v9h-2V9zm-4 6h2v3H9v-3z",
            },
          ].map((item, index) => (
            <Link
              href={`${
                item.label === "Profile"
                  ? `/profile/${session?.user?.username}`
                  : item.label === "Library"
                    ? "/library"
                    : item.label === "Stories"
                      ? "/stories"
                      : item.label === "Stats"
                        ? "/stats"
                        : "/"
              }`}
              key={index}
            >
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-[#5A2A27] font-medium text-sm rounded-xl hover:bg-[#faf7f3] transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d={item.icon} />
                </svg>
                {item.label}
              </button>
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <hr className="border-[#ede6e1] my-4" />

        {/* Settings and sign out button */}
        <div className="w-full flex flex-col gap-1">
          <button
            className="text-gray-800 flex items-center  w-full gap-3 px-3 py-2 font-medium text-sm rounded-xl hover:bg-gray-100 transition-colors duration-200"
            onClick={() => {
              router.push("/settings");
              setIsSidebarOpen(false);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="currentColor"
            >
              <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" />
            </svg>
            <span>Settings</span>
          </button>
          <button
            className="text-red-700 flex items-center  w-full gap-3 px-3 py-2 font-medium text-sm rounded-xl hover:bg-red-50 transition-colors duration-200"
            onClick={() => signOut()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="currentColor"
            >
              <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z" />
            </svg>
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="text-xs text-[#6b625e] text-center mt-6">
        © {currentYear} StoryHub
      </div>
    </motion.div>
  );
}
