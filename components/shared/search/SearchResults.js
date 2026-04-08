import UserResultCard from "./UserResultCard";
import PostResultCard from "./PostResultCard";

export default function SearchResults({ results, loading, query }) {
  if (loading)
    return <p className="mt-8 text-gray-400 text-lg">Searching...</p>;

  if (!query || (results.users.length === 0 && results.posts.length === 0)) {
    return <p className="mt-8 text-gray-400 text-lg">No results found</p>;
  }

  return (
    <div className="mt-6 space-y-12">
      {results.users.length > 0 && (
        <section>
          <h3 className="font-bold mb-2 text-2xl">Users</h3>
          <div className="bg-black h-0.5 opacity-5 mb-6"></div>
          {results.users.map((user) => (
            <UserResultCard key={user._id} user={user} />
          ))}
        </section>
      )}

      {results.posts.length > 0 && (
        <section>
          <h3 className="font-bold mb-2 text-2xl">Posts</h3>
          <div className="bg-black h-0.5 opacity-5 mb-6"></div>
          <div className="">
            {results.posts.map((post) => (
              <PostResultCard key={post._id} post={post} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
