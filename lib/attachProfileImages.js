import { getSignedProfileImage } from "@/actions/getSignedProfileImage";

export async function attachProfileImages(users) {
  return Promise.all(
    users.map(async (user) => {
      if (!user.profileImagePath) return user;

      const signed = await getSignedProfileImage(user._id);
      return {
        ...user,
        profileImagePath : null,
        profileImageUrl: signed?.profileImage || null,
      };
    }),
  );
}
