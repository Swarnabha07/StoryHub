import PostEditor from "@/components/shared/editor/PostEditor";
import React from "react";

const page = () => {
  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <PostEditor initialPost={null} />
    </div>
  );
};

export default page;
