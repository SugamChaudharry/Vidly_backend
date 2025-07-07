import Mongoose, { Schema, Types } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

export interface SubscriptionDoc extends Document {
  subscriber: Types.ObjectId;
  channel: Types.ObjectId;
}

const subscriptionSchema = new Schema<SubscriptionDoc>(
  {
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

subscriptionSchema.plugin(mongooseAggregatePaginate);
export const Subscription = Mongoose.model<SubscriptionDoc>(
  "Subscription",
  subscriptionSchema
);
