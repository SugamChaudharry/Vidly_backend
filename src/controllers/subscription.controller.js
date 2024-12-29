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
  }).countDocuments();
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
    return res
      .status(200)
      .json(new ApiResponse(200, newSubscription, "Subscribed successfully"));
  }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(404, "Invalid channel ID");
  }
  const cId = new mongoose.Types.ObjectId(channelId);
  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: cId,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
        pipeline: [
          {
            $lookup: {
              from: "subscriptions",
              foreignField: "channel",
              localField: "_id",
              as: "subscribers",
            },
          },
          {
            $addFields: {
              subscribers: "$subscribers.subscriber",
            },
          },
          {
            $addFields: {
              subscriberCount: {
                $size: "$subscribers",
              },
              isSubscribed: {
                $cond: {
                  if: { $in: [cId, "$subscribers"] },
                  then: true,
                  else: false,
                },
              },
            },
          },
          {
            $project: {
              fullName: 1,
              userName: 1,
              avatar: 1,
              subscriberCount: 1,
              isSubscribed: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$subscriber",
    },
    {
      $replaceRoot: { newRoot: "$subscriber" },
    },
  ]);

  return res
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
  const subscriptions = await Subscription.aggregate([
    {
      $match: {
        subscriber: req.user._id,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channelinfo",
        pipeline: [
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribers",
            },
          },
          {
            $addFields: {
              subscribers: {
                $size: "$subscribers",
              },
            },
          },
          {
            $project: {
              subscribers: 1,
              userName: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$channelinfo",
    },
    {
      $replaceRoot: { newRoot: "$channelinfo" },
    },
  ]);

  res
    .status(200)
    .json(
      new ApiResponse(200, subscriptions, "channel list retrieved successfully")
    );
});

export {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
  getVideoSubscriber,
};
