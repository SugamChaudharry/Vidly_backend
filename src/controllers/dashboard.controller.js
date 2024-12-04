import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/likes.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const id = req.user._id;
  const video = await Video.find({ owner: id });
  let totalViews = 0;
  const totalVideos = video.length;
  for (let i = 0; i < video.length; i++) {
    totalViews += video[i].views;
  }
  const subscribers = await Subscription.find({ channel: id }).countDocuments();
  const totalLikes = await Like.aggregate([
    {
      $lookup: {
        from: "like",
        localField: id.toString(),
        foreignField: "video",
        as: "userVideoLike",
      },
    },
    {
      $lookup: {
        from: "like",
        localField: id.toString(),
        foreignField: "tweet",
        as: "userTweetLike",
      },
    },
    {
      $lookup: {
        from: "like",
        localField: id.toString(),
        foreignField: "comment",
        as: "userCommentLike",
      },
    },
    {
      $addFields: {
        totalVideosLikes: { $size: "$userVideoLike" },
        totalTweetsLikes: { $size: "$userTweetLike" },
        totalCommentsLikes: { $size: "$userCommentLike" },
      },
    },
    {
      $group: {
        _id: null,
        totalVideosLikes: { $sum: "$totalVideosLikes" },
        totalTweetsLikes: { $sum: "$totalTweetsLikes" },
        totalCommentsLikes: { $sum: "$totalCommentsLikes" },
      },
    },
    {
      $project: {
        _id: 0,
        totalVideosLikes: 1,
        totalTweetsLikes: 1,
        totalCommentsLikes: 1,
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
        subscribers: subscribers,
        totalLikes: totalLikes,
      },
      "stats fetch successfully"
    )
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find({ owner: req.user._id });
  res
    .status(200)
    .json(new ApiResponse(200, videos, "fetch all videos successfully"));
});

export { getChannelStats, getChannelVideos };
