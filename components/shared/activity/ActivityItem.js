import { timeAgo } from "@/lib/activity/timeAgo";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ActivityItem({ activity }) {
  const router = useRouter();

  const isAggregatedLike =
    activity.type === "POST_LIKE" || activity.type === "COMMENT_LIKE";

  const sizeClass =
    isAggregatedLike && activity.count > 1
      ? "w-[30px] h-[30px] md:w-[42px] md:h-[42px] lg:w-[52px] lg:h-[52px]"
      : "w-[42px] h-[42px] md:w-[50px] md:h-[50px] lg:w-[60px] lg:h-[60px]";

  const hasCover =
    typeof activity.post?.coverImageUrl === "string" &&
    activity.post?.coverImageUrl.length > 0;

  const activityContentMap = {
    USER_FOLLOW: "followed you",
    POST_LIKE: `${
      activity.count > 1
        ? `and ${activity.count - 1} others liked your post`
        : "liked your post"
    } "${activity?.post?.title}"`,
    POST_COMMENT: `commented on your post "${activity?.comment?.content}"`,
    COMMENT_REPLY: `replied to your comment "${activity?.comment?.content}"`,
    COMMENT_LIKE: `${
      activity.count > 1
        ? `and ${activity.count - 1} others liked your comment`
        : "liked your comment"
    } "${activity?.comment?.content}"`,
  };

  const activityRouteMap = {
    USER_FOLLOW: `/profile/${activity.actor?.username}`,
    POST_LIKE: `/posts/${activity.post?.slug}`,
    POST_COMMENT: `/posts/${activity.post?.slug}/comments?comment=${activity?.comment?._id}`,
    COMMENT_REPLY: `/posts/${activity.post?.slug}/comments?comment=${activity?.comment?._id}`,
    COMMENT_LIKE: `/posts/${activity.post?.slug}/comments?comment=${activity?.comment?._id}`,
  };

  const displayText = activityContentMap[activity.type] ?? "did something";
  const targetRoute = activityRouteMap[activity.type];

  return (
    <div
      key={activity._id}
      onClick={() => {
        targetRoute && router.push(targetRoute);
      }}
      className={`flex flex-col md:flex-row  gap-3 md:gap-4  transition-colors duration-200 rounded-xl p-2 ${!activity.isRead ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-100"}`}
    >
      <div className="flex items-start gap-3 md:gap-6 min-w-0 flex-1">
        {isAggregatedLike ? (
          <div className="flex -space-x-2 md:-space-x-3 shrink-0 items-center">
            {activity.actors?.map((actor) => (
              <Link
                key={actor._id}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                href={`/profile/${actor?.username}`}
              >
                <Image
                  src={actor.profileImageUrl || "/defaultAvatar.png"}
                  alt="profile"
                  width={50}
                  height={50}
                  unoptimized
                  className={`rounded-full border border-[#e8e2dd] bg-white ${sizeClass} object-cover shrink-0`}
                />
              </Link>
            ))}
          </div>
        ) : (
          <Link
            onClick={(e) => {
              e.stopPropagation();
            }}
            href={`/profile/${activity.actor?.username}`}
          >
            <Image
              src={activity.actor.profileImageUrl || "/defaultAvatar.png"}
              alt="profile"
              width={60}
              height={60}
              unoptimized
              className={`rounded-full border border-[#e8e2dd] bg-white ${sizeClass} object-cover shrink-0`}
            />
          </Link>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-col md:flex-row gap-1 md:gap-3">
            <p className="flex gap-2 text-sm md:text-lg ">
              <Link
                onClick={(e) => {
                  e.stopPropagation();
                }}
                href={`/profile/${activity.actor?.username}`}
              >
                <b>{activity.actor?.username}</b>
              </Link>{" "}
            </p>
            {displayText && (
              <p className="text-sm md:text-lg line-clamp-2 md:line-clamp-1 wrap-break-word overflow-hidden whitespace-normal">
                {displayText}
              </p>
            )}
          </div>

          <span className="text-[11px] md:text-base text-gray-500">
            {timeAgo(activity.createdAt)}
          </span>
        </div>
      </div>

      {hasCover && (
        <div className="w-full md:w-[110px] h-[160px] md:h-[82px] shrink-0 overflow-hidden rounded-sm border border-[#f0ebe7]">
          <Image
            src={activity.post?.coverImageUrl}
            alt="Post cover"
            width={220}
            height={160}
            unoptimized
            className="w-full h-full object-cover rounded-md"
          />
        </div>
      )}
    </div>
  );
}
