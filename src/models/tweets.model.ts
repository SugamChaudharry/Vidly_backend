import mongoose, { Schema, Types } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

export interface TweetDoc extends Document {
  content: string;
  owner: Types.ObjectId;
}

const tweetSchema = new Schema<TweetDoc>(
  {
    content: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

tweetSchema.plugin(mongooseAggregatePaginate);
export const Tweet = mongoose.model<TweetDoc>("Tweet", tweetSchema);
