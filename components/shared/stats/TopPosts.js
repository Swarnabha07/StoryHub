import Link from "next/link";
import PostResultCard from "../search/PostResultCard";

export default function TopPosts({ posts }) {
  if (posts?.length === 0)
    return (
      <div className="w-full xl:w-4/5  rounded-2xl px-3 md:px-6">
        <h3 className="text-sm md:text-lg font-semibold mb-4">
          Most Engaged Stories
        </h3>
        <div className="flex flex-col items-center gap-8 py-16 text-center">
          <p className="text-gray-400 text-base md:text-lg">
            Nothing here yet — your stories are waiting.
          </p>
          <Link href="/editor/new">
            <button className="px-6 md:px-8 py-2 text-sm md:text-base font-medium bg-[#fcf8f2] border border-[#ede6e1] rounded-full text-black hover:bg-[#c5a572] hover:text-[#FFFDF9] transition-colors duration-200 cursor-pointer">
              Write your first story
            </button>
          </Link>
        </div>
      </div>
    );
  return (
    <div className="w-full xl:w-4/5  rounded-2xl px-3 md:px-6">
      <h3 className="text-sm md:text-lg font-semibold mb-4">
        Most Engaged Stories
      </h3>

      <div className="flex flex-col gap-4">
        {posts?.map((post) => {
          return <PostResultCard key={post._id} post={post} />;
        })}
      </div>
    </div>
  );
}
