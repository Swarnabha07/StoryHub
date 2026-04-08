import { timeAgo } from "@/lib/activity/timeAgo";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ActivityItem({ activity }) {
  const router = useRouter();

  const isAggregatedLike =
    activity.type === "POST_LIKE" || activity.type === "COMMENT_LIKE";

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
      className={`flex items-center justify-between  transition-colors duration-200 rounded-xl p-2 ${!activity.isRead ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-100"}`}
    >
      <div className="flex items-center justify-center gap-6">
        {isAggregatedLike ? (
          <div className="flex -space-x-3">
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
                  className="rounded-full border border-[#e8e2dd] bg-white w-[50px] h-[50px]  object-cover"
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
              className="rounded-full border border-[#e8e2dd] bg-white w-[60px] h-[60px]  object-cover"
            />
          </Link>
        )}

        <div>
          <div className="flex items-center gap-3">
            <p className="flex gap-2 text-lg">
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
              <p className="text-lg  line-clamp-1">{displayText}</p>
            )}
          </div>

          <span className="text-md text-gray-500">
            {timeAgo(activity.createdAt)}
          </span>
        </div>
      </div>

      <div
        className={`w-[110px] h-20
                  ${
                    typeof activity.post?.coverImageUrl === "string" &&
                    activity.post?.coverImageUrl.length > 0
                      ? " shrink-0 overflow-hidden rounded-sm border border-[#f0ebe7]"
                      : ""
                  }`}
      >
        {typeof activity.post?.coverImageUrl === "string" &&
          activity.post?.coverImageUrl.length > 0 && (
            <Image
              src={activity.post?.coverImageUrl}
              alt="Post cover"
              width={220}
              height={160}
              unoptimized
              className="w-full h-full object-cover"
            />
          )}
      </div>
    </div>
  );
}
