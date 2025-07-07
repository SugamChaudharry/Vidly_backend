import mongoose, { Schema, Types } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

export interface VideoDoc extends Document {
  owner: Types.ObjectId;
  description: string;
  title: string;
  videoFile: string;
  thumbnail: string;
  duration: number;
  views: number;
  isPublished: boolean;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
const videoSchema = new Schema<VideoDoc>(
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
        validator: function(tags: string[]) {
          return tags && tags.length > 0;
        },
        message: "At least one tag is required",
      },
    },
  },
  { timestamps: true }
);

videoSchema.index({ title: "text", description: "text" });

videoSchema.index({ tags: 1 });

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model<VideoDoc>("Video", videoSchema);
