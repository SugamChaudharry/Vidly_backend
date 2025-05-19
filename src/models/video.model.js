import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

// Define default tags as a constant that can be exported
export const DEFAULT_VIDEO_TAGS = [
  "Music",
  "Gaming",
  "News",
  "Sports",
  "Entertainment",
  "Education",
  "Technology",
];

const videoSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    description: {
      type: String,
    },
    title: {
      type: String,
      required: true,
    },
    videoFile: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: function(tags) {
          return tags && tags.length > 0;
        },
        message: "At least one tag is required"
      }
    },
  },
  { timestamps: true }
);

// Create text index for search
videoSchema.index({ title: "text", description: "text" });

// Create index for tag filtering
videoSchema.index({ tags: 1 });

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
