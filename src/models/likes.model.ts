import mongoose, { Schema, Types } from "mongoose";

export interface LikeDoc extends Document {
  comments: Types.ObjectId;
  video: Types.ObjectId;
  likedBy: Types.ObjectId;
  tweet: Types.ObjectId;
}

const likesSchema = new Schema<LikeDoc>(
  {
    comments: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    tweet: {
      type: Schema.Types.ObjectId,
      ref: "Tweet",
    },
  },
  { timestamps: true }
);

export const Like = mongoose.model<LikeDoc>("Like", likesSchema);
