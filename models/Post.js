import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    content: {
      type: String,
      required: true,
    },

    excerpt: {
      type: String,
      maxlength: 300,
      required: true,
      default: "",
    },

    coverImagePath: {
      type: String,
      default: "",
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["draft", "scheduled", "published"],
      default: "draft",
      index: true,
    },

    scheduledFor: {
      type: Date,
      default: null,
      index: true,
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    tags: {
      type: [String],
      default: [],
      index: true,
    },

    readingTime: {
      type: Number, // minutes
      default: 0,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },

    likesCount: {
      type: Number,
      default: 0,
    },

    viewsCount: {
      type: Number,
      default: 0,
      index: true,
    },

    uniqueViewsCount: {
      type: Number,
      default: 0,
    },

    commentsCount: {
      type: Number,
      default: 0,
    },

    lastViewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for profile / author pages
PostSchema.index({ author: 1, status: 1, createdAt: -1 });

//for schedule posts query
PostSchema.index({ status: 1, scheduledFor: 1 });

// Prefix search (autocomplete)
PostSchema.index({ title: 1 });

// Text search
PostSchema.index({
  title: "text",
  excerpt: "text",
  tags: "text",
});

export default mongoose.models.Post || mongoose.model("Post", PostSchema);
