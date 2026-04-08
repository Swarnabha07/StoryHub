import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "POST_LIKE",
        "USER_FOLLOW",
        "POST_COMMENT",
        "COMMENT_REPLY",
        "COMMENT_LIKE",
      ],
      required: true,
    },

    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },

    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      index: true, // important for pagination
    },
  },
  { timestamps: false },
);

//For filtering and sorting
ActivitySchema.index({ targetUser: 1, createdAt: -1 });

export default mongoose.models.Activity ||
  mongoose.model("Activity", ActivitySchema);
