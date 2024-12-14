import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoSubscriber = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(channelId))
    throw new ApiError(404, "invalid channel id");

  const subscribers = await Subscription.find({
    channel: channelId,
  });
  const subscribeByUser = await Subscription.findOne({
    channel: channelId,
    subscriber: req.user._id,
  }).countDocuments();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscribers, subscribeByUser: subscribeByUser > 0 ? true : false },
        "success"
      )
    );
});

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(channelId))
    throw new ApiError(404, "not valid user id");
  if (channelId == req.user._id)
    return res
      .status(400)
      .json(
        new ApiResponse(400, {}, "You cannot subscribe to your own channel")
      );

  const existingSubscription = await Subscription.findOne({
    channel: channelId,
    subscriber: req.user._id,
  });

  if (existingSubscription) {
    await Subscription.deleteOne({ _id: existingSubscription._id });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Unsubscribed successfully"));
  } else {
    const newSubscription = await Subscription.create({
      channel: channelId,
      subscriber: req.user._id,
    });
    res
      .status(200)
      .json(new ApiResponse(200, newSubscription, "Subscribed successfully"));
  }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(404, "Invalid channel ID");
  }

  const subscriptions = await Subscription.find({
    channel: channelId,
  }).populate("subscriber", "fullName userName avatar");

  if (!subscriptions || subscriptions.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, [], "No subscribers found for this channel"));
  }

  const subscribers = subscriptions.map(
    (subscription) => subscription.subscriber
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribers,
        "Subscribers list retrieved successfully"
      )
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(subscriberId)) {
    throw new ApiError(404, "Invalid subscribed ID");
  }

  const subscriptions = await Subscription.find({
    subscriber: subscriberId,
  }).populate("channel", "fullName userName avatar");

  if (!subscriptions || subscriptions.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, [], "No channels found for this user"));
  }

  const channel = subscriptions.map((subscription) => subscription.channel);

  res
    .status(200)
    .json(new ApiResponse(200, channel, "channel list retrieved successfully"));
});

export {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
  getVideoSubscriber,
};
