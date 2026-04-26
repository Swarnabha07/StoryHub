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
    <div className="flex items-center gap-2 md:gap-3 text-xs md:text-xl text-gray-600 min-w-0">
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
          className="rounded-full object-cover h-[28px] w-[28px] md:h-[50px] md:w-[50px] shrink-0"
        />
      </Link>
      <Link
        href={`/profile/${author.username}`}
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="font-semibold text-xs md:text-xl text-[#5A2A27] tracking-tight truncate hover:underline"
      >
        {author.username}
      </Link>
      {!isDeleted && <span className="text-[10px] md:text-sm">•</span>}
      {!isDeleted && (
        <span className="text-[10px] md:text-base">{createdAt}</span>
      )}
      {author._id === postAuthor && (
        <span className="text-[10px] md:text-sm text-gray-500 ml-2">
          [author]
        </span>
      )}
      {isEdited && !isDeleted && (
        <span className="text-[10px] md:text-sm text-gray-500 ml-2">
          (edited)
        </span>
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
