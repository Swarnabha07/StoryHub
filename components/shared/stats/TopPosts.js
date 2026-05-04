import PostResultCard from "../search/PostResultCard";

export default function TopPosts({ posts }) {
  return (
    <div className="w-1/2 bg-white border border-gray-100 rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4">Most Engaged Posts</h3>

      <div className="flex flex-col gap-4">
        {posts?.map((post) => {
          return <PostResultCard key={post._id} post={post} />;
        })}
      </div>
    </div>
  );
}
