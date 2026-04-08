export default function CommentBody({ content, isDeleted }) {
  if (isDeleted) {
    return (
      <p className="text-gray-400 italic mt-1 text-lg">
        [This comment was deleted]
      </p>
    );
  }

  return <p className="mt-1 text-gray-800 text-lg">{content}</p>;
}
