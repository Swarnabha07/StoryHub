export default function SearchBar({ query, setQuery }) {
  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search users or posts..."
      className="w-full px-4 py-3 border rounded-lg bg-[#e6e7e9] hover:bg-[#d7d7db]"
    />
  );
}
