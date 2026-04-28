"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Bounce, ToastContainer, toast } from "react-toastify";
import { useSession } from "next-auth/react";

export default function ProfileOptionsMenu({ currentUser }) {
  const { data: session } = useSession();

  const copyLink = () => {
    toast.success("Link copied to clipboard", {
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
    navigator.clipboard.writeText(window.location.href);
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="border border-gray-400 hover:border-gray-950 hover:bg-gray-200 cursor-pointer rounded-xl px-1.5 py-0.5 transition-all ease-in-out duration-400">
            <svg
              className="h-6 w-6 md:h-10 md:w-10"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 -960 960 960"
              fill="#1f1f1f"
            >
              <path d="M207.86-432Q188-432 174-446.14t-14-34Q160-500 174.14-514t34-14Q228-528 242-513.86t14 34Q256-460 241.86-446t-34 14Zm272 0Q460-432 446-446.14t-14-34Q432-500 446.14-514t34-14Q500-528 514-513.86t14 34Q528-460 513.86-446t-34 14Zm272 0Q732-432 718-446.14t-14-34Q704-500 718.14-514t34-14Q772-528 786-513.86t14 34Q800-460 785.86-446t-34 14Z" />
            </svg>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => copyLink()}>
            Copy link to Profile
          </DropdownMenuItem>

          {currentUser?.email !== session?.user?.email && (
            <div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                Block User
              </DropdownMenuItem>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
