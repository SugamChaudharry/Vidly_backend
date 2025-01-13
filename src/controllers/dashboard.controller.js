import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweets.model.js";
import { Comment } from "../models/comments.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const id = req.user._id;
  const video = await Video.find({ owner: id });
  let totalViews = 0;
  const totalVideos = video.length;
  for (let i = 0; i < video.length; i++) {
    totalViews += video[i].views;
  }
  const subscribersCount = await Subscription.find({ channel: id }).countDocuments();
  const tweetsCount = await Tweet.find({ owner: id }).countDocuments();
  const playlistsCount = await Playlist.find({ owner: id }).countDocuments();
  const totalVideosLikes = await Video.aggregate([
    {
      $match: {
        owner: id,
      },
    },
    {
      $lookup: {
        from: "likes",
        foreignField: "video",
        localField: "_id",
        as: "videoLikes",
      },
    },
    {
      $project: {
        videoLikes: { $size: "$videoLikes" },
      },
    },
    {
      $group: {
        _id: null,
        totalLikes: { $sum: "$videoLikes" },
      },
    },
  ]);
  const totalTweetsLikes = await Tweet.aggregate([
    {
      $match: {
        owner: id,
      },
    },
    {
      $lookup: {
        from: "likes",
        foreignField: "tweet",
        localField: "_id",
        as: "tweetsLikes",
      },
    },
    {
      $project: {
        tweetsLike: { $size: "$tweetsLikes" },
      },
    },
    {
      $group: {
        _id: null,
        totalLikes: { $sum: "$tweetsLike" },
      },
    },
  ]);
  const totalCommentsLikes = await Tweet.aggregate([
    {
      $match: {
        owner: id,
      },
    },
    {
      $lookup: {
        from: "likes",
        foreignField: "tweet",
        localField: "_id",
        as: "commentLikes",
      },
    },
    {
      $project: {
        commentLike: { $size: "$commentLikes" },
      },
    },
    {
      $group: {
        _id: null,
        totalLikes: { $sum: "$commentLike" },
      },
    },
  ]);
  res.status(200).json(
    new ApiResponse(
      200,
      {
        id: id,
        totalViews: totalViews,
        totalVideos: totalVideos,
        subscribersCount,
        playlistsCount,
        tweetsCount,
        totalVideosLikes:
          totalVideosLikes.length > 0 ? totalVideosLikes[0].totalLikes : 0,
        totalTweetsLikes:
          totalTweetsLikes.length > 0 ? totalTweetsLikes[0].totalLikes : 0,
        totalCommentsLikes:
          totalCommentsLikes.length > 0 ? totalCommentsLikes[0].totalLikes : 0,
      },
      "stats fetch successfully"
    )
  );
});

export { getChannelStats };
