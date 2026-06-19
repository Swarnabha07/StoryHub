"use client";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function EditorOptionsMenu({
  status,
  publishing,
  postId,
  setShowScheduleModal,
  togglePublish,
  cancelSchedule,
}) {
  const label =
    status === "draft"
      ? "Publish"
      : status === "scheduled"
        ? "Scheduled"
        : "Published";

  if (!postId) {
    return (
      <button
        disabled
        className={`px-2 py-1 md:px-4 md:py-2 rounded-sm md:rounded-lg text-xs md:text-sm font-medium whitespace-nowrap flex items-center gap-2
      bg-slate-100 text-black cursor-not-allowed`}
      >
        {label}
        <ChevronDown className="h-4 w-4" />
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={!postId || publishing}
          className={`px-2 py-1 md:px-4 md:py-2 rounded-sm md:rounded-lg text-xs md:text-sm font-medium whitespace-nowrap flex items-center gap-2
          ${
            status === "draft"
              ? "bg-[#C5A572] text-white hover:bg-[#b89257]"
              : "border border-gray-300"
          }
          disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-black`}
        >
          {label}
          <ChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        {status === "draft" && (
          <>
            <DropdownMenuItem onClick={togglePublish}>
              Publish now
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => setShowScheduleModal(true)}>
              Schedule
            </DropdownMenuItem>
          </>
        )}

        {status === "scheduled" && (
          <>
            <DropdownMenuItem onClick={togglePublish}>
              Publish now
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => setShowScheduleModal(true)}>
              Reschedule
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={cancelSchedule} className="text-red-600">
              Cancel schedule
            </DropdownMenuItem>
          </>
        )}

        {status === "published" && (
          <DropdownMenuItem onClick={togglePublish}>
            Move to draft
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
