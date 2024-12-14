import mongoose from "mongoose";
import { Like } from "../models/likes.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideosLikes = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(videoId))
    throw new ApiError(404, "not valid video id");

  const likeCount = await Like.find({
    video: videoId,
  }).countDocuments();
  const likedByUser = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  }).countDocuments();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { likeCount, likedByUser: likedByUser > 0 ? true : false },
        "success"
      )
    );
});

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(videoId))
    throw new ApiError(404, "not valid video id");

  const alreadyLiked = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  if (alreadyLiked) {
    await Like.deleteOne({ _id: alreadyLiked._id });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "unLike successfully"));
  } else {
    const newLike = await Like.create({
      video: videoId,
      likedBy: req.user._id,
    });
    res.status(200).json(new ApiResponse(200, newLike, "liked successfully"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(commentId))
    throw new ApiError(404, "not valid video id");

  const alreadyLiked = await Like.findOne({
    comments: commentId,
    likedBy: req.user._id,
  });

  if (alreadyLiked) {
    await Like.deleteOne({ _id: alreadyLiked._id });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "unLike successfully"));
  } else {
    const newLike = await Like.create({
      comments: commentId,
      likedBy: req.user._id,
    });
    res.status(200).json(new ApiResponse(200, newLike, "liked successfully"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(tweetId))
    throw new ApiError(404, "not valid video id");

  const alreadyLiked = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  if (alreadyLiked) {
    await Like.deleteOne({ _id: alreadyLiked._id });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "unLike successfully"));
  } else {
    const newLike = await Like.create({
      tweet: tweetId,
      likedBy: req.user._id,
    });
    res.status(200).json(new ApiResponse(200, newLike, "liked successfully"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.find({ likedBy: req.user.id }).populate(
    "video"
  );
  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "got all liked videos successfully")
    );
});

export {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos,
  getVideosLikes,
};
