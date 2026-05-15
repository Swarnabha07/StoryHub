import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";

export async function PUT(request) {
  // AUTH
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  // PARSE FORMDATA
  const form = await request.formData(); 
  const file = form.get("file");
  const field = form.get("field");

  // FIELD VALIDATION
  if (!["profileImage", "coverImage"].includes(field)) {
    return new Response(JSON.stringify({ error: "Invalid field" }), {
      status: 400,
    });
  }

  if (!file) {
    return new Response(JSON.stringify({ error: "File missing" }), {
      status: 400,
    });
  }

  // CONNECT DB
  await connectDB();

  // BUCKET NAME
  const bucket = field === "coverImage" ? "Covers" : "Avatars";

  // CREATE FILE PATH
  const originalName = file.name;
  const ext = originalName.split(".").pop();
  const filePath = `${session.user.id}/${field}-${Date.now()}.${ext}`;

  // CONVERT TO BUFFER
  const fileArrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(fileArrayBuffer);

  // UPLOAD TO SUPABASE
  const { error: uploadError } = await supabaseAdmin.storage
    .from(bucket)
    .upload(filePath, fileBuffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return new Response(JSON.stringify({ error: uploadError.message }), {
      status: 500,
    });
  }

  // UPDATE DATABASE
  const update = {
    [`${field}Path`]: filePath, // permanent storage path
  };

  const user = await User.findOneAndUpdate(
    { _id: session.user.id },
    { $set: update },
    { returnDocument: "after" }
  );

  return new Response(
    JSON.stringify({
      success: true,
      user,
      filePath,
    }),
    { status: 200 }
  );
}
