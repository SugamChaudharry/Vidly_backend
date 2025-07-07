import mongoose, { Schema, Types } from "mongoose";

export interface WatchHistoryDoc extends Document {
  user: Types.ObjectId;
  video: Types.ObjectId;
  watchedAt: Date;
}
const watchHistorySchema = new Schema<WatchHistoryDoc>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
      index: true,
    },
    watchedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

watchHistorySchema.index({ user: 1, watchedAt: -1 });

export const WatchHistory = mongoose.model<WatchHistoryDoc>(
  "WatchHistory",
  watchHistorySchema
);
