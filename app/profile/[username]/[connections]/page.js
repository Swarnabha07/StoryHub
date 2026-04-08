import { getServerSession } from "next-auth";
import { getUserConnections } from "@/lib/connections/getFollowersOrFollowing";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { fetchUser } from "@/actions/useractions";
import ProfileNotFound from "@/components/shared/profile/ProfileNotFound";
import ConnectionsClient from "@/components/page/ConnectionsClient";
import { getMutualFollowers } from "@/lib/connections/getMutualFollowers";
import { redirect } from "next/navigation";
import { getSuggestedUsers } from "@/lib/connections/getSuggestedUsers";
import { attachProfileImages } from "@/lib/attachProfileImages";

export default async function ConnectionsPage({ params }) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/");

  const { username, connections } = await params;

  if (
    !["followers", "following", "mutuals", "suggested"].includes(connections)
  ) {
    return <ProfileNotFound />;
  }

  const profileUser = await fetchUser(username);
  if (!profileUser) {
    return <ProfileNotFound />;
  }

  let result;

  if (connections === "followers" || connections === "following") {
    result = await getUserConnections({
      username,
      type: connections,
      viewerId: session?.user?.id,
      limit: 10,
    });
  } else if (connections === "mutuals") {
    result = await getMutualFollowers({
      username,
      viewerId: session?.user?.id,
      limit: 10,
    });
  } else if (connections === "suggested") {
    result = await getSuggestedUsers({
      viewerId: session?.user?.id,
      limit: 10,
    });
  }

  if (!result) {
    return <ProfileNotFound />;
  }

  const usersWithImages = await attachProfileImages(result.users);

  return (
    <ConnectionsClient
      initialUsers={usersWithImages}
      nextCursor={result.nextCursor}
      initialHasMore={result.hasMore}
      type={connections}
      profileUser={{
        username: profileUser.username,
        name: profileUser.name,
        typeCount:
          connections === "followers"
            ? profileUser.followersCount
            : connections === "following"
              ? profileUser.followingCount
              : result.mutualFollowersCount,
      }}
    />
  );
}
