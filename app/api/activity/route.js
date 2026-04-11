import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db";
import Activity from "@/models/Activity";
import { authOptions } from "../auth/[...nextauth]/route";
import { getSignedProfileImage } from "@/actions/getSignedProfileImage";
import { getSignedPostImage } from "@/actions/getSignedPostImage";
import Comment from "@/models/Comment";
import Post from "@/models/Post";

const AGGREGATE_TYPES = ["POST_LIKE", "COMMENT_LIKE"];

export async function GET(req) {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ activities: [] }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const cursor = searchParams.get("cursor");

  const limit = 10;
  const query = {
    targetUser: session.user.id,
  };

  if (cursor) {
    query.createdAt = { $lt: new Date(cursor) };
  }

  const activities = await Activity.find(query)
    .sort({ createdAt: -1 })
    .limit(limit + 1)
    .populate("actor", "username profileImagePath")
    .populate("post", "slug title coverImagePath")
    .populate("comment", "content")
    .lean();

  let hasMore = false;
  let nextCursor = null;

  if (activities.length > limit) {
    hasMore = true;
    nextCursor = activities[limit - 1].createdAt.toISOString();
    activities.pop();
  }

  const grouped = {};
  const aggregatedActivities = [];

  for (const activity of activities) {
    // only aggregate likes
    if (!AGGREGATE_TYPES.includes(activity.type)) {
      aggregatedActivities.push(activity);
      continue;
    }

    const key = `${activity.type}_${activity.post?._id?.toString() || ""}_${activity.comment?._id?.toString() || ""}`;

    if (!grouped[key]) {
      grouped[key] = {
        ...activity,
        actors: [activity.actor],
        activityIds: [activity._id],
        count: 1,
      };

      aggregatedActivities.push(grouped[key]);
    } else {
      grouped[key].actors.push(activity.actor);
      grouped[key].activityIds.push(activity._id);
      grouped[key].count += 1;
    }
  }

  const activitiesWithImages = await Promise.all(
    aggregatedActivities.map(async (activity) => {
      let actorProfileImageUrl = null;
      let coverImageUrl = null;

      const actor = activity.actors ? activity.actors[0] : activity.actor;

      // Attach actor.profileImageUrl
      if (actor?.profileImagePath) {
        const signed = await getSignedProfileImage(actor._id);
        actorProfileImageUrl = signed?.profileImage || null;
      }

      // Generate signed images for aggregated actors
      let actorsWithImages = [];

      if (activity.actors) {
        actorsWithImages = await Promise.all(
          activity.actors.slice(0, 3).map(async (a) => {
            let imageUrl = null;

            if (a.profileImagePath) {
              const signed = await getSignedProfileImage(a._id);
              imageUrl = signed?.profileImage || null;
            }

            return {
              ...a,
              profileImageUrl: imageUrl,
            };
          }),
        );
      }

      // Attach post.coverImageUrl
      if (activity.post?.coverImagePath) {
        coverImageUrl = await getSignedPostImage(activity.post.coverImagePath);
      }

      return {
        ...activity,
        actor: actor
          ? {
              ...actor,
              profileImageUrl: actorProfileImageUrl,
            }
          : null,
        actors: actorsWithImages,
        post: activity.post
          ? {
              ...activity.post,
              coverImageUrl,
            }
          : null,
      };
    }),
  );

  return NextResponse.json({
    activities: activitiesWithImages,
    nextCursor,
    hasMore,
  });
}
