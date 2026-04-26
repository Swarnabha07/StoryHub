export default function CommentBody({ content, isDeleted, parentAuthor }) {
  if (isDeleted) {
    return (
      <p className="text-gray-400 italic mt-1 text-sm md:text-lg">
        [This comment was deleted]
      </p>
    );
  }

  return (
    <p className="mt-1 text-gray-800 text-[11px] md:text-lg wrap-break-word">
      {parentAuthor && (
        <span className="text-[#C5A572] font-medium">
          Replying to @{parentAuthor}{" "}
        </span>
      )}
      {content}
    </p>
  );
}
