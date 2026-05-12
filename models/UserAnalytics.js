import mongoose from "mongoose";

const UserAnalyticsSchema = new mongoose.Schema(
  {
    user: {
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

    followersGained: {
      type: Number,
      default: 0,
    },

    followersLost: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// One document per user per day
UserAnalyticsSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.models.UserAnalytics ||
  mongoose.model("UserAnalytics", UserAnalyticsSchema);
