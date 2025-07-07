import mongoose, { Schema, Types } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

export interface CommentDoc extends Document {
  content: string;
  video: Types.ObjectId;
  owner: Types.ObjectId;
}

const commentSchema = new Schema<CommentDoc>(
  {
    content: {
      type: String,
      required: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model<CommentDoc>("Comment", commentSchema);
