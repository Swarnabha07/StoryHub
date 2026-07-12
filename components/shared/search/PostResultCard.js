import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import createDOMPurify from "dompurify";

export default function PostResultCard({ post }) {
  const router = useRouter();

  const [content, setContent] = useState("");

  useEffect(() => {
    const DOMPurify = createDOMPurify(window);
    setContent(DOMPurify.sanitize(post.content));
  }, [post.content]);

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/posts/${post.slug}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(`/posts/${post.slug}`);
      }}
      className=" flex flex-col justify-between cursor-pointer gap-1 hover:bg-gray-100 p-1.5 my-4 rounded-lg transition-all duration-300"
    >
      {/* Profile */}
      <div className="flex items-center gap-2 mb-3">
        <Link
          href={`/profile/${post.author.username}`}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Image
            src={
              typeof post.author.profileImageUrl === "string"
                ? post.author.profileImageUrl
                : "/defaultAvatar.png"
            }
            unoptimized
            height={30}
            width={30}
            alt="profile"
            className="rounded-full border object-cover border-[#e8e2dd] bg-white h-10 w-10"
          />
        </Link>
        <Link
          href={`/profile/${post.author.username}`}
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="text-sm font-medium text-[#5A2A27] tracking-tight truncate hover:underline"
        >
          {post.author.username}
        </Link>
      </div>

      {/* Content + Cover Image Row */}
      <div className="flex gap-4 items-start">
        {/* Text content */}
        <div className="flex-1">
          <h3 className="text-sm md:text-xl font-bold text-[#1f1f1f] leading-snug hover:text-[#5A2A27] transition-colors duration-200 line-clamp-1">
            {post.title}
          </h3>

          <p
            className="text-xs md:text-base text-[#6b625e] mt-2"
            dangerouslySetInnerHTML={{
              __html: content,
            }}
          ></p>
        </div>

        {/* Right side cover image */}
        {typeof post.coverImageUrl === "string" &&
          post.coverImageUrl.length > 0 && (
            <div className="w-[95px] h-15 md:w-[110px] md:h-20 shrink-0 overflow-hidden rounded-sm border border-[#f0ebe7]">
              <Image
                src={post.coverImageUrl}
                alt="Post cover"
                width={220}
                height={160}
                unoptimized
                className="w-full h-full object-cover"
              />
            </div>
          )}
      </div>
      <div className="flex justify-between items-center text-[10px] md:text-sm text-[#6b625e] my-4">
        <h5 className="font-medium">{post.publishedDate}</h5>
      </div>
    </div>
  );
}
