import Image from "next/image";
import Link from "next/link";
import CommentOptionsMenu from "./CommentOptionsMenu";

export default function CommentHeader({
  author,
  postAuthor,
  createdAt,
  comment,
  currentUserId,
  onEdit,
  onDelete,
  isEdited,
  isDeleted,
}) {
  return (
    <div className="flex items-center gap-3 text-xl text-gray-600">
      <Link
        href={`/profile/${author.username}`}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Image
          src={
            typeof author.profileImageUrl === "string"
              ? author.profileImageUrl
              : "/defaultAvatar.png"
          }
          unoptimized
          height={30}
          width={30}
          alt="profile"
          className="rounded-full object-cover h-[50px] w-[50px]"
        />
      </Link>
      <Link
        href={`/profile/${author.username}`}
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="font-semibold text-[#5A2A27] tracking-tight truncate hover:underline"
      >
        {author.username}
      </Link>
      {!isDeleted && <span className="text-base">•</span>}
      {!isDeleted && <span className="text-lg">{createdAt}</span>}
      {author._id === postAuthor && (
        <span className="text-sm text-gray-500 ml-2">[author]</span>
      )}
      {isEdited && !isDeleted && (
        <span className="text-sm text-gray-500 ml-2">(edited)</span>
      )}
      {author._id === currentUserId && !comment.isDeleted && (
        <CommentOptionsMenu
          comment={comment}
          currentUserId={currentUserId}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}
