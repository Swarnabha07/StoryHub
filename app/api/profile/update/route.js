import { authOptions } from "../../auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth";

export async function PUT(req) {
  // 1️ Auth check
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  // 2️ Parse & sanitize input
  const { name, username, bio } = await req.json();

  const cleanName = name?.trim();
  const cleanUsername = username?.trim();
  const cleanBio = bio?.trim();

  // 3️ Basic validation
  if (!cleanUsername || !cleanName) {
    return new Response(
      JSON.stringify({ error: "Username and Name are required" }),
      {
        status: 400,
      },
    );
  }

  if (cleanUsername.length < 3) {
    return new Response(JSON.stringify({ error: "Username is too short" }), {
      status: 400,
    });
  }

  if (cleanName.length < 5) {
    return new Response(JSON.stringify({ error: "Name is too short" }), {
      status: 400,
    });
  }

  if (cleanBio && cleanBio.length > 400) {
    return new Response(JSON.stringify({ error: "Bio too long" }), {
      status: 400,
    });
  }

  await connectDB();

  // 4️ Check username uniqueness (excluding self)
  const existingUser = await User.findOne({
    username: cleanUsername,
    _id: { $ne: session.user.id },
  });

  if (existingUser) {
    return new Response(JSON.stringify({ error: "Username already taken" }), {
      status: 409,
    });
  }

  // 5️ Update allowed fields only
  await User.findByIdAndUpdate(
    session.user.id,
    {
      name: cleanName,
      username: cleanUsername,
      bio: cleanBio,
    },
    { new: true },
  );

  // 6️ Success response
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
