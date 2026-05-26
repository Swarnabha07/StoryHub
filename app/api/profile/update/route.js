import { authOptions } from "../../auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import { sanitizePlainText } from "@/lib/security/sanitizePlainText";
import User from "@/models/User";
import { getServerSession } from "next-auth";

export async function PUT(req) {
  try {
    // 1️ Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    // 2️ Parse & sanitize input
    const { name, username, bio } = await req.json();

    if (
      typeof name !== "string" ||
      typeof username !== "string" ||
      (bio !== undefined && bio !== null && typeof bio !== "string")
    ) {
      return new Response(JSON.stringify({ error: "Invalid input type" }), {
        status: 400,
      });
    }

    const sanitizedName = sanitizePlainText(name);
    const sanitizedUsername = sanitizePlainText(username);
    const sanitizedBio = bio != null ? sanitizePlainText(bio) : null;

    const cleanName = sanitizedName?.trim();
    const cleanUsername = sanitizedUsername?.trim().toLowerCase();
    const cleanBio = sanitizedBio?.trim();

    // 3️ Basic validation
    if (!cleanUsername || !cleanName) {
      return new Response(
        JSON.stringify({ error: "Username and Name are required" }),
        {
          status: 400,
        },
      );
    }

    const usernameRegex = /^[a-z0-9._]+$/;

    if (!usernameRegex.test(cleanUsername)) {
      return new Response(JSON.stringify({ error: "Invalid Username" }), {
        status: 422,
      });
    }

    if (cleanUsername.length < 3) {
      return new Response(JSON.stringify({ error: "Username is too short" }), {
        status: 400,
      });
    }

    if (cleanUsername.length > 30) {
      return new Response(JSON.stringify({ error: "Username is too long" }), {
        status: 400,
      });
    }

    if (cleanName.length < 3) {
      return new Response(JSON.stringify({ error: "Name is too short" }), {
        status: 400,
      });
    }

    if (cleanName.length > 50) {
      return new Response(JSON.stringify({ error: "Name is too long" }), {
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
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        name: cleanName,
        username: cleanUsername,
        bio: cleanBio,
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!updatedUser) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    // 6️ Success response
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Profile updation error :- ", error);

    if (error.code === 11000) {
      return new Response(JSON.stringify({ error: "Username already taken" }), {
        status: 409,
      });
    }

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
