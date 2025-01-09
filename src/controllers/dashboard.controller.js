import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweets.model.js";
import { Subscription } from "../models/subscription.model.js";
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
  res.status(200).json(
    new ApiResponse(
      200,
      {
        id: id,
        totalViews: totalViews,
        totalVideos: totalVideos,
        subscribers: subscribers,
        totalVideosLikes:
          totalVideosLikes.length > 0 ? totalVideosLikes[0].totalLikes : 0,
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
