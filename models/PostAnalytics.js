import mongoose from "mongoose";

const PostAnalyticsSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      index: true,
      required: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },

    date: {
      type: String, // "YYYY-MM-DD"
      required: true,
      index: true,
    },

    views: {
      type: Number,
      default: 0,
    },

    uniqueViews: {
      type: Number,
      default: 0,
    },

    likes: {
      type: Number,
      default: 0,
    },

    comments: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// prevent duplicate per day per post
PostAnalyticsSchema.index({ post: 1, author: 1, date: 1 }, { unique: true });

export default mongoose.models.PostAnalytics ||
  mongoose.model("PostAnalytics", PostAnalyticsSchema);
