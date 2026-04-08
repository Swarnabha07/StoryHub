import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-z0-9._]+$/, // Instagram-style usernames
    },

    bio: {
      type: String,
      default: "",
      maxlength: 200,
    },

    profileImagePath: {
      type: String,
      default: "",
    }, // supabase storage path

    coverImagePath: {
      type: String,
      default: "",
    }, // supabase storage path

    providers: {
      type: [String],
      default: [],
    }, // google / github etc.

    emailPreferences: {
      comments: { type: Boolean, default: true },
      replies: { type: Boolean, default: true },
      follows: { type: Boolean, default: true },
      likes: { type: Boolean, default: false },
    },

    bookmarks: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Post",
      default: [],
    },

    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    followersCount: {
      type: Number,
      default: 0,
    },

    followingCount: {
      type: Number,
      default: 0,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Text search
UserSchema.index({
  username: "text",
  name: "text",
  bio: "text",
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
